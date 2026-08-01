import { useState, useRef } from 'react';
import { useAdminManage, useAdminDetails, useAdminActivities } from '../hooks/useAdminManage';
import { LoadingSkeleton, EmptyState, StatCard } from '@/components/common';
import {
  Shield,
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  History,
  Activity,
  Plus,
  Edit,
  Trash2,
  Download,
  Printer,
  SlidersHorizontal,
  X,
  Eye,
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  Mail,
  Phone,
  Building,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from '@/store';
import type { Admin } from '@/types';

// Constants for available Permissions
const AVAILABLE_PERMISSIONS = [
  { id: 'Manage Students', label: 'Manage Students', desc: 'Verify, edit, or reject student records' },
  { id: 'Manage Companies', label: 'Manage Companies', desc: 'Register and manage corporate profiles' },
  { id: 'Manage Drives', label: 'Manage Drives', desc: 'Schedule and edit placement drive details' },
  { id: 'Manage Placement Officers', label: 'Manage Placement Officers', desc: 'Approve or disable placement accounts' },
  { id: 'Manage Admins', label: 'Manage Admins', desc: 'Add, edit, or assign permissions to administrators' },
  { id: 'Manage Reports', label: 'Manage Reports', desc: 'Generate placement and drive metrics reports' },
  { id: 'Manage Notifications', label: 'Manage Notifications', desc: 'Send announcements and systemic triggers' },
  { id: 'Manage Settings', label: 'Manage Settings', desc: 'Modify portals global system settings' },
  { id: 'View Analytics', label: 'View Analytics', desc: 'Access platform KPI dashboards and charts' },
  { id: 'Export Data', label: 'Export Data', desc: 'Download CSV and Excel listings' },
];

const DEPARTMENTS = [
  'Information Technology',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Administration',
  'Human Resources',
];

export function AdminsManagement() {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    photo: true,
    name: true,
    empId: true,
    email: true,
    phone: true,
    dept: true,
    role: true,
    permissions: true,
    status: true,
    created: true,
    lastLogin: true,
    actions: true,
  });

  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Modal / Drawer control states
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  // Soft Delete undo state
  const [lastDeletedAdminId, setLastDeletedAdminId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    phone: '',
    department: DEPARTMENTS[0],
    designation: '',
    role: 'ADMIN',
    status: 'ACTIVE',
    password: '',
    confirmPassword: '',
    avatar: '',
    permissions: [] as string[],
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Query Hooks
  const {
    stats,
    isLoadingStats,
    adminsData,
    isLoadingList,
    createAdmin,
    isCreating,
    updateAdmin,
    isUpdating,
    deleteAdmin,
    restoreAdmin,
    updateStatus,
  } = useAdminManage({
    search: searchTerm || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    department: deptFilter || undefined,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  const { data: adminDetails, isLoading: isLoadingDetails } = useAdminDetails(
    showDetailModal && selectedAdminId ? selectedAdminId : undefined
  );

  const { data: activities } = useAdminActivities(
    showDetailModal && selectedAdminId ? { adminId: selectedAdminId, limit: 15 } : undefined
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Actions
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (isEdit: boolean = false) => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.employeeId) errors.employeeId = 'Employee ID is required';
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email structure';
    }

    if (!formData.designation) errors.designation = 'Designation is required';

    if (!isEdit) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    try {
      await createAdmin(formData);
      setShowAddDrawer(false);
      resetForm();
    } catch (err) {}
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId) return;
    if (!validateForm(true)) return;

    try {
      await updateAdmin({ id: selectedAdminId, data: formData });
      setShowEditDrawer(false);
      resetForm();
    } catch (err) {}
  };

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdminId(admin.id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAdminId) return;
    try {
      await deleteAdmin(selectedAdminId);
      setLastDeletedAdminId(selectedAdminId);
      setShowDeleteConfirm(false);
      
      // Notify with Undo
      toast.success('Admin soft deleted successfully');
    } catch (err) {}
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedAdminId) return;
    try {
      await restoreAdmin(lastDeletedAdminId);
      setLastDeletedAdminId(null);
      toast.success('Admin restored successfully');
    } catch (err) {}
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    let nextStatus = 'ACTIVE';
    if (currentStatus === 'ACTIVE') nextStatus = 'DISABLED';
    else if (currentStatus === 'DISABLED') nextStatus = 'SUSPENDED';

    try {
      await updateStatus({ id, status: nextStatus });
    } catch (err) {}
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => {
      const alreadyHas = prev.permissions.includes(permission);
      const newPerms = alreadyHas
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: newPerms };
    });
  };

  const openAddDrawer = () => {
    resetForm();
    setShowAddDrawer(true);
  };

  const openEditDrawer = (admin: Admin) => {
    setSelectedAdminId(admin.id);
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      employeeId: admin.employeeId,
      email: admin.user?.email || '',
      phone: admin.phone || '',
      department: admin.department,
      designation: admin.designation,
      role: admin.role,
      status: admin.status,
      password: '',
      confirmPassword: '',
      avatar: admin.user?.avatar || '',
      permissions: admin.permissions?.map((p) => p.permission) || [],
      notes: admin.notes || '',
    });
    setFormErrors({});
    setShowEditDrawer(true);
  };

  const openDetailModal = (id: string) => {
    setSelectedAdminId(id);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      employeeId: '',
      email: '',
      phone: '',
      department: DEPARTMENTS[0],
      designation: '',
      role: 'ADMIN',
      status: 'ACTIVE',
      password: '',
      confirmPassword: '',
      avatar: '',
      permissions: [],
      notes: '',
    });
    setFormErrors({});
    setSelectedAdminId(null);
  };

  // Export functions
  const handleExportCSV = () => {
    if (!adminsData?.admins) return;
    const headers = ['Name', 'Employee ID', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Created Date'];
    const rows = adminsData.admins.map((adm) => [
      `"${adm.firstName} ${adm.lastName}"`,
      `"${adm.employeeId}"`,
      `"${adm.user?.email}"`,
      `"${adm.phone || ''}"`,
      `"${adm.department}"`,
      `"${adm.role}"`,
      `"${adm.status}"`,
      `"${new Date(adm.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admins_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    // Generate clean HTML table code that Excel opens properly
    if (!adminsData?.admins) return;
    let tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table border="1">
          <tr bgcolor="#2563EB" style="color:#ffffff; font-weight:bold;">
            <th>Name</th>
            <th>Employee ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created Date</th>
          </tr>
    `;

    adminsData.admins.forEach((adm) => {
      tableHtml += `
        <tr>
          <td>${adm.firstName} ${adm.lastName}</td>
          <td>${adm.employeeId}</td>
          <td>${adm.user?.email}</td>
          <td>${adm.phone || ''}</td>
          <td>${adm.department}</td>
          <td>${adm.role}</td>
          <td>${adm.status}</td>
          <td>${new Date(adm.createdAt).toLocaleDateString()}</td>
        </tr>
      `;
    });

    tableHtml += '</table></body></html>';

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `admins_export_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !adminsData?.admins) return;

    let rowsHtml = '';
    adminsData.admins.forEach((adm) => {
      rowsHtml += `
        <tr>
          <td style="padding:8px; border:1px solid #ddd;">${adm.firstName} ${adm.lastName}</td>
          <td style="padding:8px; border:1px solid #ddd;">${adm.employeeId}</td>
          <td style="padding:8px; border:1px solid #ddd;">${adm.user?.email}</td>
          <td style="padding:8px; border:1px solid #ddd;">${adm.phone || ''}</td>
          <td style="padding:8px; border:1px solid #ddd;">${adm.department}</td>
          <td style="padding:8px; border:1px solid #ddd;">${adm.role}</td>
          <td style="padding:8px; border:1px solid #ddd;">${adm.status}</td>
          <td style="padding:8px; border:1px solid #ddd;">${new Date(adm.createdAt).toLocaleDateString()}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Administrators List</title>
          <style>
            body { font-family: sans-serif; margin: 40px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #ddd; }
            h2 { margin-bottom: 5px; }
            p { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h2>System Administrators Profile List</h2>
          <p>Export Date: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created Date</th>
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
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Admin Management
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Create, audit, and configure privileges for system administrators and security sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastDeletedAdminId && (
            <button
              onClick={handleUndoDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning-light))] hover:bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--warning))] rounded-lg transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Undo Soft Delete
            </button>
          )}

          <button
            onClick={openAddDrawer}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Add Administrator
          </button>
        </div>
      </div>

      {/* 1. Dashboard Stats Row */}
      {isLoadingStats ? (
        <LoadingSkeleton count={3} height="h-28" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Admins"
            value={stats?.total || 0}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Active Admins"
            value={stats?.active || 0}
            icon={<UserCheck className="h-5 w-5 text-emerald-500" />}
          />
          <StatCard
            title="Super Admins"
            value={stats?.superAdmins || 0}
            icon={<Shield className="h-5 w-5 text-indigo-500" />}
          />
          <StatCard
            title="Disabled"
            value={stats?.disabled || 0}
            icon={<UserX className="h-5 w-5 text-rose-500" />}
          />
          <StatCard
            title="Pending Invites"
            value={stats?.pendingInvitations || 0}
            icon={<Mail className="h-5 w-5 text-amber-500" />}
          />
          <StatCard
            title="Last Activity"
            value={stats?.lastLogin ? new Date(stats.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            icon={<History className="h-5 w-5 text-cyan-500" />}
            description={stats?.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'No logins'}
          />
        </div>
      )}

      {/* Filters and Control Ribbon */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, Employee ID, email..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap gap-2.5 items-center justify-end">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Export & Actions */}
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
              title="Print"
              className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>

            {/* Column visibility dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer transition-colors flex items-center gap-1"
                title="Column Visibility"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>

              {showColumnDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-2.5 shadow-lg z-30 animate-in fade-in zoom-in-95 duration-100">
                  <h5 className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-2 border-b border-[hsl(var(--border))] pb-1">
                    Columns
                  </h5>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {Object.keys(visibleColumns).map((col) => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer text-xs text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--muted))] p-1 rounded">
                        <input
                          type="checkbox"
                          checked={visibleColumns[col as keyof typeof visibleColumns]}
                          onChange={() =>
                            setVisibleColumns((prev) => ({
                              ...prev,
                              [col]: !prev[col as keyof typeof visibleColumns],
                            }))
                          }
                          className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-0"
                        />
                        <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Admin Table */}
      {isLoadingList ? (
        <LoadingSkeleton count={3} height="h-20" />
      ) : !adminsData?.admins || adminsData.admins.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No administrators found"
            message="No records match your filters or search query."
            icon={<ShieldAlert className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[hsl(var(--border))] table-fixed">
              <thead className="bg-[hsl(var(--muted))/0.5] sticky top-0 z-10">
                <tr>
                  {visibleColumns.photo && (
                    <th className="w-16 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Photo
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th
                      onClick={() => handleSort('firstName')}
                      className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider cursor-pointer hover:bg-[hsl(var(--muted))]"
                    >
                      Name {sortBy === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.empId && (
                    <th
                      onClick={() => handleSort('employeeId')}
                      className="w-32 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider cursor-pointer hover:bg-[hsl(var(--muted))]"
                    >
                      Emp ID {sortBy === 'employeeId' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.email && (
                    <th
                      onClick={() => handleSort('email')}
                      className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider cursor-pointer hover:bg-[hsl(var(--muted))]"
                    >
                      Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  )}
                  {visibleColumns.phone && (
                    <th className="w-32 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Phone
                    </th>
                  )}
                  {visibleColumns.dept && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Dept
                    </th>
                  )}
                  {visibleColumns.role && (
                    <th className="w-32 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Role
                    </th>
                  )}
                  {visibleColumns.permissions && (
                    <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Permissions
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="w-28 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  {visibleColumns.created && (
                    <th className="w-28 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Created
                    </th>
                  )}
                  {visibleColumns.lastLogin && (
                    <th className="w-36 px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Last Login
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="w-24 px-4 py-3 text-center text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-[hsl(var(--surface))] divide-y divide-[hsl(var(--border))]/40">
                {adminsData.admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[hsl(var(--muted))/0.2] transition-colors">
                    {visibleColumns.photo && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {admin.user?.avatar ? (
                          <img
                            src={admin.user.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-[hsl(var(--border))]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-bold text-xs flex items-center justify-center border border-[hsl(var(--primary)/0.15)]">
                            {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                          </div>
                        )}
                      </td>
                    )}
                    {visibleColumns.name && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-sm text-[hsl(var(--text-primary))]">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                          {admin.designation}
                        </div>
                      </td>
                    )}
                    {visibleColumns.empId && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-[hsl(var(--text-primary))]">
                        {admin.employeeId}
                      </td>
                    )}
                    {visibleColumns.email && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[hsl(var(--text-secondary))]">
                        {admin.user?.email}
                      </td>
                    )}
                    {visibleColumns.phone && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[hsl(var(--text-secondary))]">
                        {admin.phone || 'N/A'}
                      </td>
                    )}
                    {visibleColumns.dept && (
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[hsl(var(--text-secondary))] truncate">
                        {admin.department}
                      </td>
                    )}
                    {visibleColumns.role && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          admin.role === 'SUPER_ADMIN'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-300'
                        }`}>
                          {admin.role.replace('_', ' ')}
                        </span>
                      </td>
                    )}
                    {visibleColumns.permissions && (
                      <td className="px-4 py-3 text-xs text-[hsl(var(--text-secondary))]">
                        {admin.role === 'SUPER_ADMIN' ? (
                          <span className="font-semibold text-indigo-600">Full Access (Bypassed)</span>
                        ) : admin.permissions && admin.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {admin.permissions.slice(0, 2).map((p, idx) => (
                              <span key={idx} className="bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-[10px] truncate max-w-[90px]">
                                {p.permission}
                              </span>
                            ))}
                            {admin.permissions.length > 2 && (
                              <span className="text-[10px] font-bold text-[hsl(var(--primary))]">
                                +{admin.permissions.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[hsl(var(--text-muted))]">None assigned</span>
                        )}
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(admin.id, admin.status)}
                          className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full cursor-pointer transition-all hover:ring-2 hover:ring-[hsl(var(--primary)/0.2)] ${
                            admin.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : admin.status === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {admin.status}
                        </button>
                      </td>
                    )}
                    {visibleColumns.created && (
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </td>
                    )}
                    {visibleColumns.lastLogin && (
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never logged in'}
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td className="px-4 py-3 whitespace-nowrap text-center text-xs">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => openDetailModal(admin.id)}
                            title="View Profile Details"
                            className="p-1.5 rounded-lg text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEditDrawer(admin)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(admin)}
                            title="Delete (Soft)"
                            className="p-1.5 rounded-lg text-[hsl(var(--danger))] hover:bg-[hsl(var(--muted))] cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {adminsData.pagination && adminsData.pagination.totalPages > 1 && (
            <div className="p-4 bg-[hsl(var(--muted))/0.2] border-t border-[hsl(var(--border))]/40 flex justify-between items-center text-xs text-[hsl(var(--text-secondary))]">
              <div>
                Showing page <span className="font-bold">{adminsData.pagination.page}</span> of{' '}
                <span className="font-bold">{adminsData.pagination.totalPages}</span> (Total{' '}
                <span className="font-bold">{adminsData.pagination.total}</span> records)
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= adminsData.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))] disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Add Administrator Side-Drawer */}
      {showAddDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">Register Admin Account</h3>
                </div>
                <button onClick={() => setShowAddDrawer(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-5">
                {/* Photo Upload Section */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))/0.15]">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(var(--primary))]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.08)] flex items-center justify-center text-[hsl(var(--primary))] font-bold text-lg">
                      U
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider mb-1">
                      Profile Picture
                    </h5>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] mb-2">
                      Upload portrait image (JPEG/PNG)
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-[10px] font-bold border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer"
                    >
                      Upload File
                    </button>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.firstName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.lastName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* Emp ID and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ADM-2026-09"
                      value={formData.employeeId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.employeeId && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.employeeId}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.email && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.email}</p>}
                  </div>
                </div>

                {/* Phone & Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Designation & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Systems Director"
                      value={formData.designation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.designation && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.designation}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Admin Role Type
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      <option value="ADMIN">Standard Administrator</option>
                      <option value="SUPER_ADMIN">Super Administrator (All Access)</option>
                    </select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.password && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Permissions matrix */}
                {formData.role !== 'SUPER_ADMIN' && (
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-2">
                      Permissions Matrix (Individual Assignment)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1]">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handlePermissionToggle(perm.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                              isChecked
                                ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] text-[hsl(var(--text-primary))] font-medium'
                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-muted)/0.3)]'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0 text-[hsl(var(--primary))]">
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                              )}
                            </div>
                            <div>
                              <h6 className="text-xs font-bold">{perm.label}</h6>
                              <p className="text-[9px] text-[hsl(var(--text-secondary))] mt-0.5 leading-normal">
                                {perm.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--border))] mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddDrawer(false)}
                    className="py-2 px-4 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="py-2 px-4 text-xs font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    {isCreating ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Administrator Side-Drawer */}
      {showEditDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] w-full max-w-2xl h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-[hsl(var(--primary))]" />
                  <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">Edit Admin Profile</h3>
                </div>
                <button onClick={() => setShowEditDrawer(false)} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-5">
                {/* Photo Upload Section */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))/0.15]">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(var(--primary))]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.08)] flex items-center justify-center text-[hsl(var(--primary))] font-bold text-lg">
                      U
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-[hsl(var(--text-primary))] uppercase tracking-wider mb-1">
                      Profile Picture
                    </h5>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] mb-2">
                      Upload portrait image (JPEG/PNG)
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-[10px] font-bold border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] cursor-pointer"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.firstName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.lastName && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* Emp ID and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.employeeId}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.5] py-2 px-3 text-sm text-[hsl(var(--text-secondary))] cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.5] py-2 px-3 text-sm text-[hsl(var(--text-secondary))] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone & Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                {/* Designation & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData((prev) => ({ ...prev, designation: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    />
                    {formErrors.designation && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.designation}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                      Admin Role Type
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                    >
                      <option value="ADMIN">Standard Administrator</option>
                      <option value="SUPER_ADMIN">Super Administrator (All Access)</option>
                    </select>
                  </div>
                </div>

                {/* Update Password Option */}
                <div className="p-4 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--muted))/0.08] space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--text-primary))]">
                    <KeyRound className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Change Admin Password (Optional)
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      />
                      {formErrors.password && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      />
                      {formErrors.confirmPassword && <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Permissions matrix */}
                {formData.role !== 'SUPER_ADMIN' && (
                  <div>
                    <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-2">
                      Permissions Matrix (Individual Assignment)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1]">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = formData.permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handlePermissionToggle(perm.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                              isChecked
                                ? 'border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.04)] text-[hsl(var(--text-primary))] font-medium'
                                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--text-muted)/0.3)]'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0 text-[hsl(var(--primary))]">
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                              )}
                            </div>
                            <div>
                              <h6 className="text-xs font-bold">{perm.label}</h6>
                              <p className="text-[9px] text-[hsl(var(--text-secondary))] mt-0.5 leading-normal">
                                {perm.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">
                    Internal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--border))] mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditDrawer(false)}
                    className="py-2 px-4 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="py-2 px-4 text-xs font-bold rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                  >
                    {isUpdating ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-[hsl(var(--danger))]" />
              Confirm Soft Deletion
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-3 leading-relaxed">
              Are you sure you want to soft-delete this administrative account? Deleting will deactivate their login sessions, but database records will remain intact with status set to &apos;DELETED&apos; and can be restored using the undo action.
            </p>
            <div className="flex gap-3 justify-end mt-6 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2 px-4 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="py-2 px-4 text-xs font-bold rounded-lg bg-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))/0.9] text-white transition-all cursor-pointer shadow-xs"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Admin Detail & History Audit Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {isLoadingDetails || !adminDetails ? (
              <div className="py-12"><LoadingSkeleton count={3} height="h-20" /></div>
            ) : (
              <div className="space-y-6">
                {/* Profile Detail Header */}
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[hsl(var(--border))] pb-5">
                  {adminDetails.user?.avatar ? (
                    <img
                      src={adminDetails.user.avatar}
                      alt=""
                      className="w-18 h-18 rounded-full object-cover border border-[hsl(var(--border))]"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-bold text-xl flex items-center justify-center border border-[hsl(var(--primary)/0.15)]">
                      {adminDetails.firstName.charAt(0)}{adminDetails.lastName.charAt(0)}
                    </div>
                  )}
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">
                      {adminDetails.firstName} {adminDetails.lastName}
                    </h3>
                    <p className="text-sm font-semibold text-[hsl(var(--text-secondary))]">
                      {adminDetails.designation} &bull; <span className="text-[hsl(var(--primary))]">{adminDetails.department}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1.5">
                      <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Emp ID: {adminDetails.employeeId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adminDetails.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {adminDetails.status}
                      </span>
                      <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {adminDetails.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] border-b border-[hsl(var(--border))]/60 pb-1.5">
                      Personal Details
                    </h4>
                    <div className="space-y-2.5 text-xs text-[hsl(var(--text-secondary))]">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                        <span className="font-semibold text-[hsl(var(--text-primary))]">Email:</span> {adminDetails.user?.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                        <span className="font-semibold text-[hsl(var(--text-primary))]">Phone:</span> {adminDetails.phone || 'N/A'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                        <span className="font-semibold text-[hsl(var(--text-primary))]">Department:</span> {adminDetails.department}
                      </p>
                      {adminDetails.notes && (
                        <div className="mt-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1]">
                          <span className="font-bold text-[hsl(var(--text-primary))] block mb-1">Notes:</span>
                          <span className="italic">{adminDetails.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] border-b border-[hsl(var(--border))]/60 pb-1.5">
                      Permissions Assigned
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {adminDetails.role === 'SUPER_ADMIN' ? (
                        <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-900 text-xs text-indigo-700 dark:text-indigo-300 w-full flex items-center gap-2 font-medium">
                          <Shield className="h-4.5 w-4.5" />
                          SUPER_ADMIN role grants unrestricted platform access.
                        </div>
                      ) : adminDetails.permissions && adminDetails.permissions.length > 0 ? (
                        adminDetails.permissions.map((p, idx) => (
                          <span key={idx} className="bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.15)] px-2.5 py-1 rounded-md text-xs font-semibold">
                            {p.permission}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[hsl(var(--text-muted))] italic">No customized permissions assigned.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Audit Activities Logs list */}
                <div className="space-y-4 pt-3">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 border-b border-[hsl(var(--border))]/60 pb-1.5">
                    <Activity className="h-4 w-4 text-[hsl(var(--primary))]" />
                    Audit Logs (Recent Activities)
                  </h4>
                  <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--muted))/0.15]">
                    {activities && activities.length > 0 ? (
                      <div className="divide-y divide-[hsl(var(--border))]/40 max-h-56 overflow-y-auto">
                        {activities.map((log) => (
                          <div key={log.id} className="p-3 flex justify-between items-center text-xs hover:bg-[hsl(var(--muted))/0.1] transition-colors">
                            <div>
                              <span className="font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--muted))] px-2 py-0.5 rounded text-[10px] mr-2">
                                {log.action}
                              </span>
                              <span className="text-[hsl(var(--text-secondary))]">{log.details}</span>
                            </div>
                            <div className="text-[10px] text-[hsl(var(--text-muted))] flex flex-col items-end">
                              <span>{new Date(log.createdAt).toLocaleString()}</span>
                              {log.ipAddress && <span className="mt-0.5">IP: {log.ipAddress}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-[hsl(var(--text-muted))] italic">
                        No activity records found for this administrator.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6 pt-3 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="py-2 px-4 text-xs font-bold rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminsManagement;
