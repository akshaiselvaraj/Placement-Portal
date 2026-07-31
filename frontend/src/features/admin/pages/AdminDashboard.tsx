import { useAdminData } from '../hooks/useAdminData';
import { StatCard, DataTable, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { Users, Building, ShieldAlert, ArrowUpRight, ShieldCheck, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '@/types';

export function AdminDashboard() {
  const { users, companies, isLoadingUsers, isLoadingCompanies } = useAdminData();

  if (isLoadingUsers || isLoadingCompanies) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  // Derive stats
  const totalUsers = users.length;
  const studentsCount = users.filter((u) => u.role === 'STUDENT').length;
  const recruitersCount = users.filter((u) => u.role === 'RECRUITER').length;
  const officersCount = users.filter((u) => u.role === 'PLACEMENT_OFFICER').length;
  const activeCompaniesCount = companies.length;

  const columns: Column<User>[] = [
    {
      header: 'User Name',
      render: (row) => <span className="font-bold">{row.name || 'Unknown'}</span>,
    },
    {
      header: 'Email Address',
      render: (row) => <span>{row.email}</span>,
    },
    {
      header: 'Role',
      render: (row) => (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
          row.role === 'ADMIN'
            ? 'bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]'
            : row.role === 'PLACEMENT_OFFICER'
            ? 'bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]'
            : row.role === 'RECRUITER'
            ? 'bg-[hsl(var(--info-light))] text-[hsl(var(--info))]'
            : 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'Account Status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
          row.isActive ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]'
        }`}>
          {row.isActive ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          System Administration
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Manage system users, activate/deactivate accounts, and register corporate entities.
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Platform Users"
          value={totalUsers}
          icon={<Users className="h-6 w-6" />}
          description={`${studentsCount} Student(s) registered`}
        />
        <StatCard
          title="Active Recruiters"
          value={recruitersCount}
          icon={<Building className="h-6 w-6" />}
          description={`Representing ${activeCompaniesCount} companies`}
        />
        <StatCard
          title="Placement Officers"
          value={officersCount}
          icon={<Shield className="h-6 w-6" />}
          description="Verification supervisors"
        />
        <StatCard
          title="Registered Companies"
          value={activeCompaniesCount}
          icon={<Building className="h-6 w-6" />}
          description="Direct corporate relationships"
        />
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Manage Users</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Activate/Deactivate and view logs</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>

        <Link
          to="/admin/companies"
          className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex items-center justify-between group shadow-2xs"
        >
          <div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">Manage Companies</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Register and update business profiles</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[hsl(var(--text-muted))] group-hover:text-[hsl(var(--primary))] transition-colors" />
        </Link>
      </div>

      {/* Recent Users list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Recently Registered Users</h3>
        <DataTable
          columns={columns}
          data={users.slice(0, 5)}
          emptyTitle="No registered users"
          emptyMessage="No accounts exist in the database yet."
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
