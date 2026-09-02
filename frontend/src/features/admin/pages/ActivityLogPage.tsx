import { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import type { ExtensionActivityItem } from '../services/admin.service';
import { DataTable, LoadingSkeleton } from '@/components/common';
import type { Column } from '@/components/common';
import { ExternalLink, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const OFFICIAL_PS_PORTAL = 'https://ps.bitsathy.ac.in/';

export function ActivityLogPage() {
  const [logs, setLogs] = useState<ExtensionActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getActivityLogs({ page, limit: 15 });
      setLogs(res.logs);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns: Column<ExtensionActivityItem>[] = [
    {
      header: 'Activity Type',
      render: (row) => (
        <span className="font-extrabold text-[11px] px-2.5 py-1 rounded-full bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]">
          {row.activityType}
        </span>
      ),
    },
    {
      header: 'User Profile',
      render: (row) => (
        <div className="flex flex-col">
          {row.user ? (
            <Link
              to={`/admin/users/${row.user.id}`}
              className="font-bold text-xs text-[hsl(var(--primary))] hover:underline"
            >
              {row.user.fullName}
            </Link>
          ) : (
            <span className="font-mono text-xs text-[hsl(var(--text-secondary))]">{row.userId}</span>
          )}
          <span className="text-[10px] text-[hsl(var(--text-secondary))]">
            {row.user?.email || 'Registered User'}
          </span>
        </div>
      ),
    },
    {
      header: 'Metadata / Context',
      render: (row) => (
        <span className="font-mono text-[11px] text-[hsl(var(--text-secondary))]">
          {row.metadata ? JSON.stringify(row.metadata) : 'Standard Event'}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      render: (row) => (
        <span className="text-xs text-[hsl(var(--text-secondary))] font-medium">
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
          <span>PS Portal</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-500" />
            Application Activity Logs
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Privacy-conscious application event audit stream. Total Events: {totalCount}
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

      {isLoading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={logs}
            emptyTitle="No activity logs found"
            emptyMessage="Event records will appear here as users interact with the extension."
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[hsl(var(--border))]">
              <span className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                Page {page} of {totalPages} ({totalCount} logs)
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

export default ActivityLogPage;
