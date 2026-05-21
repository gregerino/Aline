from __future__ import annotations

import csv
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.search import Search
from app.models.candidate import SearchResult, Candidate
from app.schemas.search import (
    SearchRequest,
    SearchResponse,
    SavedSearchResponse,
    UpdateSearchRequest,
)
from app.api.dependencies import get_current_user
from app.services.search_orchestrator import search_orchestrator

router = APIRouter(prefix="/api", tags=["search"])


@router.post("/search", response_model=SearchResponse)
async def create_search(
    body: SearchRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await search_orchestrator.execute_search(
        db=db,
        user_id=str(user.id),
        query=body.query,
        filters=body.filters,
    )
    return result


@router.get("/search/{search_id}/results")
async def get_search_results(
    search_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    search = await db.execute(
        select(Search).where(
            Search.id == uuid.UUID(search_id),
            Search.user_id == user.id,
        )
    )
    search_obj = search.scalar_one_or_none()
    if not search_obj:
        raise HTTPException(status_code=404, detail="Search not found")

    results = await db.execute(
        select(SearchResult, Candidate)
        .join(Candidate, SearchResult.candidate_id == Candidate.id)
        .where(SearchResult.search_id == uuid.UUID(search_id))
        .order_by(SearchResult.rank)
    )

    candidates = []
    for sr, candidate in results.all():
        candidates.append({
            "id": str(candidate.id),
            "rank": sr.rank,
            "match_score": float(sr.match_score),
            "score_breakdown": sr.score_breakdown,
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
            "highlights": None,
        })

    return {
        "search_id": search_id,
        "query": search_obj.query_text,
        "total_results": len(candidates),
        "candidates": candidates,
    }


@router.get("/searches", response_model=list[SavedSearchResponse])
async def list_searches(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Search)
        .where(Search.user_id == user.id, Search.is_saved == True)
        .order_by(Search.created_at.desc())
    )
    searches = result.scalars().all()
    return [
        SavedSearchResponse(
            id=str(s.id),
            query_text=s.query_text,
            filters=s.filters,
            name=s.name,
            is_saved=s.is_saved,
            created_at=s.created_at.isoformat(),
        )
        for s in searches
    ]


@router.put("/searches/{search_id}")
async def update_search(
    search_id: str,
    body: UpdateSearchRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Search).where(Search.id == uuid.UUID(search_id), Search.user_id == user.id)
    )
    search = result.scalar_one_or_none()
    if not search:
        raise HTTPException(status_code=404, detail="Search not found")

    if body.name is not None:
        search.name = body.name
    if body.is_saved is not None:
        search.is_saved = body.is_saved

    await db.commit()
    return {"status": "updated"}


@router.delete("/searches/{search_id}")
async def delete_search(
    search_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Search).where(Search.id == uuid.UUID(search_id), Search.user_id == user.id)
    )
    search = result.scalar_one_or_none()
    if not search:
        raise HTTPException(status_code=404, detail="Search not found")

    await db.delete(search)
    await db.commit()
    return {"status": "deleted"}


@router.get("/export/csv")
async def export_csv(
    search_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    results = await db.execute(
        select(SearchResult, Candidate)
        .join(Candidate, SearchResult.candidate_id == Candidate.id)
        .where(SearchResult.search_id == uuid.UUID(search_id))
        .order_by(SearchResult.rank)
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Name", "Location", "Role", "Company",
        "Tech Stack", "Experience (years)", "GitHub URL",
        "Repos", "Match Score",
    ])

    for sr, candidate in results.all():
        writer.writerow([
            sr.rank,
            candidate.full_name or "",
            candidate.location or "",
            candidate.current_role or "",
            candidate.current_company or "",
            ", ".join(candidate.tech_stack or []),
            candidate.years_experience or "",
            candidate.github_url or "",
            candidate.github_repos or "",
            float(sr.match_score),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=search-{search_id}.csv"},
    )
