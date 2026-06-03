import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, Users, BookmarkCheck, LogOut, Save, Sparkles, BarChart3, ChevronRight } from 'lucide-react';
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
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

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
    if (!searchResult || !saveName.trim()) return;
    saveSearchMutation.mutate({ searchId: searchResult.search_id, name: saveName.trim() });
    setShowSaveInput(false);
    setSaveName('');
  }, [searchResult, saveSearchMutation, saveName]);

  const navItems = [
    { id: 'search' as Tab, label: 'Sök kandidater', icon: Search, count: 0 },
    { id: 'pool' as Tab, label: 'Kandidatpool', icon: Users, count: poolEntries.length },
    { id: 'saved' as Tab, label: 'Sparade sökningar', icon: BookmarkCheck, count: savedSearches.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight">Aline</span>
              </div>
              <span className="text-slate-500 text-sm hidden sm:block">|</span>
              <span className="text-slate-400 text-sm hidden sm:block">AI Recruiter</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{user?.email}</span>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Logga ut"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] sticky top-14 hidden lg:block">
          <nav className="p-4 space-y-1">
            {navItems.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    activeTab === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick stats */}
          <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Översikt</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">I pool</span>
                <span className="font-semibold text-gray-900">{poolEntries.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sparade sökningar</span>
                <span className="font-semibold text-gray-900">{savedSearches.length}</span>
              </div>
              {searchResult && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Senaste träffar</span>
                  <span className="font-semibold text-gray-900">{searchResult.total_results}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1">
          <div className="flex justify-around">
            {navItems.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg text-xs ${
                  activeTab === id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] px-1 rounded-full">
                      {count}
                    </span>
                  )}
                </div>
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6 pb-24 lg:pb-6">
          {activeTab === 'search' && (
            <div className="space-y-6 max-w-4xl">
              <SearchBar onSearch={handleSearch} isLoading={searchMutation.isPending} />

              {searchResult && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <SearchFilters parsed={searchResult.parsed} />
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-semibold text-gray-900">{searchResult.total_results}</span> kandidater hittade
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {showSaveInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            placeholder="Namnge sökningen..."
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSearch(); if (e.key === 'Escape') setShowSaveInput(false); }}
                          />
                          <button
                            onClick={handleSaveSearch}
                            disabled={!saveName.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
                          >
                            Spara
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowSaveInput(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          Spara sökning
                        </button>
                      )}
                      <ExportButton searchId={searchResult.search_id} />
                    </div>
                  </div>

                  <div className="grid gap-3">
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
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Search className="h-10 w-10 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Hitta din nästa kandidat</h2>
                  <p className="text-gray-500 mt-2 max-w-lg mx-auto text-sm leading-relaxed">
                    Beskriv rollen du söker efter med fritext eller använd filtren. Aline analyserar GitHub-profiler
                    och rankar kandidaterna med AI-driven matchning.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {['Senior React-utvecklare i Stockholm', 'Python backend Göteborg', 'Fullstack TypeScript'].map((example) => (
                      <button
                        key={example}
                        onClick={() => handleSearch(example)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
                      >
                        {example}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchMutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  Sökningen misslyckades. Kontrollera att backend-servern körs och försök igen.
                </div>
              )}
            </div>
          )}

          {activeTab === 'pool' && (
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Kandidatpool</h2>
                  <p className="text-sm text-gray-500">Hantera och följ upp dina sparade kandidater</p>
                </div>
                {poolEntries.length > 0 && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                    {poolEntries.length} kandidater
                  </span>
                )}
              </div>
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
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Sparade sökningar</h2>
                  <p className="text-sm text-gray-500">Kör om en sparad sökning med ett klick</p>
                </div>
              </div>
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
      </div>

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
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
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
