from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate, SearchResult, CandidateEmbedding
from app.models.search import Search
from app.services.github_service import github_service
from app.services.enrichment_service import enrichment_service
from app.services.ranking_service import ranking_service
from app.services.ml.query_parser import query_parser
from app.services.ml.embeddings import embedding_service
from app.services.ml.profile_vectorizer import build_profile_text


class SearchOrchestrator:
    async def execute_search(
        self,
        db: AsyncSession,
        user_id: str,
        query: str,
        filters: dict | None = None,
    ) -> dict:
        parsed = query_parser.parse(query)

        search = Search(
            user_id=uuid.UUID(user_id),
            query_text=query,
            filters=filters or parsed,
        )
        db.add(search)
        await db.flush()

        raw_users = await github_service.search_users(
            technologies=parsed["technologies"],
            location=parsed.get("location"),
            max_results=50,
        )

        candidates_data = []
        for user_data in raw_users:
            candidate_dict = await github_service.build_candidate_from_github(user_data)
            if not candidate_dict:
                continue

            candidate_dict = await enrichment_service.enrich_profile(candidate_dict)
            candidates_data.append(candidate_dict)

        db_candidates = []
        for cd in candidates_data:
            existing = await db.execute(
                select(Candidate).where(Candidate.github_username == cd["github_username"])
            )
            candidate = existing.scalar_one_or_none()

            if candidate:
                for key in ["full_name", "location", "current_role", "current_company",
                            "tech_stack", "years_experience", "github_repos",
                            "github_commits_last_year", "bio", "profile_data"]:
                    if cd.get(key) is not None:
                        setattr(candidate, key, cd[key])
                candidate.last_enriched_at = datetime.now(timezone.utc)
            else:
                candidate = Candidate(
                    github_username=cd["github_username"],
                    github_url=cd.get("github_url"),
                    full_name=cd.get("full_name"),
                    location=cd.get("location"),
                    current_role=cd.get("current_role"),
                    current_company=cd.get("current_company"),
                    tech_stack=cd.get("tech_stack", []),
                    years_experience=cd.get("years_experience"),
                    github_repos=cd.get("github_repos"),
                    github_commits_last_year=cd.get("github_commits_last_year"),
                    bio=cd.get("bio"),
                    profile_data=cd.get("profile_data"),
                    last_enriched_at=datetime.now(timezone.utc),
                )
                db.add(candidate)

            await db.flush()

            profile_text = build_profile_text(cd)
            try:
                point_id = embedding_service.upsert_candidate(
                    str(candidate.id), profile_text
                )
                existing_emb = await db.execute(
                    select(CandidateEmbedding).where(
                        CandidateEmbedding.candidate_id == candidate.id
                    )
                )
                emb = existing_emb.scalar_one_or_none()
                if emb:
                    emb.qdrant_point_id = uuid.UUID(point_id)
                    emb.source_text_hash = embedding_service.text_hash(profile_text)
                    emb.updated_at = datetime.now(timezone.utc)
                else:
                    emb = CandidateEmbedding(
                        candidate_id=candidate.id,
                        model_version=embedding_service.model.get_sentence_embedding_dimension().__class__.__name__,
                        source_text_hash=embedding_service.text_hash(profile_text),
                        qdrant_point_id=uuid.UUID(point_id),
                    )
                    db.add(emb)
            except Exception:
                pass

            cd["id"] = str(candidate.id)
            db_candidates.append(cd)

        ranked = ranking_service.rank_candidates(query, parsed, db_candidates)

        for cd in ranked[:10]:
            sr = SearchResult(
                search_id=search.id,
                candidate_id=uuid.UUID(cd["id"]),
                match_score=cd["match_score"],
                score_breakdown=cd.get("score_breakdown"),
                rank=cd["rank"],
            )
            db.add(sr)

        await db.commit()

        top_results = []
        for cd in ranked[:10]:
            highlights = self._generate_highlights(cd, parsed)
            top_results.append({
                "id": cd["id"],
                "rank": cd["rank"],
                "match_score": cd["match_score"],
                "score_breakdown": cd.get("score_breakdown"),
                "github_username": cd.get("github_username"),
                "github_url": cd.get("github_url"),
                "full_name": cd.get("full_name"),
                "location": cd.get("location"),
                "current_role": cd.get("current_role"),
                "current_company": cd.get("current_company"),
                "tech_stack": cd.get("tech_stack", []),
                "years_experience": cd.get("years_experience"),
                "github_repos": cd.get("github_repos"),
                "github_commits_last_year": cd.get("github_commits_last_year"),
                "bio": cd.get("bio"),
                "highlights": highlights,
            })

        return {
            "search_id": str(search.id),
            "query": query,
            "parsed": parsed,
            "total_results": len(ranked),
            "candidates": top_results,
        }

    def _generate_highlights(self, candidate: dict, parsed: dict) -> str:
        parts = []
        tech_match = set(t.lower() for t in candidate.get("tech_stack", [])) & set(
            t.lower() for t in parsed.get("technologies", [])
        )
        if tech_match:
            parts.append(f"Works with {', '.join(tech_match)}")

        commits = candidate.get("github_commits_last_year", 0)
        if commits > 100:
            parts.append("Highly active on GitHub")

        if candidate.get("profile_data", {}).get("hireable"):
            parts.append("Open to opportunities")

        if not parts:
            repos = candidate.get("github_repos", 0)
            parts.append(f"{repos} public repositories")

        return ". ".join(parts)


search_orchestrator = SearchOrchestrator()
