import { useRecruiterData } from '../hooks/useRecruiterData';
import { StatCard, DataTable, StatusBadge, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { Users, UserCheck, Briefcase, Building, ExternalLink, Globe, MapPin } from 'lucide-react';
import type { Application } from '@/types';

export function RecruiterDashboard() {
  const { recruiter, company, applicants, isLoadingRecruiter, isLoadingApplicants } = useRecruiterData();

  if (isLoadingRecruiter || isLoadingApplicants) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  // Derive stats
  const totalApplicants = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEWING').length;
  const hiredCount = applicants.filter((a) => a.status === 'SELECTED').length;

  // Filter distinct jobs posted by company
  const activeJobsCount = Array.from(new Set(applicants.map((a) => a.job?.id))).length;

  // Table Columns config for recent applicants
  const columns: Column<Application>[] = [
    {
      header: 'Student Name',
      render: (row) => <span className="font-bold">{row.student?.user?.name || 'Unknown'}</span>,
    },
    {
      header: 'Applied Role',
      render: (row) => <span>{row.job?.title}</span>,
    },
    {
      header: 'GPA',
      render: (row) => <span>{row.student?.cgpa !== null ? row.student?.cgpa.toFixed(2) : 'N/A'}</span>,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Welcome back, {recruiter?.user?.name}!
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review candidates and manage recruitment status for your company.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Applicants"
          value={totalApplicants}
          icon={<Users className="h-6 w-6" />}
          description="Candidates applied for jobs"
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={<Briefcase className="h-6 w-6" />}
          description="In review & interview rounds"
        />
        <StatCard
          title="Selected (Hired)"
          value={hiredCount}
          icon={<UserCheck className="h-6 w-6" />}
          description="Candidates hired successfully"
        />
        <StatCard
          title="Active Positions"
          value={activeJobsCount}
          icon={<Building className="h-6 w-6" />}
          description="Unique job listings with applicants"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applicants Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Recent Applicants</h3>
          <DataTable
            columns={columns}
            data={applicants.slice(0, 5)}
            emptyTitle="No applicants yet"
            emptyMessage="No students have applied to your active job listings yet."
          />
        </div>

        {/* Company profile summary */}
        {company && (
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Company Details</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0 text-[hsl(var(--primary))] font-bold text-sm">
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-[hsl(var(--text-primary))]">{company.name}</h4>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{company.industry || 'Tech Industry'}</p>
                </div>
              </div>

              {company.description && (
                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">
                  {company.description}
                </p>
              )}

              <div className="space-y-2 pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] font-medium">
                {company.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    {company.location}
                  </p>
                )}
                {company.website && (
                  <p className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[hsl(var(--primary))] hover:underline flex items-center gap-1 font-bold"
                    >
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecruiterDashboard;
