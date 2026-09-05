import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import type { ExtensionUserItem } from '../services/admin.service';
import { DataTable, SearchInput, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { Power, PowerOff, ExternalLink, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const OFFICIAL_PS_PORTAL = 'https://ps.bitsathy.ac.in/';

export function UsersManagement() {
  const [users, setUsers] = useState<ExtensionUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'fullName' | 'email'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getExtensionUsers({
        search: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy,
        order,
        page,
        limit: 10,
      });
      setUsers(res.users);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error('Failed to fetch extension users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, sortBy, order, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: ExtensionUserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updateExtensionUserStatus(user.id, nextStatus);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const columns: Column<ExtensionUserItem>[] = [
    {
      header: '#',
      render: (_row: ExtensionUserItem, idx?: number) => (
        <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">
          {(page - 1) * 10 + (idx != null ? idx + 1 : 1)}
        </span>
      ),
    },
    {
      header: 'Name',
      render: (row) => (
        <Link
          to={`/admin/users/${row.id}`}
          className="font-bold text-sm text-[hsl(var(--primary))] hover:underline"
        >
          {row.fullName}
        </Link>
      ),
    },
    {
      header: 'Email',
      render: (row) => <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{row.email}</span>,
    },
    {
      header: 'Registered',
      render: (row) => (
        <span className="text-xs text-[hsl(var(--text-secondary))]">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Last Activity',
      render: (row) => (
        <span className="text-xs text-[hsl(var(--text-secondary))]">
          {row.lastActivity ? new Date(row.lastActivity).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Version',
      render: (row) => (
        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))]">
          v{row.extensionVersion || '1.0.0'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const isAct = row.status === 'ACTIVE';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
              isAct
                ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
                : 'bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]'
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* View Details */}
          <Link
            to={`/admin/users/${row.id}`}
            title="View User Details"
            className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-hover))] text-[hsl(var(--text-primary))] transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>

          {/* Open PS Portal Button */}
          <a
            href={OFFICIAL_PS_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Official PS Portal"
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)] transition-all"
          >
            <span>PS Portal</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Status Toggle */}
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              row.status === 'ACTIVE'
                ? 'border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.2)]'
                : 'border-[hsl(var(--success)/0.2)] bg-[hsl(var(--success-light))] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.2)]'
            }`}
          >
            {row.status === 'ACTIVE' ? (
              <PowerOff className="h-3.5 w-3.5" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Users Management
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            View registered extension users, inspect privacy logs, and control access permissions. Total: {totalCount}
          </p>
        </div>

        <a
          href={OFFICIAL_PS_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl shadow-xs transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          Open PS Portal
        </a>
      </div>

      {/* Controls & Filter Panel */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80">
          <SearchInput
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            placeholder="Search by name or email..."
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-3 items-center">
          {/* Status Filter */}
          <div className="w-36">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-36">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs font-semibold text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              <option value="createdAt">Reg Date</option>
              <option value="fullName">Name</option>
              <option value="email">Email</option>
            </select>
          </div>

          {/* Order */}
          <button
            onClick={() => setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-hover))]"
          >
            {order.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            emptyTitle="No extension users found"
            emptyMessage="No accounts match your search parameters."
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
              <span className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                Page {page} of {totalPages} ({totalCount} items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] disabled:opacity-40 text-[hsl(var(--text-primary))] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] disabled:opacity-40 text-[hsl(var(--text-primary))] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UsersManagement;
