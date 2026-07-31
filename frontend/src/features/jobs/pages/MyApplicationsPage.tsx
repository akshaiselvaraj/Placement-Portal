import { useStudentApplications, useWithdrawApplication } from '../hooks/useJobs';
import { LoadingSkeleton, StatusBadge } from '@/components/common';
import {
  ClipboardList,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  XCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function MyApplicationsPage() {
  const { data: applications, isLoading } = useStudentApplications();
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = async (id: string) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await withdrawMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Failed to withdraw application');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPLIED': return <Clock className="h-4 w-4 text-[hsl(var(--primary))]" />;
      case 'SHORTLISTED': return <CheckCircle2 className="h-4 w-4 text-[hsl(var(--info))]" />;
      case 'INTERVIEWING': return <Calendar className="h-4 w-4 text-[hsl(var(--warning))]" />;
      case 'SELECTED': return <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />;
      case 'REJECTED': return <XCircle className="h-4 w-4 text-[hsl(var(--danger))]" />;
      case 'WITHDRAWN': return <AlertTriangle className="h-4 w-4 text-[hsl(var(--text-muted))]" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLine = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'Your application is under review.';
      case 'SHORTLISTED': return 'Congratulations! You have been shortlisted.';
      case 'INTERVIEWING': return 'Interview round is in progress.';
      case 'SELECTED': return '🎉 You have been selected!';
      case 'REJECTED': return 'Unfortunately, your application was not successful.';
      case 'WITHDRAWN': return 'You withdrew this application.';
      default: return '';
    }
  };

  const canWithdraw = (status: string) =>
    !['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(status);

  if (isLoading) {
    return <LoadingSkeleton count={4} height="h-28" className="mt-8 animate-in" />;
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          My Applications
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Summary counts */}
      {applications && applications.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {['APPLIED', 'SHORTLISTED', 'INTERVIEWING', 'SELECTED', 'REJECTED', 'WITHDRAWN'].map((status) => {
            const count = applications.filter((a) => a.status === status).length;
            if (count === 0) return null;
            return (
              <span
                key={status}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-xs font-semibold text-[hsl(var(--text-secondary))]"
              >
                {getStatusIcon(status)}
                {status}: {count}
              </span>
            );
          })}
        </div>
      )}

      {/* Applications list */}
      {!applications || applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-[hsl(var(--text-muted))]" />
          </div>
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">No applications yet</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
            Browse open jobs and apply to start building your career!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Company logo */}
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--primary)/0.05)] flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-[hsl(var(--primary))]">
                    {app.job?.company?.name?.substring(0, 2).toUpperCase() || 'CO'}
                  </span>
                </div>

                {/* Job info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))] line-clamp-1">
                    {app.job?.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-[hsl(var(--text-secondary))]">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {app.job?.company?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {app.job?.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {app.job?.location}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-muted))] flex items-center gap-1.5 mt-1">
                    {getStatusIcon(app.status)}
                    {getStatusLine(app.status)}
                  </p>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right space-y-1.5">
                    <StatusBadge status={app.status} />
                    <p className="text-[10px] text-[hsl(var(--text-muted))]">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {canWithdraw(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      disabled={withdrawMutation.isPending}
                      className="p-2 rounded-lg hover:bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                      title="Withdraw Application"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
