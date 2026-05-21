from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.candidate import (
    CandidateDetailResponse,
    PoolAddRequest,
    PoolUpdateRequest,
    PoolEntryResponse,
)
from app.api.dependencies import get_current_user
from app.services.candidate_service import candidate_service
from app.services.ml.embeddings import embedding_service
from app.services.ml.profile_vectorizer import build_profile_text

router = APIRouter(prefix="/api", tags=["candidates"])


@router.get("/candidates/{candidate_id}", response_model=CandidateDetailResponse)
async def get_candidate(
    candidate_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    candidate = await candidate_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return CandidateDetailResponse(
        id=str(candidate.id),
        github_username=candidate.github_username,
        github_url=candidate.github_url,
        full_name=candidate.full_name,
        location=candidate.location,
        current_role=candidate.current_role,
        current_company=candidate.current_company,
        tech_stack=candidate.tech_stack or [],
        years_experience=candidate.years_experience,
        github_repos=candidate.github_repos,
        github_commits_last_year=candidate.github_commits_last_year,
        bio=candidate.bio,
        profile_data=candidate.profile_data,
    )


@router.get("/candidates/{candidate_id}/similar")
async def find_similar(
    candidate_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    candidate = await candidate_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    profile_text = build_profile_text({
        "full_name": candidate.full_name,
        "current_role": candidate.current_role,
        "current_company": candidate.current_company,
        "bio": candidate.bio,
        "tech_stack": candidate.tech_stack,
        "location": candidate.location,
        "years_experience": candidate.years_experience,
    })

    try:
        results = embedding_service.find_similar_to_candidate(profile_text, limit=10)
        similar_ids = [r["candidate_id"] for r in results if r["candidate_id"] != candidate_id]
        similar_candidates = []
        for cid in similar_ids[:5]:
            c = await candidate_service.get_candidate(db, cid)
            if c:
                similar_candidates.append({
                    "id": str(c.id),
                    "full_name": c.full_name,
                    "location": c.location,
                    "current_role": c.current_role,
                    "tech_stack": c.tech_stack or [],
                    "github_url": c.github_url,
                    "similarity_score": next(
                        (r["score"] for r in results if r["candidate_id"] == cid), 0
                    ),
                })
        return {"similar_candidates": similar_candidates}
    except Exception:
        return {"similar_candidates": [], "error": "Similarity search unavailable"}


@router.post("/pool", response_model=PoolEntryResponse)
async def add_to_pool(
    body: PoolAddRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = await candidate_service.add_to_pool(
        db, str(user.id), body.candidate_id, body.search_id
    )
    candidate = await candidate_service.get_candidate(db, body.candidate_id)
    return PoolEntryResponse(
        id=str(entry.id),
        candidate_id=str(entry.candidate_id),
        search_id=str(entry.search_id) if entry.search_id else None,
        status=entry.status,
        notes=entry.notes,
        created_at=entry.created_at.isoformat(),
        updated_at=entry.updated_at.isoformat(),
        candidate=CandidateDetailResponse(
            id=str(candidate.id),
            github_username=candidate.github_username,
            github_url=candidate.github_url,
            full_name=candidate.full_name,
            location=candidate.location,
            current_role=candidate.current_role,
            current_company=candidate.current_company,
            tech_stack=candidate.tech_stack or [],
            years_experience=candidate.years_experience,
            github_repos=candidate.github_repos,
            github_commits_last_year=candidate.github_commits_last_year,
            bio=candidate.bio,
            profile_data=candidate.profile_data,
        ) if candidate else None,
    )


@router.get("/pool")
async def list_pool(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entries = await candidate_service.get_pool(db, str(user.id))
    return entries


@router.put("/pool/{entry_id}")
async def update_pool_entry(
    entry_id: str,
    body: PoolUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = await candidate_service.update_pool_entry(
        db, entry_id, str(user.id), body.status, body.notes
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Pool entry not found")
    return {"status": "updated"}


@router.delete("/pool/{entry_id}")
async def remove_from_pool(
    entry_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    success = await candidate_service.remove_from_pool(db, entry_id, str(user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Pool entry not found")
    return {"status": "deleted"}
