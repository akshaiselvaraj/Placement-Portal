import { useState } from 'react';
import { useAdminActivities } from '../hooks/useAdminManage';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import {
  Search,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  Terminal,
} from 'lucide-react';

const ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'CREATE_ADMIN',
  'PROFILE_UPDATE',
  'PASSWORD_CHANGE',
  'ROLE_CHANGE',
  'PERMISSION_CHANGE',
  'DELETION',
  'STATUS_CHANGE',
];

export function SystemLogs() {
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch activities
  const { data: logs, isLoading } = useAdminActivities({
    action: actionFilter || undefined,
    limit: 100,
  });

  // Filter logs locally based on search
  const filteredLogs = logs?.filter((log) => {
    const term = searchTerm.toLowerCase();
    const adminName = `${log.admin?.firstName || ''} ${log.admin?.lastName || ''}`.toLowerCase();
    const empId = (log.admin?.employeeId || '').toLowerCase();
    const details = (log.details || '').toLowerCase();
    const action = log.action.toLowerCase();

    return (
      adminName.includes(term) ||
      empId.includes(term) ||
      details.includes(term) ||
      action.includes(term)
    );
  }) || [];

  // Export functions
  const handleExportCSV = () => {
    const headers = ['Action', 'Details', 'Admin', 'Employee ID', 'IP Address', 'User Agent', 'Date'];
    const rows = filteredLogs.map((log) => [
      `"${log.action}"`,
      `"${log.details || ''}"`,
      `"${log.admin?.firstName || ''} ${log.admin?.lastName || ''}"`,
      `"${log.admin?.employeeId || ''}"`,
      `"${log.ipAddress || ''}"`,
      `"${log.userAgent || ''}"`,
      `"${new Date(log.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `system_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <tr bgcolor="#3B82F6" style="color:#ffffff; font-weight:bold;">
            <th>Action</th>
            <th>Details</th>
            <th>Admin Name</th>
            <th>Employee ID</th>
            <th>IP Address</th>
            <th>User Agent</th>
            <th>Date & Time</th>
          </tr>
    `;

    filteredLogs.forEach((log) => {
      tableHtml += `
        <tr>
          <td>${log.action}</td>
          <td>${log.details || ''}</td>
          <td>${log.admin?.firstName || ''} ${log.admin?.lastName || ''}</td>
          <td>${log.admin?.employeeId || ''}</td>
          <td>${log.ipAddress || ''}</td>
          <td>${log.userAgent || ''}</td>
          <td>${new Date(log.createdAt).toLocaleString()}</td>
        </tr>
      `;
    });

    tableHtml += '</table></body></html>';

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system_audit_logs_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let rowsHtml = '';
    filteredLogs.forEach((log) => {
      rowsHtml += `
        <tr>
          <td style="padding:8px; border:1px solid #ddd; font-weight:bold;">${log.action}</td>
          <td style="padding:8px; border:1px solid #ddd;">${log.details || ''}</td>
          <td style="padding:8px; border:1px solid #ddd;">${log.admin?.firstName || ''} ${log.admin?.lastName || ''} (${log.admin?.employeeId || ''})</td>
          <td style="padding:8px; border:1px solid #ddd;">${log.ipAddress || ''}</td>
          <td style="padding:8px; border:1px solid #ddd; font-size:10px;">${log.userAgent || ''}</td>
          <td style="padding:8px; border:1px solid #ddd;">${new Date(log.createdAt).toLocaleString()}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>System Audit Logs</title>
          <style>
            body { font-family: sans-serif; margin: 40px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #ddd; }
            h2 { margin-bottom: 5px; }
            p { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h2>System Audit Trail logs</h2>
          <p>Export Date: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Details</th>
                <th>Performed By</th>
                <th>IP Address</th>
                <th>User Agent</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 animate-in duration-300">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          System Audit Logs
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review systemic administrative access, role transitions, deactivations, and security updates.
        </p>
      </div>

      {/* Control ribbon */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search details, admin name, ID..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-2.5 items-center justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-[hsl(var(--text-muted))]" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
            >
              <option value="">All Actions</option>
              {ACTIONS.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 border-l border-[hsl(var(--border))] pl-2.5 ml-1">
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            </button>
            <button
              onClick={handlePrint}
              title="Print Logs"
              className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <LoadingSkeleton count={4} height="h-16" />
      ) : filteredLogs.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No audit logs found"
            message="No administrative actions match your current search parameters."
            icon={<Terminal className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[hsl(var(--border))]">
              <thead className="bg-[hsl(var(--muted))/0.5]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    Description Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    User Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[hsl(var(--surface))] divide-y divide-[hsl(var(--border))]/40">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[hsl(var(--muted))/0.2] transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        log.action.includes('DELETION')
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : log.action.includes('CREATE')
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.action.includes('ROLE') || log.action.includes('PERMISSION')
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[hsl(var(--text-primary))]">
                      {log.details}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-[hsl(var(--text-primary))] font-semibold">
                      {log.admin ? (
                        <span>
                          {log.admin.firstName} {log.admin.lastName}{' '}
                          <span className="text-[10px] text-[hsl(var(--text-secondary))] font-normal">
                            ({log.admin.employeeId})
                          </span>
                        </span>
                      ) : (
                        <span className="text-[hsl(var(--text-muted))] italic">System Process</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                      {log.ipAddress || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[hsl(var(--text-secondary))] truncate max-w-[200px]" title={log.userAgent || ''}>
                      {log.userAgent || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemLogs;
