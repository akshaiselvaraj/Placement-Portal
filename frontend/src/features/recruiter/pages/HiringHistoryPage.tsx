import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHiringHistory } from '../hooks/useRecruiterData';
import { StatusBadge, LoadingSkeleton } from '@/components/common';
import { Briefcase, GraduationCap, Calendar, Search, Filter, TrendingUp } from 'lucide-react';

export function HiringHistoryPage() {
  const navigate = useNavigate();
  const { history, isLoadingHistory } = useHiringHistory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');

  const uniqueJobs = Array.from(new Set((history || []).map((h) => h.job?.title))).filter(Boolean);

  const filtered = (history || []).filter((h) => {
    const name = h.student?.user?.name?.toLowerCase() || '';
    const dept = h.student?.department?.toLowerCase() || '';
    const job = h.job?.title?.toLowerCase() || '';
    const searchMatch = !search || name.includes(search.toLowerCase()) || dept.includes(search.toLowerCase()) || job.includes(search.toLowerCase());
    const statusMatch = !statusFilter || h.status === statusFilter;
    const jobMatch = !jobFilter || h.job?.title === jobFilter;
    return searchMatch && statusMatch && jobMatch;
  });

  const totalHired = (history || []).filter((h) => h.status === 'HIRED').length;
  const totalSelected = (history || []).filter((h) => h.status === 'SELECTED').length;

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">Hiring History</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          All selected and hired candidates for your company.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <p className="text-xs font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wide">Total Records</p>
          <p className="text-2xl font-extrabold text-[hsl(var(--text-primary))] mt-1">{(history || []).length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <p className="text-xs font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wide">Hired</p>
          <p className="text-2xl font-extrabold text-[hsl(var(--success))] mt-1">{totalHired}</p>
        </div>
        <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <p className="text-xs font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wide">Selected</p>
          <p className="text-2xl font-extrabold text-[hsl(var(--primary))] mt-1">{totalSelected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search by name, department, job..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-[hsl(var(--text-primary))]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer text-[hsl(var(--text-primary))]"
          >
            <option value="">All Statuses</option>
            <option value="SELECTED">Selected</option>
            <option value="HIRED">Hired</option>
          </select>
        </div>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer text-[hsl(var(--text-primary))]"
          >
            <option value="">All Jobs</option>
            {uniqueJobs.map((j) => <option key={j} value={j!}>{j}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoadingHistory ? (
        <LoadingSkeleton count={5} height="h-16" />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
          <TrendingUp className="h-12 w-12 text-[hsl(var(--text-muted))] mb-4" />
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">No hiring records yet</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
            {history?.length === 0
              ? 'When candidates are selected or hired, they will appear here.'
              : 'No results match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden sm:table-cell">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden md:table-cell">Dept / Batch</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden lg:table-cell">Updated</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden lg:table-cell">Joining Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide text-center hidden md:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--success)/0.1)] flex items-center justify-center text-[hsl(var(--success))] font-bold text-xs shrink-0">
                          {h.student?.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[hsl(var(--text-primary))]">{h.student?.user?.name}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">{h.student?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-[hsl(var(--text-secondary))] text-xs">
                        <Briefcase className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{h.job?.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--text-secondary))]">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {h.student?.department} &bull; {h.student?.batch}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[hsl(var(--text-muted))]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(h.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[hsl(var(--text-muted))]">
                      {h.joiningDate ? new Date(h.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-center">
                      <button
                        onClick={() => navigate(`/recruiter/applicants/${h.id}`)}
                        className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default HiringHistoryPage;
