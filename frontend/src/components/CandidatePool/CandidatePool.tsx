import { useState } from 'react';
import { Trash2, ChevronDown, MessageSquare, MapPin, UserPlus } from 'lucide-react';
import type { PoolEntry } from '../../types';

interface Props {
  entries: PoolEntry[];
  onUpdateStatus: (entryId: string, status: string) => void;
  onUpdateNotes: (entryId: string, notes: string) => void;
  onRemove: (entryId: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Ny', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { value: 'contacted', label: 'Kontaktad', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  { value: 'interview', label: 'Intervju', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { value: 'rejected', label: 'Avvisad', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
];

function getAvatarUrl(entry: PoolEntry): string | null {
  const pd = entry.candidate?.profile_data as Record<string, unknown> | undefined;
  return (pd?.avatar_url as string) || null;
}

export default function CandidatePool({ entries, onUpdateStatus, onUpdateNotes, onRemove }: Props) {
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-lg font-semibold text-gray-700">Ingen kandidat i poolen</p>
        <p className="text-sm text-gray-500 mt-1">Spara kandidater från sökresultaten för att bygga din pipeline</p>
      </div>
    );
  }

  const grouped = STATUS_OPTIONS.map((status) => ({
    ...status,
    entries: entries.filter((e) => e.status === status.value),
  })).filter((g) => g.entries.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.value}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${group.dot}`} />
            <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
            <span className="text-xs text-gray-400">{group.entries.length}</span>
          </div>
          <div className="space-y-2">
            {group.entries.map((entry) => {
              const candidate = entry.candidate;
              const avatarUrl = getAvatarUrl(entry);
              const statusOption = STATUS_OPTIONS.find((s) => s.value === entry.status) || STATUS_OPTIONS[0];

              return (
                <div key={entry.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(candidate?.full_name || candidate?.github_username || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {candidate?.full_name || candidate?.github_username || 'Okänd'}
                          </h4>
                          <div className="flex items-center gap-3 mt-0.5">
                            {candidate?.current_role && (
                              <p className="text-xs text-gray-500">
                                {candidate.current_role}
                                {candidate.current_company && ` · ${candidate.current_company}`}
                              </p>
                            )}
                            {candidate?.location && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {candidate.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <select
                              value={entry.status}
                              onChange={(e) => onUpdateStatus(entry.id, e.target.value)}
                              className={`appearance-none px-3 py-1 pr-7 rounded-full text-xs font-semibold ${statusOption.color} cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => onRemove(entry.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {candidate?.tech_stack && candidate.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {candidate.tech_stack.slice(0, 5).map((tech) => (
                            <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
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
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={2}
                            placeholder="Skriv anteckningar om kandidaten..."
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => { onUpdateNotes(entry.id, notesText); setEditingNotes(null); }}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                            >
                              Spara
                            </button>
                            <button
                              onClick={() => setEditingNotes(null)}
                              className="px-3 py-1.5 text-gray-500 rounded-lg text-xs hover:bg-gray-100"
                            >
                              Avbryt
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingNotes(entry.id); setNotesText(entry.notes || ''); }}
                          className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {entry.notes || 'Lägg till anteckning'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
