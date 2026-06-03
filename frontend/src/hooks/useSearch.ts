import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { executeSearch, getSavedSearches, saveSearch, deleteSearch, getSearchResults } from '../services/searchApi';

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ searchId, name }: { searchId: string; name: string }) =>
      saveSearch(searchId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });
}

export function useDeleteSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (searchId: string) => deleteSearch(searchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });
}
