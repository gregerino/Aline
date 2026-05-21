import { useState } from 'react';
import { Trash2, ChevronDown, MessageSquare } from 'lucide-react';
import type { PoolEntry } from '../../types';

interface Props {
  entries: PoolEntry[];
  onUpdateStatus: (entryId: string, status: string) => void;
  onUpdateNotes: (entryId: string, notes: string) => void;
  onRemove: (entryId: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Ny', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Kontaktad', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'interview', label: 'Intervju', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Avvisad', color: 'bg-red-100 text-red-700' },
];

export default function CandidatePool({ entries, onUpdateStatus, onUpdateNotes, onRemove }: Props) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Ingen kandidat i poolen</p>
        <p className="text-sm mt-1">Spara kandidater från sökresultaten</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const candidate = entry.candidate;
        const statusOption = STATUS_OPTIONS.find((s) => s.value === entry.status) || STATUS_OPTIONS[0];

        return (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {candidate?.full_name || candidate?.github_username || 'Okänd'}
                </h4>
                {candidate?.current_role && (
                  <p className="text-sm text-gray-500">
                    {candidate.current_role}
                    {candidate.current_company && ` @ ${candidate.current_company}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={entry.status}
                    onChange={(e) => onUpdateStatus(entry.id, e.target.value)}
                    className={`appearance-none px-3 py-1 pr-8 rounded-full text-sm font-medium ${statusOption.color} cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" />
                </div>
                <button
                  onClick={() => onRemove(entry.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {candidate?.tech_stack && candidate.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {candidate.tech_stack.slice(0, 5).map((tech) => (
                  <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {editingNotes === entry.id ? (
              <div className="mt-3">
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="Skriv anteckningar..."
                />
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      onUpdateNotes(entry.id, notesText);
                      setEditingNotes(null);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                  >
                    Spara
                  </button>
                  <button
                    onClick={() => setEditingNotes(null)}
                    className="px-3 py-1 text-gray-500 rounded text-xs hover:bg-gray-100"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingNotes(entry.id);
                  setNotesText(entry.notes || '');
                }}
                className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <MessageSquare className="h-3 w-3" />
                {entry.notes ? entry.notes : 'Lägg till anteckning'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
