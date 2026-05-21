from __future__ import annotations

import numpy as np

from app.services.ml.embeddings import embedding_service
from app.services.ml.profile_vectorizer import build_profile_text
from app.services.ml.similarity import compute_cosine_similarity


class RankingService:
    def rank_candidates(
        self,
        query: str,
        parsed_query: dict,
        candidates: list[dict],
    ) -> list[dict]:
        if not candidates:
            return []

        query_vec = embedding_service.encode(query)

        profile_texts = [build_profile_text(c) for c in candidates]
        candidate_vecs = embedding_service.encode_batch(profile_texts)

        scored = []
        for i, candidate in enumerate(candidates):
            semantic = compute_cosine_similarity(query_vec, candidate_vecs[i]) * 50
            activity = self._score_activity(candidate) * 15 / 100
            experience = self._score_experience(candidate, parsed_query) * 15 / 100
            location = self._score_location(candidate, parsed_query) * 10 / 100
            bonus = self._score_bonus(candidate) * 10 / 100

            total = semantic + activity + experience + location + bonus
            total = min(total, 100.0)

            candidate["match_score"] = round(total, 2)
            candidate["score_breakdown"] = {
                "semantic_score": round(semantic, 2),
                "activity_score": round(activity * 100 / 15, 2),
                "experience_score": round(experience * 100 / 15, 2),
                "location_score": round(location * 100 / 10, 2),
                "bonus_score": round(bonus * 100 / 10, 2),
            }
            scored.append(candidate)

        scored.sort(key=lambda c: c["match_score"], reverse=True)
        for rank, c in enumerate(scored, 1):
            c["rank"] = rank

        return scored

    def _score_activity(self, candidate: dict) -> float:
        commits = candidate.get("github_commits_last_year", 0)
        repos = candidate.get("github_repos", 0)
        commit_score = min(commits / 200, 1.0) * 60
        repo_score = min(repos / 30, 1.0) * 40
        return commit_score + repo_score

    def _score_experience(self, candidate: dict, parsed: dict) -> float:
        years = candidate.get("years_experience")
        if years is None:
            return 50

        target_level = parsed.get("experience_level")
        target_years = parsed.get("years_experience")

        if target_years is not None:
            diff = abs(years - target_years)
            if diff == 0:
                return 100
            elif diff <= 2:
                return 80
            elif diff <= 5:
                return 50
            return 20

        if target_level == "senior" and years >= 5:
            return 100
        elif target_level == "mid" and 3 <= years <= 7:
            return 100
        elif target_level == "junior" and years <= 3:
            return 100

        return 50

    def _score_location(self, candidate: dict, parsed: dict) -> float:
        target = parsed.get("location")
        if not target:
            return 70

        candidate_loc = (candidate.get("location") or "").lower()
        target_lower = target.lower()

        if target_lower in candidate_loc or candidate_loc in target_lower:
            return 100

        target_parts = set(target_lower.split())
        loc_parts = set(candidate_loc.split(",")) | set(candidate_loc.split())
        if target_parts & loc_parts:
            return 70

        return 20

    def _score_bonus(self, candidate: dict) -> float:
        score = 0
        profile = candidate.get("profile_data", {})

        if profile.get("blog"):
            score += 30
        if profile.get("twitter_username"):
            score += 10
        if profile.get("hireable"):
            score += 30
        followers = profile.get("followers", 0)
        score += min(followers / 100, 1.0) * 30

        return min(score, 100)


ranking_service = RankingService()
