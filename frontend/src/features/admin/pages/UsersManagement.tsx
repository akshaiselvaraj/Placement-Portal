import { useState } from 'react';
import { useAdminData } from '../hooks/useAdminData';
import { DataTable, SearchInput, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { Power, PowerOff, ShieldAlert } from 'lucide-react';
import type { User } from '@/types';

export function UsersManagement() {
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { users, isLoadingUsers, toggleUserStatus, isTogglingStatus } = useAdminData({
    role: roleFilter || undefined,
    search: searchTerm || undefined,
  });

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus({ id: user.id, isActive: !user.isActive });
    } catch (e) {}
  };

  const columns: Column<User>[] = [
    {
      header: 'Name',
      render: (row) => <span className="font-bold">{row.name || 'Unknown'}</span>,
    },
    {
      header: 'Email',
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
      header: 'Account State',
      render: (row) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
          row.isActive
            ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
            : 'bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          disabled={isTogglingStatus}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
            row.isActive
              ? 'border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] text-[hsl(var(--danger))]'
              : 'border-[hsl(var(--success)/0.2)] bg-[hsl(var(--success-light))] hover:bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]'
          }`}
        >
          {row.isActive ? (
            <>
              <PowerOff className="h-3.5 w-3.5" />
              Deactivate
            </>
          ) : (
            <>
              <Power className="h-3.5 w-3.5" />
              Activate
            </>
          )}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          User Management
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review, activate, and deactivate registered users on the system.
        </p>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-auto flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by user name or email..."
          />
        </div>

        <div className="w-full md:w-auto flex gap-3">
          <div className="w-full md:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="PLACEMENT_OFFICER">Placement Officer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      {isLoadingUsers ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          emptyTitle="No users found"
          emptyMessage="No accounts match your query parameters."
        />
      )}
    </div>
  );
}

export default UsersManagement;
