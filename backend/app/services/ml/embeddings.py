from __future__ import annotations

import hashlib
import logging
import uuid

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from app.core.config import settings

COLLECTION_NAME = "candidate_profiles"
VECTOR_SIZE = 384
logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self):
        self._model = None
        self._qdrant = None
        self._qdrant_available = True

    @property
    def model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._model

    @property
    def qdrant(self) -> QdrantClient | None:
        if not self._qdrant_available:
            return None
        if self._qdrant is None:
            try:
                if settings.QDRANT_URL:
                    self._qdrant = QdrantClient(
                        url=settings.QDRANT_URL,
                        api_key=settings.QDRANT_API_KEY or None,
                    )
                else:
                    self._qdrant = QdrantClient(
                        host=settings.QDRANT_HOST,
                        port=settings.QDRANT_PORT,
                    )
                self._ensure_collection()
            except Exception as e:
                logger.warning("Qdrant unavailable, vector search disabled: %s", e)
                self._qdrant_available = False
                return None
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

    def upsert_candidate(self, candidate_id: str, text: str, metadata: dict | None = None) -> str | None:
        vector = self.encode(text)
        point_id = str(uuid.uuid4())
        payload = {"candidate_id": candidate_id, **(metadata or {})}
        client = self.qdrant
        if client is None:
            return None
        try:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=[PointStruct(id=point_id, vector=vector.tolist(), payload=payload)],
            )
            return point_id
        except Exception as e:
            logger.warning("Qdrant upsert failed: %s", e)
            return None

    def search_similar(self, query_text: str, limit: int = 10) -> list[dict]:
        vector = self.encode(query_text)
        client = self.qdrant
        if client is None:
            return []
        try:
            results = client.search(
                collection_name=COLLECTION_NAME,
                query_vector=vector.tolist(),
                limit=limit,
            )
            return [
                {"candidate_id": r.payload.get("candidate_id"), "score": r.score, "point_id": r.id}
                for r in results
            ]
        except Exception as e:
            logger.warning("Qdrant search failed: %s", e)
            return []

    def find_similar_to_candidate(self, candidate_text: str, limit: int = 10) -> list[dict]:
        return self.search_similar(candidate_text, limit=limit)


embedding_service = EmbeddingService()
