from __future__ import annotations

from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    filters: dict | None = None


class ParsedQuery(BaseModel):
    technologies: list[str]
    location: str | None = None
    experience_level: str | None = None
    years_experience: int | None = None
    domain: str | None = None
    raw_query: str


class ScoreBreakdown(BaseModel):
    semantic_score: float
    activity_score: float
    experience_score: float
    location_score: float
    bonus_score: float


class CandidateResult(BaseModel):
    id: str
    rank: int
    match_score: float
    score_breakdown: ScoreBreakdown | None
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
    highlights: str | None

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    search_id: str
    query: str
    parsed: ParsedQuery
    total_results: int
    candidates: list[CandidateResult]


class SavedSearchResponse(BaseModel):
    id: str
    query_text: str | None
    filters: dict | None
    name: str | None
    is_saved: bool
    created_at: str

    model_config = {"from_attributes": True}


class UpdateSearchRequest(BaseModel):
    name: str | None = None
    is_saved: bool | None = None
