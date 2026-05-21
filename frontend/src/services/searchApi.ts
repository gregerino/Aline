import api from './api';
import type { SearchResponse, SavedSearch, CandidateResult, PoolEntry } from '../types';

export async function executeSearch(query: string, filters?: Record<string, unknown>): Promise<SearchResponse> {
  const { data } = await api.post('/search', { query, filters });
  return data;
}

export async function getSearchResults(searchId: string): Promise<SearchResponse> {
  const { data } = await api.get(`/search/${searchId}/results`);
  return data;
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  const { data } = await api.get('/searches');
  return data;
}

export async function saveSearch(searchId: string, name: string): Promise<void> {
  await api.put(`/searches/${searchId}`, { name, is_saved: true });
}

export async function deleteSearch(searchId: string): Promise<void> {
  await api.delete(`/searches/${searchId}`);
}

export async function getCandidate(candidateId: string): Promise<CandidateResult> {
  const { data } = await api.get(`/candidates/${candidateId}`);
  return data;
}

export async function findSimilar(candidateId: string): Promise<{ similar_candidates: CandidateResult[] }> {
  const { data } = await api.get(`/candidates/${candidateId}/similar`);
  return data;
}

export async function addToPool(candidateId: string, searchId?: string): Promise<PoolEntry> {
  const { data } = await api.post('/pool', { candidate_id: candidateId, search_id: searchId });
  return data;
}

export async function getPool(): Promise<PoolEntry[]> {
  const { data } = await api.get('/pool');
  return data;
}

export async function updatePoolEntry(entryId: string, updates: { status?: string; notes?: string }): Promise<void> {
  await api.put(`/pool/${entryId}`, updates);
}

export async function removeFromPool(entryId: string): Promise<void> {
  await api.delete(`/pool/${entryId}`);
}

export function getExportUrl(searchId: string): string {
  const token = localStorage.getItem('token');
  return `/api/export/csv?search_id=${searchId}&token=${token}`;
}

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post('/auth/login', { email, password });
  return data.access_token;
}

export async function register(email: string, password: string, company?: string): Promise<string> {
  const { data } = await api.post('/auth/register', { email, password, company });
  return data.access_token;
}
