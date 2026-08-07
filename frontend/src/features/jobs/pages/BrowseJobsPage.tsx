import { useState } from 'react';
import { usePublicJobs, useApplyToJob, useEligibilityCheck } from '../hooks/useJobs';
import { LoadingSkeleton } from '@/components/common';
import type { Job } from '@/types';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowRight,
  X,
  Send,
  GraduationCap,
  Award,
  Cpu,
} from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

export function BrowseJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const { data: jobs, isLoading } = usePublicJobs({
    search: searchQuery || undefined,
    type: typeFilter || undefined,
  });
  const applyMutation = useApplyToJob();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${(min / 100000).toFixed(1)}L – ₹${(max / 100000).toFixed(1)}L`;
    if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
    return `Up to ₹${(max! / 100000).toFixed(1)}L`;
  };

  const daysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Expired';
    if (diff === 0) return 'Last day';
    if (diff === 1) return '1 day left';
    return `${diff} days left`;
  };

  const handleApply = async (jobId: string) => {
    try {
      await applyMutation.mutateAsync(jobId);
      setSelectedJob(null);
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit application');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={6} height="h-40" className="mt-8 animate-in" />;
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Browse Jobs
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Discover and apply to open positions matching your skills
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search by title or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))] font-medium">
        <Briefcase className="h-4 w-4" />
        <span>{jobs?.length ?? 0} open positions available</span>
      </div>

      {/* Jobs list */}
      {!jobs || jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-[hsl(var(--text-muted))]" />
          </div>
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">No open jobs right now</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
            Check back later or adjust your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:border-[hsl(var(--primary)/0.3)] cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start gap-4">
                {/* Company logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[hsl(var(--primary))]">
                    {job.company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                  <div>
                    <h3 className="text-base font-bold text-[hsl(var(--text-primary))] line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))] font-medium flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {job.company?.name}
                    </p>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] font-medium">
                      <Briefcase className="h-3 w-3" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] font-medium">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] font-medium">
                      <DollarSign className="h-3 w-3" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--text-muted))]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {job._count?.applications ?? 0} applied
                    </span>
                    <span className="flex items-center gap-1 font-medium" style={{
                      color: new Date(job.deadline) < new Date() ? 'hsl(var(--danger))' : 'hsl(var(--success))'
                    }}>
                      <Clock className="h-3.5 w-3.5" />
                      {daysLeft(job.deadline)}
                    </span>
                  </div>
                </div>

                {/* Arrow on hover */}
                <ArrowRight className="h-5 w-5 text-[hsl(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Job Detail & Apply Modal ───────────────────── */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplying={applyMutation.isPending}
        />
      )}
    </div>
  );
}

// ── Sub-component: Job detail modal ───────────────────────
interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onApply: (jobId: string) => void;
  isApplying: boolean;
}

function JobDetailModal({ job, onClose, onApply, isApplying }: JobDetailModalProps) {
  const { data: eligibility, isLoading: isCheckingEligibility } = useEligibilityCheck(job.id);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `₹${(min / 100000).toFixed(1)}L – ₹${(max / 100000).toFixed(1)}L`;
    if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
    return `Up to ₹${(max! / 100000).toFixed(1)}L`;
  };

  const deadlinePassed = new Date(job.deadline) < new Date();

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-2xl animate-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header banner */}
          <div className="relative p-6 bg-linear-to-r from-[hsl(var(--primary)/0.08)] to-transparent border-b border-[hsl(var(--border))]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-[hsl(var(--primary))]">
                  {job.company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">{job.title}</h3>
                <p className="text-sm text-[hsl(var(--text-secondary))] font-medium">{job.company?.name}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta pills */}
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] text-xs font-semibold">
                <Briefcase className="h-3.5 w-3.5" />
                {job.type}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] text-xs font-semibold">
                <DollarSign className="h-3.5 w-3.5" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-2">Description</h4>
              <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {/* Eligibility */}
            {job.eligibility && (
              <div>
                <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-2 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Eligibility
                </h4>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{job.eligibility}</p>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-2">Requirements</h4>
                <p className="text-sm text-[hsl(var(--text-secondary))] whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}

            {/* Eligibility check result */}
            {!isCheckingEligibility && eligibility && (
              <div
                className={`rounded-xl p-4 border ${
                  eligibility.eligible
                    ? 'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.06)]'
                    : 'border-[hsl(var(--danger)/0.3)] bg-[hsl(var(--danger)/0.06)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {eligibility.eligible ? (
                    <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
                  ) : (
                    <XCircle className="h-5 w-5 text-[hsl(var(--danger))]" />
                  )}
                  <span className={`text-sm font-bold ${eligibility.eligible ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}`}>
                    {eligibility.eligible ? 'You are eligible!' : 'Not eligible'}
                  </span>
                </div>
                <div className="text-xs text-[hsl(var(--text-secondary))] space-y-1">
                  <p>Your CGPA: <strong>{eligibility.studentCgpa ?? 'N/A'}</strong> | Required: <strong>{eligibility.requiredCgpa}</strong></p>
                  {eligibility.requiredActivityPoints !== undefined && eligibility.requiredActivityPoints > 0 && (
                    <p>Your Activity Points: <strong>{eligibility.studentActivityPoints ?? 0}</strong> | Required: <strong>{eligibility.requiredActivityPoints}</strong></p>
                  )}
                  <p className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Profile verification: <strong>{eligibility.profileVerified ? 'Verified' : 'Pending'}</strong>
                  </p>
                </div>

                {eligibility.atsScore !== undefined && (
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-purple-500 animate-pulse" />
                        ATS Match Score
                      </span>
                      <span className="font-extrabold text-purple-600 dark:text-purple-400">{eligibility.atsScore}%</span>
                    </div>
                    <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-550 ${
                          eligibility.atsScore >= 80
                            ? 'bg-emerald-500'
                            : eligibility.atsScore >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${eligibility.atsScore}%` }}
                      />
                    </div>

                    {eligibility.atsBreakdown && (
                      <div className="space-y-3 pt-1">
                        {/* Matched / Missing skills */}
                        {((eligibility.atsBreakdown.matchedSkills && eligibility.atsBreakdown.matchedSkills.length > 0) || 
                          (eligibility.atsBreakdown.missingSkills && eligibility.atsBreakdown.missingSkills.length > 0)) && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                              Skills Match Analysis
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {eligibility.atsBreakdown.matchedSkills?.map((skill: string) => (
                                <span key={skill} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                  ✓ {skill}
                                </span>
                              ))}
                              {eligibility.atsBreakdown.missingSkills?.map((skill: string) => (
                                <span key={skill} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20">
                                  ✗ {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations / explanations */}
                        {eligibility.atsBreakdown.explanations && eligibility.atsBreakdown.explanations.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                              Recommendations & Matching Info
                            </span>
                            <ul className="list-disc pl-4 text-[10px] text-[hsl(var(--text-secondary))] font-medium space-y-1">
                              {eligibility.atsBreakdown.explanations.map((exp: string, idx: number) => {
                                const isWarning = exp.includes('below') || exp.includes('not in') || exp.includes('Missing') || exp.includes('not provided');
                                return (
                                  <li key={idx} className={isWarning ? 'text-rose-500/90 dark:text-rose-400/90' : 'text-emerald-600/90 dark:text-emerald-400/90'}>
                                    {exp}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        {/* AI Content / Plagiarism Score */}
                        {eligibility.atsBreakdown.aiPlagiarismScore !== undefined && (
                          <div className="pt-2.5 border-t border-[hsl(var(--border))] flex items-center justify-between text-[10px] mt-1.5">
                            <span className="font-bold text-[hsl(var(--text-secondary))] flex items-center gap-1">
                              <Cpu className="h-3 w-3 text-indigo-500" />
                              AI Content Scanner
                            </span>
                            <span className={`font-extrabold px-1.5 py-0.5 rounded ${
                              eligibility.atsBreakdown.aiPlagiarismScore >= 70
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                                : eligibility.atsBreakdown.aiPlagiarismScore >= 35
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {eligibility.atsBreakdown.aiPlagiarismScore}% {eligibility.atsBreakdown.aiPlagiarismScore >= 70 ? 'AI Generated' : eligibility.atsBreakdown.aiPlagiarismScore >= 35 ? 'Mixed Content' : 'Human Written'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Apply button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => onApply(job.id)}
                disabled={isApplying || deadlinePassed || (eligibility && !eligibility.eligible)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer shadow-md"
              >
                <Send className="h-4 w-4" />
                {isApplying ? 'Applying…' : deadlinePassed ? 'Deadline Passed' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BrowseJobsPage;
