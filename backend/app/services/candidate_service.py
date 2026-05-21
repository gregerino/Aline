from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate, CandidatePool


class CandidateService:
    async def get_candidate(self, db: AsyncSession, candidate_id: str) -> Candidate | None:
        result = await db.execute(
            select(Candidate).where(Candidate.id == uuid.UUID(candidate_id))
        )
        return result.scalar_one_or_none()

    async def add_to_pool(
        self,
        db: AsyncSession,
        user_id: str,
        candidate_id: str,
        search_id: str | None = None,
    ) -> CandidatePool:
        entry = CandidatePool(
            user_id=uuid.UUID(user_id),
            candidate_id=uuid.UUID(candidate_id),
            search_id=uuid.UUID(search_id) if search_id else None,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry

    async def get_pool(self, db: AsyncSession, user_id: str) -> list[dict]:
        result = await db.execute(
            select(CandidatePool, Candidate)
            .join(Candidate, CandidatePool.candidate_id == Candidate.id)
            .where(CandidatePool.user_id == uuid.UUID(user_id))
            .order_by(CandidatePool.created_at.desc())
        )
        entries = []
        for pool_entry, candidate in result.all():
            entries.append({
                "id": str(pool_entry.id),
                "candidate_id": str(pool_entry.candidate_id),
                "search_id": str(pool_entry.search_id) if pool_entry.search_id else None,
                "status": pool_entry.status,
                "notes": pool_entry.notes,
                "created_at": pool_entry.created_at.isoformat(),
                "updated_at": pool_entry.updated_at.isoformat(),
                "candidate": {
                    "id": str(candidate.id),
                    "github_username": candidate.github_username,
                    "github_url": candidate.github_url,
                    "full_name": candidate.full_name,
                    "location": candidate.location,
                    "current_role": candidate.current_role,
                    "current_company": candidate.current_company,
                    "tech_stack": candidate.tech_stack or [],
                    "years_experience": candidate.years_experience,
                    "github_repos": candidate.github_repos,
                    "github_commits_last_year": candidate.github_commits_last_year,
                    "bio": candidate.bio,
                    "profile_data": candidate.profile_data,
                },
            })
        return entries

    async def update_pool_entry(
        self,
        db: AsyncSession,
        entry_id: str,
        user_id: str,
        status: str | None = None,
        notes: str | None = None,
    ) -> CandidatePool | None:
        result = await db.execute(
            select(CandidatePool).where(
                CandidatePool.id == uuid.UUID(entry_id),
                CandidatePool.user_id == uuid.UUID(user_id),
            )
        )
        entry = result.scalar_one_or_none()
        if not entry:
            return None
        if status is not None:
            entry.status = status
        if notes is not None:
            entry.notes = notes
        entry.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(entry)
        return entry

    async def remove_from_pool(self, db: AsyncSession, entry_id: str, user_id: str) -> bool:
        result = await db.execute(
            select(CandidatePool).where(
                CandidatePool.id == uuid.UUID(entry_id),
                CandidatePool.user_id == uuid.UUID(user_id),
            )
        )
        entry = result.scalar_one_or_none()
        if not entry:
            return False
        await db.delete(entry)
        await db.commit()
        return True


candidate_service = CandidateService()
