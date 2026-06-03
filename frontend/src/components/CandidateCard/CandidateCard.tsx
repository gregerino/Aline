import { MapPin, Building2, GitBranch, Star, UserPlus, ExternalLink, Check } from 'lucide-react';
import type { CandidateResult } from '../../types';

interface Props {
  candidate: CandidateResult;
  onSelect: (candidate: CandidateResult) => void;
  onSave: (candidateId: string) => void;
  isSaved: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'from-emerald-500 to-emerald-600';
  if (score >= 50) return 'from-blue-500 to-blue-600';
  return 'from-gray-400 to-gray-500';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Utmärkt';
  if (score >= 50) return 'Bra';
  return 'Match';
}

function getAvatarUrl(candidate: CandidateResult): string | null {
  const pd = candidate.profile_data as Record<string, unknown> | undefined;
  return (pd?.avatar_url as string) || null;
}

export default function CandidateCard({ candidate, onSelect, onSave, isSaved }: Props) {
  const avatarUrl = getAvatarUrl(candidate);

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onSelect(candidate)}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={candidate.full_name || ''}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {(candidate.full_name || candidate.github_username || '?')[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-base truncate group-hover:text-blue-700 transition-colors">
                  {candidate.full_name || candidate.github_username || 'Okänd'}
                </h3>
                {candidate.highlights?.toLowerCase().includes('open to opportunities') && (
                  <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-200">
                    Öppen
                  </span>
                )}
              </div>
              {candidate.current_role && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">
                    {candidate.current_role}
                    {candidate.current_company && <span className="text-gray-400"> · {candidate.current_company}</span>}
                  </span>
                </p>
              )}
              {candidate.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  {candidate.location}
                </p>
              )}
            </div>

            {/* Score + Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`bg-gradient-to-r ${getScoreColor(candidate.match_score)} text-white px-3 py-1.5 rounded-lg text-center`}>
                <div className="text-lg font-bold leading-none">{candidate.match_score.toFixed(0)}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{getScoreLabel(candidate.match_score)}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSave(candidate.id); }}
                className={`p-2.5 rounded-lg transition-all ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200'
                    : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                }`}
                title={isSaved ? 'Sparad i pool' : 'Spara kandidat'}
              >
                {isSaved ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(candidate.tech_stack || []).slice(0, 6).map((tech) => (
              <span key={tech} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                {tech}
              </span>
            ))}
            {(candidate.tech_stack || []).length > 6 && (
              <span className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-md text-xs">
                +{candidate.tech_stack.length - 6} till
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 mt-3 text-xs text-gray-500">
            {candidate.github_repos != null && (
              <span className="flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                {candidate.github_repos} repos
              </span>
            )}
            {candidate.github_commits_last_year != null && (
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5" />
                {candidate.github_commits_last_year} commits/år
              </span>
            )}
            {candidate.github_url && (
              <a
                href={candidate.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
