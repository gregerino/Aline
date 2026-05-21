import { Trash2, Search, Clock } from 'lucide-react';
import type { SavedSearch } from '../../types';

interface Props {
  searches: SavedSearch[];
  onRerun: (query: string) => void;
  onDelete: (searchId: string) => void;
}

export default function SavedSearches({ searches, onRerun, onDelete }: Props) {
  if (searches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Inga sparade sökningar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {searches.map((search) => (
        <div
          key={search.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <button
            onClick={() => search.query_text && onRerun(search.query_text)}
            className="flex items-center gap-3 text-left flex-1 min-w-0"
          >
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {search.name || search.query_text}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(search.created_at).toLocaleDateString('sv-SE')}
              </p>
            </div>
          </button>
          <button
            onClick={() => onDelete(search.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
