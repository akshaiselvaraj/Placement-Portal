import { useStudentProfile } from '../hooks/useStudentProfile';
import { StatCard, DataTable, StatusBadge, LoadingSkeleton } from '@/components/common';
import { Link } from 'react-router-dom';
import type { Column } from '@/components/common';
import { Briefcase, GraduationCap, Calendar, Clock, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import type { Application } from '@/types';
import { PSCard, PSCoursesCard } from '@/features/ps';

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

  // Calculate Placement Readiness
  let readinessScore = 20; // base score
  const recommendations: string[] = [];
  
  if (student.cgpa !== null) {
    readinessScore += 15;
  } else {
    recommendations.push('Add CGPA score in your profile (+15%)');
  }

  if (student.educations && student.educations.length > 0) {
    readinessScore += 15;
  } else {
    recommendations.push('Add educational qualifications (+15%)');
  }

  if (student.projects && student.projects.length > 0) {
    readinessScore += 15;
  } else {
    recommendations.push('Add a software/engineering project (+15%)');
  }

  if (student.skills && student.skills.length >= 2) {
    readinessScore += 15;
  } else if (student.skills && student.skills.length > 0) {
    readinessScore += 10;
    recommendations.push('Add at least 2 skills in your profile (+5%)');
  } else {
    recommendations.push('Declare your technical skills (+15%)');
  }

  if (student.certifications && student.certifications.length > 0) {
    readinessScore += 15;
  } else {
    recommendations.push('Add a certification credential (+15%)');
  }

  const hasPortfolio = student.portfolios && student.portfolios.length > 0;
  if (hasPortfolio && student.portfolios?.[0]?.isPublished) {
    readinessScore += 5;
  } else {
    recommendations.push('Generate and publish your portfolio site (+5%)');
  }

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

      {student.profileStatus === 'REJECTED' && (
        <div className="p-5 rounded-2xl border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-[hsl(var(--danger)/0.1)] text-[hsl(var(--danger))] shrink-0">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-[hsl(var(--danger))] text-sm">
                Action Required: Profile Verification Rejected
              </h4>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                Your profile verification has been rejected by the Placement Officer. 
                Please update your credentials and reapply on the Profile page to restore eligibility.
              </p>
            </div>
          </div>
          <Link
            to="/student/profile"
            className="px-5 py-2.5 text-xs font-bold text-white bg-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.9)] transition-colors rounded-xl text-center shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
          >
            Go to Profile
          </Link>
        </div>
      )}

      {/* Placement Readiness Score card */}
      <div className="relative p-6 rounded-2xl border border-purple-500/10 bg-linear-to-r from-purple-500/10 via-indigo-500/5 to-transparent shadow-xs overflow-hidden flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 uppercase tracking-wide">
              Level Up Profile
            </span>
            <span className="text-xs text-[hsl(var(--text-secondary))] font-bold">Your placement preparation roadmap</span>
          </div>
          
          <h3 className="text-xl font-black text-[hsl(var(--text-primary))]">
            Placement Readiness: <span className="text-purple-450">{readinessScore}%</span>
          </h3>

          {/* Progress bar */}
          <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-linear-to-r from-purple-500 to-indigo-650 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            />
          </div>

          {/* Recommendations list */}
          {recommendations.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-[hsl(var(--text-secondary))]">Recommendations:</p>
              <ul className="text-xs font-semibold text-[hsl(var(--text-secondary))] list-disc pl-4 space-y-1">
                {recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs font-bold text-[hsl(var(--success))] flex items-center gap-1.5">
              🎉 Outstanding! Your profile is 100% complete and fully placement-ready.
            </p>
          )}
        </div>

        {/* Level up action link */}
        <div className="flex items-center">
          <Link
            to="/student/profile"
            className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all cursor-pointer whitespace-nowrap"
          >
            Enhance Profile <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
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
        <div className="space-y-6">
          <PSCard />

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
                        {int.roundType} Round
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

      <PSCoursesCard />
    </div>
  );
}

export default StudentDashboard;
