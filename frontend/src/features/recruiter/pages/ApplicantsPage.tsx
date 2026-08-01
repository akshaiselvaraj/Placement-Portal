import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRecruiterData } from '../hooks/useRecruiterData';
import { useRecruiterJobs } from '@/features/jobs/hooks/useJobs';
import { recruiterService } from '../services/recruiter.service';
import type { ApplicantFilters } from '../services/recruiter.service';
import { StatusBadge, LoadingSkeleton } from '@/components/common';
import {
  Users, Search, Filter, ChevronRight, SlidersHorizontal,
  Briefcase, GraduationCap, CheckCircle, XCircle, MessageSquare
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'ASSESSMENT', label: 'Assessment' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'INTERVIEWING', label: 'Interviewing' },
  { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

function AtsScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 80 ? 'hsl(var(--success))' : pct >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--border))] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color }}>{Math.round(pct)}%</span>
    </div>
  );
}

export function ApplicantsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ApplicantFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');

  const { data: jobs } = useRecruiterJobs({});
  const { updateApplicantStatus, isUpdatingStatus } = useRecruiterData();

  const { data: applicants, isLoading, refetch } = useQuery({
    queryKey: ['recruiter-applicants', filters],
    queryFn: () => recruiterService.getApplicants(filters),
  });

  const setFilter = (key: keyof ApplicantFilters, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val || undefined }));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleAll = () => {
    if (!applicants) return;
    if (selectedIds.size === applicants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applicants.map((a) => a.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    for (const id of selectedIds) {
      await updateApplicantStatus({ id, data: { status: bulkStatus } });
    }
    setSelectedIds(new Set());
    setBulkStatus('');
    refetch();
  };

  const handleQuickStatus = async (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateApplicantStatus({ id, data: { status } });
    refetch();
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">Applicants</h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            {applicants?.length ?? 0} candidates in pipeline
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm font-semibold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={filters.search || ''}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] text-[hsl(var(--text-primary))]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer text-[hsl(var(--text-primary))]"
          >
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <select
            value={filters.jobId || ''}
            onChange={(e) => setFilter('jobId', e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer text-[hsl(var(--text-primary))]"
          >
            <option value="">All Jobs</option>
            {(jobs || []).map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      {/* Extended Filters Panel */}
      {showFilters && (
        <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in">
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Department</label>
            <input
              type="text"
              placeholder="e.g. CS, IT, ECE"
              value={filters.department || ''}
              onChange={(e) => setFilter('department', e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Grad Year</label>
            <input
              type="number"
              placeholder="2025"
              value={filters.gradYear || ''}
              onChange={(e) => setFilter('gradYear', e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Min ATS Score</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              max="100"
              value={filters.minAts || ''}
              onChange={(e) => setFilter('minAts', e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Min CGPA</label>
            <input
              type="number"
              placeholder="6.0"
              step="0.1"
              value={filters.minCgpa || ''}
              onChange={(e) => setFilter('minCgpa', e.target.value)}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] animate-in">
          <span className="text-sm font-semibold text-[hsl(var(--primary))]">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          >
            <option value="">Choose new status…</option>
            {STATUS_OPTIONS.filter(s => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || isUpdatingStatus}
            className="px-4 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-semibold disabled:opacity-50 cursor-pointer hover:opacity-90"
          >
            {isUpdatingStatus ? 'Updating…' : 'Update'}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 rounded-lg text-sm text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton count={5} height="h-16" />
      ) : !applicants || applicants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
          <Users className="h-12 w-12 text-[hsl(var(--text-muted))] mb-3" />
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">No applicants found</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">Try adjusting your filters or post a new job to attract candidates.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === applicants.length && applicants.length > 0}
                      onChange={toggleAll}
                      className="cursor-pointer w-4 h-4 rounded accent-[hsl(var(--primary))]"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden md:table-cell">Dept / Batch</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden lg:table-cell">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">ATS Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden sm:table-cell">CGPA</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide text-center hidden lg:table-cell">Actions</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {applicants.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/recruiter/applicants/${app.id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="cursor-pointer w-4 h-4 rounded accent-[hsl(var(--primary))]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-bold text-sm shrink-0 border border-[hsl(var(--primary)/0.15)]">
                          {app.student?.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-[hsl(var(--text-primary))]">{app.student?.user?.name}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">{app.student?.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-xs text-[hsl(var(--text-secondary))]">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {app.student?.department} &bull; {app.student?.batch}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-[hsl(var(--text-secondary))] line-clamp-1">
                      {app.job?.title}
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <AtsScoreBar score={app.atsScore || 0} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm font-bold text-[hsl(var(--text-primary))]">
                        {app.student?.cgpa?.toFixed(2) ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={(e) => handleQuickStatus(app.id, 'SHORTLISTED', e)}
                          className="p-1 rounded-md hover:bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] transition-colors cursor-pointer"
                          title="Shortlist"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleQuickStatus(app.id, 'REJECTED', e)}
                          className="p-1 rounded-md hover:bg-[hsl(var(--danger)/0.1)] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                          title="Reject"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/recruiter/applicants/${app.id}`); }}
                          className="p-1 rounded-md hover:bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-[hsl(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
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

export default ApplicantsPage;
