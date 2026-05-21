from __future__ import annotations

import hashlib
import uuid

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from app.core.config import settings

COLLECTION_NAME = "candidate_profiles"
VECTOR_SIZE = 384


class EmbeddingService:
    def __init__(self):
        self._model = None
        self._qdrant = None

    @property
    def model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._model

    @property
    def qdrant(self) -> QdrantClient:
        if self._qdrant is None:
            self._qdrant = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
            self._ensure_collection()
        return self._qdrant

    def _ensure_collection(self):
        collections = [c.name for c in self._qdrant.get_collections().collections]
        if COLLECTION_NAME not in collections:
            self._qdrant.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )

    def encode(self, text: str) -> np.ndarray:
        return self.model.encode(text, normalize_embeddings=True)

    def encode_batch(self, texts: list[str]) -> np.ndarray:
        return self.model.encode(texts, normalize_embeddings=True, batch_size=32)

    def text_hash(self, text: str) -> str:
        return hashlib.sha256(text.encode()).hexdigest()

    def upsert_candidate(self, candidate_id: str, text: str, metadata: dict | None = None) -> str:
        vector = self.encode(text)
        point_id = str(uuid.uuid4())
        payload = {"candidate_id": candidate_id, **(metadata or {})}
        self.qdrant.upsert(
            collection_name=COLLECTION_NAME,
            points=[PointStruct(id=point_id, vector=vector.tolist(), payload=payload)],
        )
        return point_id

    def search_similar(self, query_text: str, limit: int = 10) -> list[dict]:
        vector = self.encode(query_text)
        results = self.qdrant.search(
            collection_name=COLLECTION_NAME,
            query_vector=vector.tolist(),
            limit=limit,
        )
        return [
            {"candidate_id": r.payload.get("candidate_id"), "score": r.score, "point_id": r.id}
            for r in results
        ]

    def find_similar_to_candidate(self, candidate_text: str, limit: int = 10) -> list[dict]:
        return self.search_similar(candidate_text, limit=limit)


embedding_service = EmbeddingService()
