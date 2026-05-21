from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    github_username: Mapped[Optional[str]] = mapped_column(String(255), unique=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500))
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    current_role: Mapped[Optional[str]] = mapped_column(String(255))
    current_company: Mapped[Optional[str]] = mapped_column(String(255))
    tech_stack: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text))
    years_experience: Mapped[Optional[int]] = mapped_column(Integer)
    github_repos: Mapped[Optional[int]] = mapped_column(Integer)
    github_commits_last_year: Mapped[Optional[int]] = mapped_column(Integer)
    bio: Mapped[Optional[str]] = mapped_column(Text)
    profile_data: Mapped[Optional[dict]] = mapped_column(JSONB)
    last_enriched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class SearchResult(Base):
    __tablename__ = "search_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    search_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("searches.id"), nullable=False, index=True)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    match_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    score_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class CandidatePool(Base):
    __tablename__ = "candidate_pools"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id"), nullable=False)
    search_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("searches.id"))
    status: Mapped[str] = mapped_column(String(50), default="new")
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CandidateEmbedding(Base):
    __tablename__ = "candidate_embeddings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("candidates.id"), unique=True, nullable=False)
    model_version: Mapped[str] = mapped_column(String(100), nullable=False)
    source_text_hash: Mapped[Optional[str]] = mapped_column(String(64))
    qdrant_point_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
