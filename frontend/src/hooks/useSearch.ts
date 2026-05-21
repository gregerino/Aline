import { useMutation, useQuery } from '@tanstack/react-query';
import { executeSearch, getSavedSearches, saveSearch, deleteSearch, getSearchResults } from '../services/searchApi';
import type { SearchResponse } from '../types';

export function useSearchMutation() {
  return useMutation({
    mutationFn: ({ query, filters }: { query: string; filters?: Record<string, unknown> }) =>
      executeSearch(query, filters),
  });
}

export function useSavedSearches() {
  return useQuery({
    queryKey: ['savedSearches'],
    queryFn: getSavedSearches,
  });
}

export function useSearchResults(searchId: string | null) {
  return useQuery({
    queryKey: ['searchResults', searchId],
    queryFn: () => getSearchResults(searchId!),
    enabled: !!searchId,
  });
}

export function useSaveSearch() {
  return useMutation({
    mutationFn: ({ searchId, name }: { searchId: string; name: string }) =>
      saveSearch(searchId, name),
  });
}

export function useDeleteSearch() {
  return useMutation({
    mutationFn: (searchId: string) => deleteSearch(searchId),
  });
}
