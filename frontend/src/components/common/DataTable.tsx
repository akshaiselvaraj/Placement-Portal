import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyMessage,
  emptyTitle,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSkeleton count={5} height="h-12" className="mt-4" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--surface))] overflow-hidden py-12">
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--surface))] shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.5]">
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-6 py-4 font-semibold text-[hsl(var(--text-secondary))] tracking-tight select-none uppercase text-xs"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))]">
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${
                onRowClick
                  ? 'cursor-pointer hover:bg-[hsl(var(--muted))/0.3]'
                  : 'hover:bg-[hsl(var(--muted))/0.1]'
              }`}
            >
              {columns.map((col, colIndex) => {
                let content: React.ReactNode = null;

                if (col.render) {
                  content = col.render(row);
                } else if (col.accessorKey) {
                  const val = row[col.accessorKey as keyof T];
                  content = val !== undefined && val !== null ? String(val) : '-';
                }

                return (
                  <td
                    key={colIndex}
                    className="px-6 py-4 font-medium text-[hsl(var(--text-primary))]"
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
