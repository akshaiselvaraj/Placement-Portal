import { useStudentProfile } from '../hooks/useStudentProfile';
import { StatCard, DataTable, StatusBadge, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { Briefcase, GraduationCap, Calendar, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Application } from '@/types';

export function StudentDashboard() {
  const { student, isLoading, isError } = useStudentProfile();

  if (isLoading) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  if (isError || !student) {
    return (
      <div className="p-8 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] mt-8">
        <p className="text-sm text-[hsl(var(--text-secondary))]">Failed to load dashboard statistics.</p>
      </div>
    );
  }

  // Derive stats
  const totalApps = student.applications?.length || 0;
  const isPlaced = student.applications?.some(app => app.status === 'SELECTED') || false;
  
  // Find scheduled interviews (Phase 8 interview scheduler feeds this, let's extract them from applications or drives)
  // Let's filter applications that have interviews
  const upcomingInterviews = student.applications
    ?.flatMap(app => app.interviews || [])
    ?.filter(int => int.status === 'SCHEDULED')
    ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // Table Columns config
  const columns: Column<Application>[] = [
    {
      header: 'Company',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[hsl(var(--muted))] flex items-center justify-center font-bold text-xs">
            {row.job?.company?.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold">{row.job?.company?.name}</span>
        </div>
      ),
    },
    {
      header: 'Job Role',
      render: (row) => <span>{row.job?.title}</span>,
    },
    {
      header: 'Applied Date',
      render: (row) => (
        <span>
          {new Date(row.appliedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
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
          Welcome back, {student.user?.name}!
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Monitor your campus placement progress and manage your profile.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Academic Score"
          value={student.cgpa !== null ? `${student.cgpa.toFixed(2)} CGPA` : 'N/A'}
          icon={<GraduationCap className="h-6 w-6" />}
          description={`Registered in ${student.department}`}
        />
        <StatCard
          title="Applications Sent"
          value={totalApps}
          icon={<Briefcase className="h-6 w-6" />}
          description="Total jobs applied"
        />
        <StatCard
          title="Placement Status"
          value={isPlaced ? 'Placed' : 'Searching'}
          icon={<CheckCircle2 className="h-6 w-6" />}
          description={isPlaced ? 'Selected by Recruiter' : 'Looking for job opportunities'}
        />
        <StatCard
          title="Verification Status"
          value={student.profileStatus}
          icon={<Clock className="h-6 w-6" />}
          description="Student profile eligibility status"
        />
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications list (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Recent Applications</h3>
          </div>
          <DataTable
            columns={columns}
            data={student.applications || []}
            emptyTitle="No applications found"
            emptyMessage="You have not applied to any job roles yet. Head over to Job Postings to browse opportunities."
          />
        </div>

        {/* Sidebar info: interviews list (1/3 width) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Upcoming Interviews</h3>
          
          {upcomingInterviews.length === 0 ? (
            <div className="p-6 text-center border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-10">
              <Calendar className="h-8 w-8 text-[hsl(var(--text-muted))] mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">No interviews scheduled</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                You will be notified once a recruiter schedules a session.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {upcomingInterviews.map((int) => (
                <div
                  key={int.id}
                  className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                        {int.application?.job?.company?.name}
                      </h4>
                      <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                        {int.type} Round
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-[10px] font-bold tracking-wide uppercase">
                      Scheduled
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[hsl(var(--text-secondary))]">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                      {new Date(int.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {int.location && (
                      <p className="flex items-center gap-1.5 font-medium truncate">
                        <Briefcase className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                        {int.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
