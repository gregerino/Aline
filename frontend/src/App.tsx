import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, Users, BookmarkCheck, LogOut, Save } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useSearchMutation, useSavedSearches, useDeleteSearch, useSaveSearch } from './hooks/useSearch';
import { usePool, useAddToPool, useUpdatePoolEntry, useRemoveFromPool } from './hooks/useCandidates';
import SearchBar from './components/SearchBar/SearchBar';
import SearchFilters from './components/SearchFilters/SearchFilters';
import CandidateCard from './components/CandidateCard/CandidateCard';
import CandidateDetail from './components/CandidateDetail/CandidateDetail';
import CandidatePoolView from './components/CandidatePool/CandidatePool';
import SavedSearches from './components/SavedSearches/SavedSearches';
import ExportButton from './components/ExportButton/ExportButton';
import LoginPage from './components/LoginPage';
import type { CandidateResult, SearchResponse } from './types';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

type Tab = 'search' | 'pool' | 'saved';

function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  const searchMutation = useSearchMutation();
  const { data: savedSearches = [] } = useSavedSearches();
  const deleteSearchMutation = useDeleteSearch();
  const saveSearchMutation = useSaveSearch();
  const { data: poolEntries = [] } = usePool();
  const addToPoolMutation = useAddToPool();
  const updatePoolMutation = useUpdatePoolEntry();
  const removeFromPoolMutation = useRemoveFromPool();

  const savedCandidateIds = new Set(poolEntries.map((e) => e.candidate_id));

  const handleSearch = useCallback((query: string) => {
    searchMutation.mutate({ query }, {
      onSuccess: (data) => setSearchResult(data),
    });
  }, [searchMutation]);

  const handleSaveCandidate = useCallback((candidateId: string) => {
    addToPoolMutation.mutate({
      candidateId,
      searchId: searchResult?.search_id,
    });
  }, [addToPoolMutation, searchResult]);

  const handleSaveSearch = useCallback(() => {
    if (!searchResult) return;
    const name = prompt('Namnge sökningen:');
    if (name) {
      saveSearchMutation.mutate({ searchId: searchResult.search_id, name });
    }
  }, [searchResult, saveSearchMutation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Aline</h1>
            <nav className="flex items-center gap-1">
              {([
                { id: 'search', label: 'Sök', icon: Search },
                { id: 'pool', label: 'Pool', icon: Users },
                { id: 'saved', label: 'Sparade', icon: BookmarkCheck },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {id === 'pool' && poolEntries.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full text-xs">
                      {poolEntries.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logga ut"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />

            {searchResult && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <SearchFilters parsed={searchResult.parsed} />
                    <p className="text-sm text-gray-500 mt-2">
                      {searchResult.total_results} kandidater hittade
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveSearch}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      Spara sökning
                    </button>
                    <ExportButton searchId={searchResult.search_id} />
                  </div>
                </div>

                <div className="grid gap-4">
                  {searchResult.candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onSelect={setSelectedCandidate}
                      onSave={handleSaveCandidate}
                      isSaved={savedCandidateIds.has(candidate.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {!searchResult && !searchMutation.isPending && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Hitta din nästa kandidat</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Beskriv rollen du söker efter. Aline analyserar GitHub-profiler och använder
                  ML-driven matchning för att hitta de bästa kandidaterna.
                </p>
              </div>
            )}

            {searchMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Sökningen misslyckades. Kontrollera att backend-servern körs.
              </div>
            )}
          </div>
        )}

        {activeTab === 'pool' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kandidatpool</h2>
            <CandidatePoolView
              entries={poolEntries}
              onUpdateStatus={(entryId, status) =>
                updatePoolMutation.mutate({ entryId, updates: { status } })
              }
              onUpdateNotes={(entryId, notes) =>
                updatePoolMutation.mutate({ entryId, updates: { notes } })
              }
              onRemove={(entryId) => removeFromPoolMutation.mutate(entryId)}
            />
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sparade sökningar</h2>
            <SavedSearches
              searches={savedSearches}
              onRerun={(query) => {
                setActiveTab('search');
                handleSearch(query);
              }}
              onDelete={(id) => deleteSearchMutation.mutate(id)}
            />
          </div>
        )}
      </main>

      {selectedCandidate && (
        <CandidateDetail
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onSave={handleSaveCandidate}
          onFindSimilar={() => {}}
        />
      )}
    </div>
  );
}

function AppRoot() {
  const { user, loading, login, register } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  );
}
