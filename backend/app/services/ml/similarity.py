from __future__ import annotations

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


def compute_cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    if vec_a.ndim == 1:
        vec_a = vec_a.reshape(1, -1)
    if vec_b.ndim == 1:
        vec_b = vec_b.reshape(1, -1)
    return float(cosine_similarity(vec_a, vec_b)[0][0])


def batch_cosine_similarity(query_vec: np.ndarray, candidate_vecs: np.ndarray) -> np.ndarray:
    if query_vec.ndim == 1:
        query_vec = query_vec.reshape(1, -1)
    return cosine_similarity(query_vec, candidate_vecs).flatten()
