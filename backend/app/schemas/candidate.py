from __future__ import annotations

from pydantic import BaseModel


class CandidateDetailResponse(BaseModel):
    id: str
    github_username: str | None
    github_url: str | None
    full_name: str | None
    location: str | None
    current_role: str | None
    current_company: str | None
    tech_stack: list[str]
    years_experience: int | None
    github_repos: int | None
    github_commits_last_year: int | None
    bio: str | None
    profile_data: dict | None

    model_config = {"from_attributes": True}


class PoolAddRequest(BaseModel):
    candidate_id: str
    search_id: str | None = None


class PoolUpdateRequest(BaseModel):
    status: str | None = None
    notes: str | None = None


class PoolEntryResponse(BaseModel):
    id: str
    candidate_id: str
    search_id: str | None
    status: str
    notes: str | None
    created_at: str
    updated_at: str
    candidate: CandidateDetailResponse | None = None

    model_config = {"from_attributes": True}
