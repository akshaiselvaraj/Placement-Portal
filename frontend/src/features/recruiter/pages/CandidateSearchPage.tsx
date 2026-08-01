import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recruiterService } from '../services/recruiter.service';
import { LoadingSkeleton, StatusBadge, Github } from '@/components/common';
import { Search, Users, GraduationCap, Globe, Star } from 'lucide-react';

export function CandidateSearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidate-search', debouncedQuery, showAll],
    queryFn: () => recruiterService.searchCandidates(showAll && debouncedQuery.length < 2 ? '' : debouncedQuery),
    enabled: showAll || debouncedQuery.length >= 2,
  });

  const handleSearch = (val: string) => {
    setQuery(val);
    const timer = setTimeout(() => setDebouncedQuery(val), 400);
    return () => clearTimeout(timer);
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">Candidate Search</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Search all verified candidates by name, skill, department, or email.
        </p>
      </div>

      {/* Search Bar & Show All Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center max-w-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search by name, skill, department, email..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-[hsl(var(--text-primary))] shadow-xs"
            autoFocus
          />
        </div>
        <label className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] cursor-pointer select-none text-sm text-[hsl(var(--text-secondary))] shrink-0 hover:bg-[hsl(var(--border)/0.2)] transition-colors">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
          />
          <span>Show All Candidates</span>
        </label>
      </div>

      {/* Results */}
      {!showAll && (!debouncedQuery || debouncedQuery.length < 2) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-14 w-14 text-[hsl(var(--text-muted))] mb-4" />
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Start Searching</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
            Type at least 2 characters or check "Show All Candidates" to search the database.
          </p>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton count={4} height="h-28" />
      ) : !candidates || candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
          <Search className="h-10 w-10 text-[hsl(var(--text-muted))] mb-3" />
          <h3 className="font-bold text-[hsl(var(--text-primary))]">No results found</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Try searching with different keywords.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-[hsl(var(--text-muted))] font-medium">
            {candidates.length} result{candidates.length !== 1 ? 's' : ''} {debouncedQuery ? `for "${debouncedQuery}"` : 'in database'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((c: any) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs hover:shadow-md hover:border-[hsl(var(--primary)/0.3)] transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.15)] flex items-center justify-center text-[hsl(var(--primary))] font-extrabold text-lg shrink-0">
                    {c.user?.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h4 className="font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--primary))] transition-colors">
                        {c.user?.name}
                      </h4>
                      <p className="text-xs text-[hsl(var(--text-muted))]">{c.user?.email}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1 text-[hsl(var(--text-secondary))]">
                        <GraduationCap className="h-3 w-3" />
                        {c.department} &bull; {c.batch}
                      </span>
                      {c.cgpa && (
                        <span className="flex items-center gap-1 font-semibold text-[hsl(var(--text-primary))]">
                          <Star className="h-3 w-3 text-[hsl(var(--warning))]" />
                          CGPA {c.cgpa?.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {c.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 5).map((s: any) => (
                          <span key={s.id} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.15)]">
                            {s.name}
                          </span>
                        ))}
                        {c.skills.length > 5 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
                            +{c.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex items-center gap-2 pt-1">
                      {c.linkedin && (
                        <a href={c.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))]">
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {c.github && (
                        <a href={c.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]">
                          <Github className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <StatusBadge status={c.profileStatus} className="ml-auto" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateSearchPage;
