import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementService } from '../services/placement.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  Calendar,
  Briefcase,
  MapPin,
  GraduationCap,
  Plus,
  Search,
  Users,
  X,
  Edit2,
  DollarSign,
  Copy,
  Trash2,
  Check,
  AlertCircle,
  Download,
} from 'lucide-react';
import type { PlacementDrive } from '@/types';

export function PlacementDrivesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal / Detail state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<PlacementDrive | null>(null);
  const [viewingEligibilityDrive, setViewingEligibilityDrive] = useState<PlacementDrive | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyId: '',
    jobRole: '',
    package: '',
    location: '',
    employmentType: 'Full-time',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    departmentsEligible: '',
    minCgpa: '6.0',
    maxBacklogs: '0',
    requiredSkills: '',
    batchYear: new Date().getFullYear().toString(),
    openings: '1',
    bondDetails: '',
    requiredDocuments: 'Resume, Mark Sheets',
    minActivityPoints: '0',
  });

  // Queries
  const { data: drives = [], isLoading: isLoadingDrives } = useQuery({
    queryKey: ['placement-drives'],
    queryFn: () => placementService.getDrives(),
  });

  const { data: stats } = useQuery({
    queryKey: ['placement-drive-stats'],
    queryFn: () => placementService.getDriveStats(),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['placement-companies-list'],
    queryFn: () => placementService.getCompanies(),
  });

  const { data: eligibilityData, isLoading: isLoadingEligibility } = useQuery({
    queryKey: ['drive-eligibility', viewingEligibilityDrive?.id],
    queryFn: () => placementService.evaluateEligibility(viewingEligibilityDrive!.id),
    enabled: !!viewingEligibilityDrive,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: placementService.createDrive,
    onSuccess: () => {
      toast.success('Placement drive created successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-drives'] });
      queryClient.invalidateQueries({ queryKey: ['placement-drive-stats'] });
      setIsCreateModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => placementService.updateDrive(id, data),
    onSuccess: () => {
      toast.success('Placement drive updated successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-drives'] });
      setIsCreateModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: placementService.deleteDrive,
    onSuccess: () => {
      toast.success('Placement drive deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-drives'] });
      queryClient.invalidateQueries({ queryKey: ['placement-drive-stats'] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: placementService.duplicateDrive,
    onSuccess: () => {
      toast.success('Placement drive duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-drives'] });
      queryClient.invalidateQueries({ queryKey: ['placement-drive-stats'] });
    },
  });

  // Filter calculation
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const companyName = drive.company?.name || '';
      const matchesSearch =
        drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (drive.jobRole || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || drive.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drives, searchQuery, statusFilter]);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      companyId: companies[0]?.id || '',
      jobRole: '',
      package: '',
      location: '',
      employmentType: 'Full-time',
      registrationDeadline: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      departmentsEligible: 'CSE, IT, ECE',
      minCgpa: '6.0',
      maxBacklogs: '0',
      requiredSkills: 'React, Node, Database',
      batchYear: new Date().getFullYear().toString(),
      openings: '1',
      bondDetails: '',
      requiredDocuments: 'Resume, Mark Sheets',
      minActivityPoints: '0',
    });
    setEditingDrive(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (drive: PlacementDrive) => {
    setEditingDrive(drive);
    setFormData({
      title: drive.title,
      description: drive.description || '',
      companyId: drive.companyId,
      jobRole: drive.jobRole || '',
      package: String(drive.package || ''),
      location: drive.location || '',
      employmentType: drive.employmentType || 'Full-time',
      registrationDeadline: drive.registrationDeadline ? new Date(drive.registrationDeadline).toISOString().split('T')[0] : '',
      startDate: drive.startDate ? new Date(drive.startDate).toISOString().split('T')[0] : '',
      endDate: drive.endDate ? new Date(drive.endDate).toISOString().split('T')[0] : '',
      departmentsEligible: drive.departmentsEligible?.join(', ') || '',
      minCgpa: String(drive.minCgpa || '6.0'),
      maxBacklogs: String(drive.maxBacklogs || '0'),
      requiredSkills: drive.requiredSkills?.join(', ') || '',
      batchYear: String(drive.batchYear || new Date().getFullYear()),
      openings: String(drive.openings || '1'),
      bondDetails: drive.bondDetails || '',
      requiredDocuments: drive.requiredDocuments?.join(', ') || '',
      minActivityPoints: String(drive.minActivityPoints || '0'),
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveDrive = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      departmentsEligible: formData.departmentsEligible.split(',').map((s) => s.trim()).filter(Boolean),
      requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      requiredDocuments: formData.requiredDocuments.split(',').map((s) => s.trim()).filter(Boolean),
    };

    if (editingDrive) {
      updateMutation.mutate({ id: editingDrive.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Drive Title', 'Company', 'Role', 'Package (LPA)', 'Location', 'Type', 'Deadline', 'Eligible Depts', 'Min CGPA'];
    const rows = filteredDrives.map((d) => [
      `"${d.title}"`,
      `"${d.company?.name || ''}"`,
      `"${d.jobRole || ''}"`,
      `"${d.package || 0}"`,
      `"${d.location || ''}"`,
      `"${d.employmentType || ''}"`,
      `"${d.registrationDeadline ? new Date(d.registrationDeadline).toLocaleDateString() : 'N/A'}"`,
      `"${d.departmentsEligible?.join(', ')}"`,
      `"${d.minCgpa || 0}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `placement_drives_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Placement Drives Desk
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Schedule, manage, and monitor corporate campus placement drives and candidate eligibility rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer transition-colors"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Create Drive
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Total Drives</span>
          <span className="text-2xl font-black text-[hsl(var(--text-primary))] mt-2">{stats?.total || 0}</span>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Active</span>
          <span className="text-2xl font-black text-emerald-600 mt-2">{stats?.active || 0}</span>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Upcoming</span>
          <span className="text-2xl font-black text-sky-500 mt-2">{stats?.upcoming || 0}</span>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Completed</span>
          <span className="text-2xl font-black text-slate-500 mt-2">{stats?.completed || 0}</span>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between h-24">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Cancelled</span>
          <span className="text-2xl font-black text-rose-500 mt-2">{stats?.cancelled || 0}</span>
        </div>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drives, roles, companies..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Grid of Drives */}
      {isLoadingDrives ? (
        <LoadingSkeleton count={3} height="h-44" />
      ) : filteredDrives.length === 0 ? (
        <EmptyState
          title="No drives scheduled"
          message="Schedule your first campus placement drive by clicking the create button."
          icon={<Calendar className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between hover:border-[hsl(var(--primary)/0.2)] transition-all space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.08)] flex items-center justify-center shrink-0 text-[hsl(var(--primary))] font-bold text-sm">
                      {drive.company?.name.substring(0, 2).toUpperCase() || 'PD'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{drive.title}</h4>
                      <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">{drive.company?.name}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    drive.status === 'ONGOING'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : drive.status === 'UPCOMING'
                      ? 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                      : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                  }`}>
                    {drive.status}
                  </span>
                </div>

                <div className="space-y-2 pt-3 border-t border-[hsl(var(--border))/0.6] text-xs text-[hsl(var(--text-secondary))] font-medium">
                  <p className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    {drive.jobRole || 'SDE Internship'}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    CTC: {drive.package} LPA
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    Location: {drive.location || 'Bangalore'}
                  </p>
                  <p className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    Eligibility: CGPA ≥ {drive.minCgpa}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[hsl(var(--border))/0.6] flex justify-between items-center text-xs">
                <button
                  onClick={() => setViewingEligibilityDrive(drive)}
                  className="inline-flex items-center gap-1 text-[hsl(var(--primary))] font-bold hover:underline cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  Evaluate Eligibility
                </button>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEditModal(drive)}
                    className="p-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))] rounded cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateMutation.mutate(drive.id)}
                    className="p-1 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))] rounded cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(drive.id)}
                    className="p-1 text-[hsl(var(--danger))] hover:bg-rose-50 rounded cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Eligibility Evaluation Slide-Drawer / Modal */}
      {viewingEligibilityDrive && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-4xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingEligibilityDrive(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-[hsl(var(--primary))]" />
              Eligibility Analysis Engine
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] mb-6">
              Checking platform students against drive rules (Min CGPA: {viewingEligibilityDrive.minCgpa}, Backlogs: {viewingEligibilityDrive.maxBacklogs}, Min Activity Points: {viewingEligibilityDrive.minActivityPoints ?? 0}, Departments: {viewingEligibilityDrive.departmentsEligible?.join(', ')}).
            </p>

            {isLoadingEligibility ? (
              <div className="py-12"><LoadingSkeleton count={3} height="h-16" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Eligible Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="h-4.5 w-4.5" />
                    Eligible Students ({eligibilityData?.eligible.length || 0})
                  </h4>
                  <div className="border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted))/0.1] divide-y divide-[hsl(var(--border))]/40 max-h-96 overflow-y-auto">
                    {eligibilityData?.eligible.map((s: any) => (
                      <div key={s.id} className="p-3 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[hsl(var(--text-primary))]">{s.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-secondary))]">{s.rollNumber} &bull; {s.department}</p>
                        </div>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                          CGPA: {s.cgpa}
                        </span>
                      </div>
                    ))}
                    {eligibilityData?.eligible.length === 0 && (
                      <p className="p-4 text-center text-xs text-[hsl(var(--text-muted))] italic">No students match current drive rules.</p>
                    )}
                  </div>
                </div>

                {/* Ineligible Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="h-4.5 w-4.5" />
                    Ineligible Students ({eligibilityData?.notEligible.length || 0})
                  </h4>
                  <div className="border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--muted))/0.1] divide-y divide-[hsl(var(--border))]/40 max-h-96 overflow-y-auto">
                    {eligibilityData?.notEligible.map((s: any) => (
                      <div key={s.id} className="p-3 text-xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-[hsl(var(--text-primary))]">{s.name}</p>
                            <p className="text-[10px] text-[hsl(var(--text-secondary))]">{s.rollNumber} &bull; {s.department}</p>
                          </div>
                          <span className="font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full text-[10px]">
                            CGPA: {s.cgpa || 0}
                          </span>
                        </div>
                        <div className="pl-2 border-l-2 border-rose-300 space-y-0.5">
                          {s.reasons.map((reason: string, idx: number) => (
                            <p key={idx} className="text-[9px] text-[hsl(var(--text-secondary))] leading-normal">{reason}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {eligibilityData?.notEligible.length === 0 && (
                      <p className="p-4 text-center text-xs text-[hsl(var(--text-muted))] italic">No ineligible students found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-[hsl(var(--border))]">
              <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="font-bold text-base text-[hsl(var(--text-primary))]">
                {editingDrive ? 'Edit Placement Drive' : 'Schedule Placement Drive'}
              </h3>
            </div>

            <form onSubmit={handleSaveDrive} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Drive Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Google India Drive 2026"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Partner Company
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData((p) => ({ ...p, companyId: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Job Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobRole}
                    onChange={(e) => setFormData((p) => ({ ...p, jobRole: e.target.value }))}
                    placeholder="e.g. Software Development Engineer"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Package (LPA)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.package}
                    onChange={(e) => setFormData((p) => ({ ...p, package: e.target.value }))}
                    placeholder="e.g. 24.5"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Bangalore, Hyderabad"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData((p) => ({ ...p, registrationDeadline: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData((p) => ({ ...p, minCgpa: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Max Backlogs
                  </label>
                  <input
                    type="number"
                    value={formData.maxBacklogs}
                    onChange={(e) => setFormData((p) => ({ ...p, maxBacklogs: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Min Activity Points
                  </label>
                  <input
                    type="number"
                    value={formData.minActivityPoints}
                    onChange={(e) => setFormData((p) => ({ ...p, minActivityPoints: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Openings Count
                  </label>
                  <input
                    type="number"
                    value={formData.openings}
                    onChange={(e) => setFormData((p) => ({ ...p, openings: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                  Eligible Departments (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.departmentsEligible}
                  onChange={(e) => setFormData((p) => ({ ...p, departmentsEligible: e.target.value }))}
                  placeholder="e.g. CSE, IT, ECE"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                  Required Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData((p) => ({ ...p, requiredSkills: e.target.value }))}
                  placeholder="e.g. React, Node.js, SQL"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                  Job Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Summarize roles and responsibilities..."
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2 px-4 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="py-2 px-4 text-xs font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  Save Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacementDrivesPage;
