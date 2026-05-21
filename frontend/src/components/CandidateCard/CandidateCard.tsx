import { MapPin, Building2, GitBranch, Star, UserPlus } from 'lucide-react';
import type { CandidateResult } from '../../types';

interface Props {
  candidate: CandidateResult;
  onSelect: (candidate: CandidateResult) => void;
  onSave: (candidateId: string) => void;
  isSaved: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50';
  if (score >= 50) return 'text-amber-600 bg-amber-50';
  return 'text-gray-600 bg-gray-50';
}

export default function CandidateCard({ candidate, onSelect, onSave, isSaved }: Props) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(candidate)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
            #{candidate.rank}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">
              {candidate.full_name || candidate.github_username || 'Okänd'}
            </h3>
            {candidate.current_role && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {candidate.current_role}
                {candidate.current_company && ` @ ${candidate.current_company}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(candidate.match_score)}`}>
            {candidate.match_score.toFixed(0)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(candidate.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500'
            }`}
            title={isSaved ? 'Sparad' : 'Spara kandidat'}
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {candidate.location && (
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
          <MapPin className="h-3.5 w-3.5" />
          {candidate.location}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(candidate.tech_stack || []).slice(0, 6).map((tech) => (
          <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {tech}
          </span>
        ))}
        {(candidate.tech_stack || []).length > 6 && (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
            +{candidate.tech_stack.length - 6}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {candidate.github_repos != null && (
          <span className="flex items-center gap-1">
            <GitBranch className="h-3.5 w-3.5" />
            {candidate.github_repos} repos
          </span>
        )}
        {candidate.github_commits_last_year != null && (
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {candidate.github_commits_last_year} commits/år
          </span>
        )}
        {candidate.years_experience != null && (
          <span>{candidate.years_experience} års erfarenhet</span>
        )}
      </div>

      {candidate.highlights && (
        <p className="mt-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg px-3 py-1.5">
          {candidate.highlights}
        </p>
      )}
    </div>
  );
}
