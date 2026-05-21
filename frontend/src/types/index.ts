export interface User {
  id: string;
  email: string;
  company: string | null;
}

export interface ScoreBreakdown {
  semantic_score: number;
  activity_score: number;
  experience_score: number;
  location_score: number;
  bonus_score: number;
}

export interface CandidateResult {
  id: string;
  rank: number;
  match_score: number;
  score_breakdown: ScoreBreakdown | null;
  github_username: string | null;
  github_url: string | null;
  full_name: string | null;
  location: string | null;
  current_role: string | null;
  current_company: string | null;
  tech_stack: string[];
  years_experience: number | null;
  github_repos: number | null;
  github_commits_last_year: number | null;
  bio: string | null;
  highlights: string | null;
  profile_data?: Record<string, unknown>;
}

export interface ParsedQuery {
  technologies: string[];
  location: string | null;
  experience_level: string | null;
  years_experience: number | null;
  domain: string | null;
  raw_query: string;
}

export interface SearchResponse {
  search_id: string;
  query: string;
  parsed: ParsedQuery;
  total_results: number;
  candidates: CandidateResult[];
}

export interface SavedSearch {
  id: string;
  query_text: string | null;
  filters: Record<string, unknown> | null;
  name: string | null;
  is_saved: boolean;
  created_at: string;
}

export interface PoolEntry {
  id: string;
  candidate_id: string;
  search_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  candidate: CandidateResult | null;
}
