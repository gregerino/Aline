import { X, MapPin, Building2, GitBranch, Star, ExternalLink, Users, UserPlus, Calendar } from 'lucide-react';
import type { CandidateResult } from '../../types';
import { useFindSimilar } from '../../hooks/useCandidates';

interface Props {
  candidate: CandidateResult;
  onClose: () => void;
  onSave: (candidateId: string) => void;
  onFindSimilar: (candidateId: string) => void;
}

function getAvatarUrl(candidate: CandidateResult): string | null {
  const pd = candidate.profile_data as Record<string, unknown> | undefined;
  return (pd?.avatar_url as string) || null;
}

export default function CandidateDetail({ candidate, onClose, onSave }: Props) {
  const { data: similarData } = useFindSimilar(candidate.id);
  const avatarUrl = getAvatarUrl(candidate);
  const pd = candidate.profile_data as Record<string, unknown> | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl px-6 pt-6 pb-14">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Kandidatprofil</span>
            <span>·</span>
            <span className="text-blue-400">#{candidate.rank} i sökresultat</span>
          </div>
        </div>

        {/* Profile section overlapping header */}
        <div className="px-6 -mt-10 relative z-10">
          <div className="flex items-end gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-20 h-20 rounded-xl object-cover ring-4 ring-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-white shadow-lg flex items-center justify-center text-white font-bold text-2xl">
                {(candidate.full_name || candidate.github_username || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 pb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {candidate.full_name || candidate.github_username}
              </h3>
              <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {candidate.location}
                  </span>
                )}
                {candidate.current_company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {candidate.current_company}
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-center shrink-0 shadow-lg">
              <div className="text-2xl font-bold leading-none">{candidate.match_score.toFixed(0)}</div>
              <div className="text-[10px] opacity-80 mt-0.5 font-medium">MATCH</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Bio */}
          {candidate.bio && (
            <p className="text-gray-600 text-sm leading-relaxed">{candidate.bio}</p>
          )}

          {/* Score breakdown */}
          {candidate.score_breakdown && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Matchanalys</h4>
              <div className="space-y-2.5">
                {[
                  { label: 'Semantisk matchning', value: candidate.score_breakdown.semantic_score, max: 50, color: 'bg-blue-500' },
                  { label: 'Aktivitet', value: candidate.score_breakdown.activity_score, max: 15, color: 'bg-emerald-500' },
                  { label: 'Erfarenhet', value: candidate.score_breakdown.experience_score, max: 15, color: 'bg-violet-500' },
                  { label: 'Plats', value: candidate.score_breakdown.location_score, max: 10, color: 'bg-amber-500' },
                  { label: 'Bonus', value: candidate.score_breakdown.bonus_score, max: 10, color: 'bg-rose-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-36 shrink-0">{item.label}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-10 text-right">{item.value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech stack */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {(candidate.tech_stack || []).map((tech) => (
                <span key={tech} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {candidate.github_repos != null && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <GitBranch className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{candidate.github_repos}</div>
                <div className="text-xs text-gray-500">Repos</div>
              </div>
            )}
            {candidate.github_commits_last_year != null && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Star className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{candidate.github_commits_last_year}</div>
                <div className="text-xs text-gray-500">Commits/år</div>
              </div>
            )}
            {pd?.followers != null && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Users className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{pd.followers as number}</div>
                <div className="text-xs text-gray-500">Följare</div>
              </div>
            )}
          </div>

          {/* GitHub link */}
          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Visa profil på GitHub
            </a>
          )}

          {/* Similar candidates */}
          {similarData?.similar_candidates && similarData.similar_candidates.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Liknande profiler</h4>
              <div className="space-y-2">
                {similarData.similar_candidates.map((similar) => (
                  <div key={similar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-xs font-bold">
                        {(similar.full_name || '?')[0]}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{similar.full_name}</span>
                        {similar.current_role && (
                          <span className="text-gray-400 text-xs ml-2">{similar.current_role}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{similar.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => onSave(candidate.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
            >
              <UserPlus className="h-4 w-4" />
              Spara i pool
            </button>
            {candidate.github_url && (
              <a
                href={candidate.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
