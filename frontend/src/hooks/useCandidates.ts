import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPool, addToPool, updatePoolEntry, removeFromPool, findSimilar } from '../services/searchApi';

export function usePool() {
  return useQuery({
    queryKey: ['pool'],
    queryFn: getPool,
  });
}

export function useAddToPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId, searchId }: { candidateId: string; searchId?: string }) =>
      addToPool(candidateId, searchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool'] });
    },
  });
}

export function useUpdatePoolEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: { status?: string; notes?: string } }) =>
      updatePoolEntry(entryId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool'] });
    },
  });
}

export function useRemoveFromPool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => removeFromPool(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool'] });
    },
  });
}

export function useFindSimilar(candidateId: string | null) {
  return useQuery({
    queryKey: ['similar', candidateId],
    queryFn: () => findSimilar(candidateId!),
    enabled: !!candidateId,
  });
}
