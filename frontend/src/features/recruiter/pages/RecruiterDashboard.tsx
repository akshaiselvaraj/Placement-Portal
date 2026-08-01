import { useNavigate } from 'react-router-dom';
import { useRecruiterData } from '../hooks/useRecruiterData';
import { StatCard, StatusBadge, LoadingSkeleton } from '@/components/common';
import { Users, UserCheck, Briefcase, Building, Clock, CheckCircle2, XCircle, Star, ChevronRight } from 'lucide-react';

function AtsScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
      : score >= 60
      ? 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]'
      : 'bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      <Star className="h-3 w-3" />
      {score}%
    </span>
  );
}

export function RecruiterDashboard() {
  const navigate = useNavigate();
  const { recruiter, dashboard, isLoadingRecruiter, isLoadingDashboard } = useRecruiterData();

  if (isLoadingRecruiter || isLoadingDashboard) {
    return <LoadingSkeleton count={4} height="h-28" className="mt-8 animate-in" />;
  }

  const stats = dashboard?.stats;
  const recentApplications = dashboard?.recentApplications || [];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Welcome back, {recruiter?.user?.name}!
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Here's a live overview of your recruitment pipeline.
        </p>
      </div>

      {/* Stats Row 1 - Applicant Pipeline */}
      <div>
        <p className="text-xs font-semibold text-[hsl(var(--text-muted))] uppercase tracking-widest mb-3">Candidate Pipeline</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Applied" value={stats?.totalApplicants ?? 0} icon={<Users className="h-5 w-5" />} description="Total applications" />
          <StatCard title="Under Review" value={stats?.underReviewCount ?? 0} icon={<Clock className="h-5 w-5" />} description="Being reviewed" />
          <StatCard title="Shortlisted" value={stats?.shortlistedCount ?? 0} icon={<Star className="h-5 w-5" />} description="Shortlisted candidates" />
          <StatCard title="Interview" value={stats?.inInterviewCount ?? 0} icon={<UserCheck className="h-5 w-5" />} description="In interview stage" />
          <StatCard title="Selected" value={stats?.selectedCount ?? 0} icon={<CheckCircle2 className="h-5 w-5" />} description="Offer extended" />
          <StatCard title="Hired" value={stats?.hiredCount ?? 0} icon={<Briefcase className="h-5 w-5" />} description="Joined company" />
        </div>
      </div>

      {/* Stats Row 2 - Job Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Active Jobs" value={stats?.activeJobsCount ?? 0} icon={<Briefcase className="h-5 w-5" />} description="Currently open" />
        <StatCard title="Closed Jobs" value={stats?.closedJobsCount ?? 0} icon={<XCircle className="h-5 w-5" />} description="Closed / Filled" />
        <StatCard title="Rejected" value={stats?.rejectedCount ?? 0} icon={<XCircle className="h-5 w-5" />} description="Rejected applications" />
        <StatCard title="Total Pipeline" value={(stats?.totalApplicants ?? 0)} icon={<Building className="h-5 w-5" />} description="All applications" />
      </div>

      {/* Recent Applications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Recent Applications</h3>
          <button
            onClick={() => navigate('/recruiter/applicants')}
            className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))] hover:underline cursor-pointer"
          >
            View All <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {recentApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <Users className="h-10 w-10 text-[hsl(var(--text-muted))] mb-3" />
            <h4 className="text-base font-bold text-[hsl(var(--text-primary))]">No applications yet</h4>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Applications for your active job postings will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">Candidate</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden sm:table-cell">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide hidden md:table-cell">Applied</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">ATS</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {recentApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/recruiter/applicants/${app.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-bold text-xs shrink-0">
                          {app.studentName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[hsl(var(--text-primary))] line-clamp-1">{app.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--text-secondary))] hidden sm:table-cell line-clamp-1">{app.jobTitle}</td>
                    <td className="px-4 py-3 text-[hsl(var(--text-muted))] text-xs hidden md:table-cell">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AtsScoreBadge score={Math.round(app.atsScore)} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-[hsl(var(--text-muted))] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
