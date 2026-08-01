import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementService } from '../services/placement.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  ClipboardList,
  Search,
  X,
  Check,
} from 'lucide-react';

export function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Bulk Operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Queries
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['placement-applications'],
    queryFn: () => placementService.getApplications(),
  });

  // Bulk status mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      placementService.bulkUpdateApplications(ids, status),
    onSuccess: (_, variables) => {
      toast.success(`Selected applications status updated to: ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['placement-applications'] });
      setSelectedIds([]);
    },
  });

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(applications.map((a) => a.job?.company?.name).filter(Boolean)));
  }, [applications]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(applications.map((a) => a.student?.department).filter(Boolean)));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const studentName = app.student?.user?.name || '';
      const rollNumber = app.student?.rollNumber || '';
      const companyName = app.job?.company?.name || '';
      const jobRole = app.job?.title || '';

      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobRole.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'ALL' || companyName === companyFilter;
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesDept = departmentFilter === 'ALL' || app.student?.department === departmentFilter;

      return matchesSearch && matchesCompany && matchesStatus && matchesDept;
    });
  }, [applications, searchQuery, companyFilter, statusFilter, departmentFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredApplications.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = (status: string) => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one application');
      return;
    }
    bulkUpdateMutation.mutate({ ids: selectedIds, status });
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Candidate Applications
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Audit student job applications, shortlist profiles, and execute bulk verification updates.
          </p>
        </div>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.04)] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
          <span className="text-xs font-bold text-[hsl(var(--primary))]">
            Selected {selectedIds.length} candidate applications
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkUpdate('SHORTLISTED')}
              className="px-3 py-1.5 bg-[hsl(var(--primary))] text-white font-bold rounded-lg text-xs cursor-pointer hover:opacity-90"
            >
              Shortlist Selected
            </button>
            <button
              onClick={() => handleBulkUpdate('REJECTED')}
              className="px-3 py-1.5 bg-[hsl(var(--danger))] text-white font-bold rounded-lg text-xs cursor-pointer hover:opacity-90"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Control ribbon */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, roll number..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center justify-end">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            {uniqueCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Depts</option>
            {uniqueDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <LoadingSkeleton count={3} height="h-16" />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title="No applications records"
          message="No candidates have applied to student opportunities yet."
          icon={<ClipboardList className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
        />
      ) : (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[hsl(var(--border))]">
              <thead className="bg-[hsl(var(--muted))/0.5]">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={
                        filteredApplications.length > 0 &&
                        selectedIds.length === filteredApplications.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Drive / Company</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">CGPA</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-[hsl(var(--surface))] divide-y divide-[hsl(var(--border))]/40">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-[hsl(var(--muted))/0.2] transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => handleToggleSelect(app.id)}
                        className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                      />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{app.student?.user?.name}</p>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))]">{app.student?.rollNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-[hsl(var(--text-primary))] font-semibold">
                      {app.job?.company?.name}
                      <span className="block text-[10px] text-[hsl(var(--text-secondary))] font-normal">{app.job?.title}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                      {app.student?.department}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-[hsl(var(--text-primary))]">
                      {app.student?.cgpa || 0}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        app.status === 'SELECTED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() => bulkUpdateMutation.mutate({ ids: [app.id], status: 'SHORTLISTED' })}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Shortlist"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => bulkUpdateMutation.mutate({ ids: [app.id], status: 'REJECTED' })}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
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

export default ApplicationsPage;
