import { useState } from 'react';
import { Search, Loader2, SlidersHorizontal, MapPin, Code2, Briefcase, X } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SUGGESTED_SKILLS = ['React', 'Python', 'TypeScript', 'Java', 'Go', 'Rust', 'Node.js', 'C#', 'Kubernetes', 'AWS'];
const SUGGESTED_LOCATIONS = ['Stockholm', 'Gothenburg', 'Malmö', 'Oslo', 'Copenhagen', 'Berlin', 'London', 'Remote'];
const EXPERIENCE_LEVELS = ['Junior (0-2 år)', 'Mid (3-5 år)', 'Senior (5+ år)', 'Lead / Principal'];

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = [query.trim()];
    if (selectedSkills.length > 0 && !query.includes(selectedSkills[0])) {
      parts.push(selectedSkills.join(', '));
    }
    if (selectedLocation && !query.toLowerCase().includes(selectedLocation.toLowerCase())) {
      parts.push(`in ${selectedLocation}`);
    }
    if (selectedExperience && !query.toLowerCase().includes('senior') && !query.toLowerCase().includes('junior')) {
      parts.push(selectedExperience.split(' ')[0]);
    }
    const fullQuery = parts.filter(Boolean).join(' ');
    if (fullQuery) onSearch(fullQuery);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const activeFilterCount = selectedSkills.length + (selectedLocation ? 1 : 0) + (selectedExperience ? 1 : 0);

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              ) : (
                <Search className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sök kandidater efter roll, kompetens eller plats..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3.5 border rounded-xl text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="submit"
            disabled={isLoading || (!query.trim() && selectedSkills.length === 0)}
            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? 'Söker...' : 'Sök'}
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 animate-in fade-in">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
              <Code2 className="h-4 w-4 text-gray-400" />
              Kompetenser
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                Plats
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alla platser</option>
                {SUGGESTED_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2.5">
                <Briefcase className="h-4 w-4 text-gray-400" />
                Erfarenhetsnivå
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alla nivåer</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-gray-500">Aktiva filter:</span>
              {selectedSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                  {skill}
                  <button onClick={() => toggleSkill(skill)} className="hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedLocation && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('')} className="hover:text-emerald-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedExperience && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium">
                  {selectedExperience.split(' ')[0]}
                  <button onClick={() => setSelectedExperience('')} className="hover:text-amber-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => { setSelectedSkills([]); setSelectedLocation(''); setSelectedExperience(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-2"
              >
                Rensa alla
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
