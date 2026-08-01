import { usePlacementData } from '../hooks/usePlacementData';
import { StatCard, DataTable, StatusBadge, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { FileText, Globe, CheckSquare, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Application } from '@/types';

export function PlacementDashboard() {
  const { students, resumes, portfolios, applications, isLoadingStudents, isLoadingApplications } = usePlacementData();

  if (isLoadingStudents || isLoadingApplications) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  // Derive stats
  const pendingVerification = students.filter((s) => s.profileStatus === 'PENDING').length;
  const verifiedStudents = students.filter((s) => s.profileStatus === 'VERIFIED').length;

  const pendingResumes = resumes.filter((r) => !r.isApproved).length;
  const pendingPortfolios = portfolios.filter((p) => !p.isApproved).length;
  
  const totalApplicationsCount = applications.length;

  const columns: Column<Application>[] = [
    {
      header: 'Student Name',
      render: (row) => <span className="font-bold">{row.student?.user?.name || 'Unknown'}</span>,
    },
    {
      header: 'Company / Role',
      render: (row) => (
        <span>
          {row.job?.company?.name || 'Unknown'} — {row.job?.title || 'Unknown'}
        </span>
      ),
    },
    {
      header: 'CGPA',
      render: (row) => <span>{row.student?.cgpa !== null ? row.student?.cgpa.toFixed(2) : 'N/A'}</span>,
    },
    {
      header: 'Applied Date',
      render: (row) => <span>{new Date(row.appliedAt).toLocaleDateString()}</span>,
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
          Placement Officer Control Center
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Monitor student validation queues, template reviews, and schedule interviews.
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Verified Students"
          value={verifiedStudents}
          icon={<ShieldCheck className="h-6 w-6" />}
          description={`${pendingVerification} profile(s) pending`}
        />
        <StatCard
          title="Resume Queue"
          value={pendingResumes}
          icon={<FileText className="h-6 w-6" />}
          description="Awaiting template approval"
        />
        <StatCard
          title="Portfolio Queue"
          value={pendingPortfolios}
          icon={<Globe className="h-6 w-6" />}
          description="Awaiting design approvals"
        />
        <StatCard
          title="Applications Sent"
          value={totalApplicationsCount}
          icon={<CheckSquare className="h-6 w-6" />}
          description="Total applications sent across drives"
        />
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/placement/students"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Student Profiles</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Review & Verify credentials</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>

        <Link
          to="/placement/approvals"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Approvals Desk</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Validate resumes & portfolios</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>

        <Link
          to="/placement/scheduler"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Scheduling Desk</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Book technical/HR interviews</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>

        <Link
          to="/placement/results"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Publish Results</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Mark selected candidates</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>
      </div>

      {/* Global Application Tracker */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Global Application Tracker</h3>
        <DataTable
          columns={columns}
          data={applications.slice(0, 10)}
          emptyTitle="No applications found"
          emptyMessage="No students have submitted applications yet."
        />
      </div>
    </div>
  );
}

export default PlacementDashboard;
