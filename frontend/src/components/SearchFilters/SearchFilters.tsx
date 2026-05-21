import type { ParsedQuery } from '../../types';

interface Props {
  parsed: ParsedQuery | null;
}

export default function SearchFilters({ parsed }: Props) {
  if (!parsed) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {parsed.technologies.map((tech) => (
        <span
          key={tech}
          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
        >
          {tech}
        </span>
      ))}
      {parsed.location && (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
          {parsed.location}
        </span>
      )}
      {parsed.experience_level && (
        <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
          {parsed.experience_level}
        </span>
      )}
      {parsed.domain && (
        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
          {parsed.domain}
        </span>
      )}
    </div>
  );
}
