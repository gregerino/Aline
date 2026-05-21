import { X, MapPin, Building2, GitBranch, Star, ExternalLink, Users } from 'lucide-react';
import type { CandidateResult } from '../../types';
import { useFindSimilar } from '../../hooks/useCandidates';

interface Props {
  candidate: CandidateResult;
  onClose: () => void;
  onSave: (candidateId: string) => void;
  onFindSimilar: (candidateId: string) => void;
}

export default function CandidateDetail({ candidate, onClose, onSave, onFindSimilar }: Props) {
  const { data: similarData } = useFindSimilar(candidate.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">Kandidatprofil</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {candidate.full_name || candidate.github_username}
              </h3>
              {candidate.current_role && (
                <p className="text-gray-600 flex items-center gap-1.5 mt-1">
                  <Building2 className="h-4 w-4" />
                  {candidate.current_role}
                  {candidate.current_company && ` @ ${candidate.current_company}`}
                </p>
              )}
              {candidate.location && (
                <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="h-4 w-4" />
                  {candidate.location}
                </p>
              )}
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {candidate.match_score.toFixed(0)}
            </span>
          </div>

          {candidate.bio && (
            <p className="text-gray-700">{candidate.bio}</p>
          )}

          {candidate.score_breakdown && (
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Semantisk', value: candidate.score_breakdown.semantic_score, max: 50 },
                { label: 'Aktivitet', value: candidate.score_breakdown.activity_score, max: 15 },
                { label: 'Erfarenhet', value: candidate.score_breakdown.experience_score, max: 15 },
                { label: 'Plats', value: candidate.score_breakdown.location_score, max: 10 },
                { label: 'Bonus', value: candidate.score_breakdown.bonus_score, max: 10 },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{item.value.toFixed(1)}</div>
                </div>
              ))}
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {(candidate.tech_stack || []).map((tech) => (
                <span key={tech} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            {candidate.github_repos != null && (
              <div className="flex items-center gap-2 text-gray-600">
                <GitBranch className="h-4 w-4" />
                <span>{candidate.github_repos} repos</span>
              </div>
            )}
            {candidate.github_commits_last_year != null && (
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="h-4 w-4" />
                <span>{candidate.github_commits_last_year} commits/år</span>
              </div>
            )}
            {candidate.years_experience != null && (
              <div className="text-gray-600">
                {candidate.years_experience} års erfarenhet
              </div>
            )}
          </div>

          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              GitHub-profil
            </a>
          )}

          {similarData?.similar_candidates && similarData.similar_candidates.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Liknande profiler</h4>
              <div className="space-y-2">
                {similarData.similar_candidates.map((similar) => (
                  <div key={similar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{similar.full_name}</span>
                      <span className="text-gray-500 text-sm ml-2">{similar.current_role}</span>
                    </div>
                    <span className="text-xs text-gray-500">{similar.location}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onSave(candidate.id)}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
            >
              Spara kandidat
            </button>
            <button
              onClick={() => onFindSimilar(candidate.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              <Users className="h-4 w-4" />
              Hitta liknande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
