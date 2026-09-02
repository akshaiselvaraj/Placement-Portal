import { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import type { DashboardStatsData } from '../services/admin.service';
import { StatCard, DataTable, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { Users, UserCheck, UserPlus, Activity, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const OFFICIAL_PS_PORTAL = 'https://ps.bitsathy.ac.in/';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <LoadingSkeleton count={4} height="h-32" className="mt-8 animate-in" />;
  }

  const columns: Column<any>[] = [
    {
      header: 'Activity Type',
      render: (row) => (
        <span className="font-bold text-xs px-2.5 py-1 rounded-full bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]">
          {row.activityType}
        </span>
      ),
    },
    {
      header: 'User Email / ID',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-xs text-[hsl(var(--text-primary))]">
            {row.user?.fullName || row.userId || 'System'}
          </span>
          <span className="text-[10px] text-[hsl(var(--text-secondary))]">
            {row.user?.email || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-[hsl(var(--text-secondary))]">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: () => (
        <a
          href={OFFICIAL_PS_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))] hover:underline"
        >
          <span>Open PS Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Admin Overview & Extension Analytics
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Monitor extension registration, active users, activity logs, and system operations.
        </p>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="h-6 w-6 text-indigo-500" />}
          description="Extension user accounts"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers ?? 0}
          icon={<UserCheck className="h-6 w-6 text-emerald-500" />}
          description="Currently active status"
        />
        <StatCard
          title="New Users Today"
          value={stats?.newUsersToday ?? 0}
          icon={<UserPlus className="h-6 w-6 text-blue-500" />}
          description="Registered in last 24h"
        />
        <StatCard
          title="Recent Activity"
          value={stats?.recentActivityCount ?? 0}
          icon={<Activity className="h-6 w-6 text-amber-500" />}
          description="System activity logs"
        />
      </div>

      {/* Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Users Management</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">View user table, search & filter</p>
          </div>
          <Users className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>

        <Link
          to="/admin/activity"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Activity Stream</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Privacy-conscious audit logs</p>
          </div>
          <Activity className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>

        <a
          href={OFFICIAL_PS_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Official PS Portal</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Open https://ps.bitsathy.ac.in/</p>
          </div>
          <ExternalLink className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </a>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Recent System Activity</h3>
          <Link to="/admin/activity" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
            View All Activity →
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={stats?.recentActivity || []}
          emptyTitle="No recent activity logged"
          emptyMessage="Activities like user registration and extension opens will appear here."
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
