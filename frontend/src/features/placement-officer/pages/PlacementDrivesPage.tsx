import { useState, useMemo } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  Calendar,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  X,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export interface PlacementDriveItem {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  jobRole: string;
  ctc: string;
  driveDate: string;
  deadline: string;
  venue: string;
  minCgpa: number;
  eligibleBranches: string[];
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  applicantsCount: number;
  description?: string;
}

const INITIAL_DRIVES: PlacementDriveItem[] = [
  {
    id: 'drive-1',
    title: 'Google Placement Drive 2026',
    companyName: 'Google India',
    jobRole: 'Software Development Engineer',
    ctc: '₹28 - ₹34 LPA',
    driveDate: '2026-08-15',
    deadline: '2026-08-10',
    venue: 'Auditorium Block A / Online Hackerrank',
    minCgpa: 8.0,
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    status: 'ONGOING',
    applicantsCount: 142,
    description: 'Campus hiring drive for SDE-1 roles across Google Bangalore and Hyderabad offices.',
  },
  {
    id: 'drive-2',
    title: 'Microsoft Graduate Hiring',
    companyName: 'Microsoft',
    jobRole: 'Full Stack Engineer',
    ctc: '₹24 - ₹28 LPA',
    driveDate: '2026-08-22',
    deadline: '2026-08-18',
    venue: 'Online Teams & On-Campus Lab 3',
    minCgpa: 7.5,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'EEE'],
    status: 'UPCOMING',
    applicantsCount: 98,
    description: 'Hiring software engineers for Cloud & AI organization in Microsoft India.',
  },
  {
    id: 'drive-3',
    title: 'Amazon Operations & Dev Recruitment',
    companyName: 'Amazon Web Services',
    jobRole: 'Cloud Solution Architect',
    ctc: '₹20 - ₹25 LPA',
    driveDate: '2026-07-20',
    deadline: '2026-07-15',
    venue: 'Virtual Drive via Chime',
    minCgpa: 7.0,
    eligibleBranches: ['CSE', 'IT', 'ECE', 'MECH', 'CIVIL'],
    status: 'COMPLETED',
    applicantsCount: 210,
    description: 'Completed recruitment drive for AWS Cloud Architect roles.',
  },
  {
    id: 'drive-4',
    title: 'TCS Digital Recruitment Drive',
    companyName: 'TCS Innovation Labs',
    jobRole: 'Digital Engineer',
    ctc: '₹9 - ₹12 LPA',
    driveDate: '2026-09-01',
    deadline: '2026-08-25',
    venue: 'Computer Center Block C',
    minCgpa: 6.5,
    eligibleBranches: ['ALL BRANCHES'],
    status: 'UPCOMING',
    applicantsCount: 310,
    description: 'Mass recruitment drive for TCS Digital and Innovator profiles.',
  },
];

export function PlacementDrivesPage() {
  const { isLoadingApplications } = usePlacementData();
  const [drives, setDrives] = useState<PlacementDriveItem[]>(INITIAL_DRIVES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<PlacementDriveItem | null>(null);
  const [viewingApplicantsDrive, setViewingApplicantsDrive] = useState<PlacementDriveItem | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    companyName: '',
    title: '',
    jobRole: '',
    ctc: '',
    driveDate: '',
    deadline: '',
    venue: '',
    minCgpa: '7.0',
    eligibleBranches: 'CSE, IT, ECE',
    description: '',
  });

  // Filtered drives calculation
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const matchesSearch =
        drive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drive.jobRole.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || drive.status === statusFilter;
      const matchesCompany = companyFilter === 'ALL' || drive.companyName === companyFilter;
      const matchesDept =
        departmentFilter === 'ALL' ||
        drive.eligibleBranches.includes(departmentFilter) ||
        drive.eligibleBranches.includes('ALL BRANCHES');

      return matchesSearch && matchesStatus && matchesCompany && matchesDept;
    });
  }, [drives, searchQuery, statusFilter, companyFilter, departmentFilter]);

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(drives.map((d) => d.companyName)));
  }, [drives]);

  // Handlers
  const handleOpenCreateModal = () => {
    setFormData({
      companyName: '',
      title: '',
      jobRole: '',
      ctc: '',
      driveDate: '',
      deadline: '',
      venue: '',
      minCgpa: '7.0',
      eligibleBranches: 'CSE, IT, ECE',
      description: '',
    });
    setEditingDrive(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (drive: PlacementDriveItem) => {
    setEditingDrive(drive);
    setFormData({
      companyName: drive.companyName,
      title: drive.title,
      jobRole: drive.jobRole,
      ctc: drive.ctc,
      driveDate: drive.driveDate,
      deadline: drive.deadline,
      venue: drive.venue,
      minCgpa: String(drive.minCgpa),
      eligibleBranches: drive.eligibleBranches.join(', '),
      description: drive.description || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.jobRole || !formData.driveDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const branchesArray = formData.eligibleBranches
      .split(',')
      .map((b) => b.trim().toUpperCase())
      .filter(Boolean);

    if (editingDrive) {
      setDrives((prev) =>
        prev.map((d) =>
          d.id === editingDrive.id
            ? {
                ...d,
                companyName: formData.companyName,
                title: formData.title || `${formData.companyName} Drive`,
                jobRole: formData.jobRole,
                ctc: formData.ctc,
                driveDate: formData.driveDate,
                deadline: formData.deadline,
                venue: formData.venue,
                minCgpa: parseFloat(formData.minCgpa) || 6.0,
                eligibleBranches: branchesArray.length ? branchesArray : ['ALL BRANCHES'],
                description: formData.description,
              }
            : d
        )
      );
      toast.success('Placement drive updated successfully!');
    } else {
      const newDrive: PlacementDriveItem = {
        id: `drive-${Date.now()}`,
        title: formData.title || `${formData.companyName} Recruitment Drive`,
        companyName: formData.companyName,
        jobRole: formData.jobRole,
        ctc: formData.ctc || 'As per norms',
        driveDate: formData.driveDate,
        deadline: formData.deadline || formData.driveDate,
        venue: formData.venue || 'Campus Auditorium',
        minCgpa: parseFloat(formData.minCgpa) || 6.0,
        eligibleBranches: branchesArray.length ? branchesArray : ['ALL BRANCHES'],
        status: 'UPCOMING',
        applicantsCount: 0,
        description: formData.description,
      };
      setDrives((prev) => [newDrive, ...prev]);
      toast.success('New Placement Drive created!');
    }

    setIsCreateModalOpen(false);
  };

  const handleCloseDrive = (id: string) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === 'COMPLETED' ? 'ONGOING' : 'COMPLETED' } : d))
    );
    toast.success('Drive status updated!');
  };

  const getStatusBadge = (status: PlacementDriveItem['status']) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            ONGOING
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Clock className="h-3 w-3" />
            UPCOMING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <CheckCircle2 className="h-3 w-3" />
            COMPLETED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="h-3 w-3" />
            CANCELLED
          </span>
        );
    }
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
            Schedule, manage, and monitor corporate campus placement drives and candidate registrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Create Drive
          </button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[hsl(var(--text-secondary))] uppercase">Total Drives</p>
            <p className="text-xl font-extrabold text-[hsl(var(--text-primary))]">{drives.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[hsl(var(--text-secondary))] uppercase">Active Drives</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {drives.filter((d) => d.status === 'ONGOING' || d.status === 'UPCOMING').length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[hsl(var(--text-secondary))] uppercase">Total Applicants</p>
            <p className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
              {drives.reduce((acc, curr) => acc + curr.applicantsCount, 0)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[hsl(var(--text-secondary))] uppercase">Top Package</p>
            <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">₹34 LPA</p>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
            <input
              type="text"
              placeholder="Search by company, role, or drive title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            />
          </div>

          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          >
            <option value="ALL">All Companies</option>
            {uniqueCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EEE">Electrical (EEE)</option>
            <option value="MECH">Mechanical</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[hsl(var(--border)/0.5)] text-xs">
          <span className="text-[11px] font-bold text-[hsl(var(--text-muted))] uppercase mr-2 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {['ALL', 'ONGOING', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Drives Grid */}
      {isLoadingApplications ? (
        <LoadingSkeleton count={3} height="h-64" />
      ) : filteredDrives.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No placement drives found"
            message="Try adjusting your filters or create a new placement drive."
            icon={<Calendar className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between hover:border-[hsl(var(--primary)/0.3)] transition-all space-y-4 relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary)/0.15)] to-[hsl(var(--accent)/0.15)] text-[hsl(var(--primary))] flex items-center justify-center font-black text-lg border border-[hsl(var(--primary)/0.2)] shrink-0 shadow-xs">
                    {drive.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--primary))] transition-colors">
                      {drive.title}
                    </h3>
                    <p className="text-xs font-bold text-[hsl(var(--text-secondary))] flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                      {drive.companyName}
                    </p>
                  </div>
                </div>

                <div>{getStatusBadge(drive.status)}</div>
              </div>

              {/* Description */}
              {drive.description && (
                <p className="text-xs text-[hsl(var(--text-secondary))] line-clamp-2 leading-relaxed">
                  {drive.description}
                </p>
              )}

              {/* Grid Metadata Specs */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[hsl(var(--muted)/0.4)] border border-[hsl(var(--border)/0.6)] text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-muted))] flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-[hsl(var(--primary))]" /> Role & Package
                  </span>
                  <p className="font-bold text-[hsl(var(--text-primary))]">{drive.jobRole}</p>
                  <p className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">{drive.ctc}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[hsl(var(--text-muted))] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[hsl(var(--primary))]" /> Key Dates
                  </span>
                  <p className="font-semibold text-[hsl(var(--text-primary))]">Drive: {drive.driveDate}</p>
                  <p className="text-[11px] text-[hsl(var(--danger))] font-medium">Deadline: {drive.deadline}</p>
                </div>
              </div>

              {/* Eligibility & Venue */}
              <div className="space-y-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[hsl(var(--text-muted))] flex items-center gap-1 mr-1">
                    <GraduationCap className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" /> Eligibility:
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--text-primary))]">
                    CGPA ≥ {drive.minCgpa}
                  </span>
                  {drive.eligibleBranches.map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-[10px] font-bold border border-[hsl(var(--primary)/0.15)]"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--text-secondary))] font-medium">
                  <MapPin className="h-3.5 w-3.5 text-[hsl(var(--text-muted))] shrink-0" />
                  <span className="truncate">{drive.venue}</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))] font-medium">
                  <Users className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" />
                  <span>{drive.applicantsCount} Registered</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewingApplicantsDrive(drive)}
                    className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1"
                    title="View Applicants"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Applicants
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(drive)}
                    className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                    title="Edit Drive"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleCloseDrive(drive.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      drive.status === 'COMPLETED'
                        ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {drive.status === 'COMPLETED' ? 'Reopen' : 'Close Drive'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Drive Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-[hsl(var(--border))]">
              <Calendar className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="font-bold text-base text-[hsl(var(--text-primary))]">
                {editingDrive ? 'Edit Placement Drive' : 'Schedule New Placement Drive'}
              </h3>
            </div>

            <form onSubmit={handleSaveDrive} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google India"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Job Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    CTC / Package
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹18 - ₹22 LPA"
                    value={formData.ctc}
                    onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Venue / Meeting Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auditorium / Google Meet"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Drive Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.driveDate}
                    onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="7.5"
                    value={formData.minCgpa}
                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                    Eligible Branches (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="CSE, IT, ECE"
                    value={formData.eligibleBranches}
                    onChange={(e) => setFormData({ ...formData, eligibleBranches: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                  Drive Instructions / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions regarding round details, dress code, required documents..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingDrive ? 'Save Changes' : 'Create Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Applicants Drawer */}
      {viewingApplicantsDrive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] w-full max-w-md h-full border-l border-[hsl(var(--border))] p-6 shadow-2xl overflow-y-auto animate-slide-in-right space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
              <div>
                <h3 className="font-extrabold text-base text-[hsl(var(--text-primary))]">Registered Applicants</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{viewingApplicantsDrive.title}</p>
              </div>
              <button
                onClick={() => setViewingApplicantsDrive(null)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)] flex items-center justify-between text-xs font-bold text-[hsl(var(--primary))]">
              <span>Total Applicants:</span>
              <span className="text-sm font-black">{viewingApplicantsDrive.applicantsCount}</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Rakshana S.', roll: '2022CSE045', cgpa: 8.9, status: 'SHORTLISTED', dept: 'CSE' },
                { name: 'Akshai V.', roll: '2022CSE012', cgpa: 9.1, status: 'INTERVIEWING', dept: 'CSE' },
                { name: 'Divya M.', roll: '2022IT089', cgpa: 8.4, status: 'APPLIED', dept: 'IT' },
                { name: 'Karthik R.', roll: '2022ECE034', cgpa: 8.2, status: 'APPLIED', dept: 'ECE' },
              ].map((applicant, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center justify-between hover:border-[hsl(var(--primary)/0.3)] transition-all text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[hsl(var(--text-primary))]">{applicant.name}</p>
                    <p className="text-[11px] text-[hsl(var(--text-secondary))]">
                      {applicant.roll} • {applicant.dept}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] font-bold text-[10px] text-[hsl(var(--text-primary))]">
                      CGPA {applicant.cgpa}
                    </span>
                    <p className="text-[10px] font-extrabold text-[hsl(var(--primary))]">{applicant.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setViewingApplicantsDrive(null)}
                className="w-full py-2 rounded-xl bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold text-xs cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacementDrivesPage;
