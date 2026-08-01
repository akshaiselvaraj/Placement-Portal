import { useState, useMemo } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { ResumePreview } from '../../resume-builder/components/ResumePreview';
import { toast } from '@/store';
import {
  ClipboardList,
  Search,
  Filter,
  User,
  Building2,
  Briefcase,
  FileText,
  Globe,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  Phone,
  Mail,
  Award,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Printer,
  Maximize2,
} from 'lucide-react';

export interface ApplicationItem {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  companyName: string;
  jobRole: string;
  appliedDate: string;
  resumeStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWING' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
  cgpa: number;
  email: string;
  phone: string;
  skills: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
}

const INITIAL_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    studentName: 'Rakshana S.',
    rollNumber: '2022CSE045',
    department: 'Computer Science',
    companyName: 'Google India',
    jobRole: 'Software Engineer',
    appliedDate: '2026-07-28',
    resumeStatus: 'APPROVED',
    status: 'INTERVIEWING',
    cgpa: 9.1,
    email: 'rakshana@gmail.com',
    phone: '+91 98765 43210',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    resumeUrl: '/student/resumes/res-rakshana',
    portfolioUrl: '/portfolio/public/rakshana-s',
  },
  {
    id: 'app-2',
    studentName: 'Akshai V.',
    rollNumber: '2022CSE012',
    department: 'Computer Science',
    companyName: 'Microsoft',
    jobRole: 'Full Stack Developer',
    appliedDate: '2026-07-29',
    resumeStatus: 'APPROVED',
    status: 'SHORTLISTED',
    cgpa: 8.8,
    email: 'akshai@gmail.com',
    phone: '+91 98765 12345',
    skills: ['Python', 'Django', 'React', 'AWS', 'MongoDB'],
    resumeUrl: '/student/resumes/res-akshai',
    portfolioUrl: '/portfolio/public/akshai-v',
  },
  {
    id: 'app-3',
    studentName: 'Divya M.',
    rollNumber: '2022IT089',
    department: 'Information Technology',
    companyName: 'Amazon',
    jobRole: 'SDE-1',
    appliedDate: '2026-07-25',
    resumeStatus: 'APPROVED',
    status: 'SELECTED',
    cgpa: 9.4,
    email: 'divya@gmail.com',
    phone: '+91 91234 56789',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kubernetes'],
    resumeUrl: '/student/resumes/res-divya',
    portfolioUrl: '/portfolio/public/divya-m',
  },
  {
    id: 'app-4',
    studentName: 'Karthik R.',
    rollNumber: '2022ECE034',
    department: 'Electronics',
    companyName: 'TCS Digital',
    jobRole: 'Systems Engineer',
    appliedDate: '2026-07-30',
    resumeStatus: 'PENDING',
    status: 'APPLIED',
    cgpa: 7.9,
    email: 'karthik@gmail.com',
    phone: '+91 99887 76655',
    skills: ['C++', 'Embedded Systems', 'IoT', 'Python'],
    resumeUrl: '/student/resumes/res-karthik',
    portfolioUrl: '/portfolio/public/karthik-r',
  },
  {
    id: 'app-5',
    studentName: 'Priya K.',
    rollNumber: '2022CSE102',
    department: 'Computer Science',
    companyName: 'Google India',
    jobRole: 'Software Engineer',
    appliedDate: '2026-07-26',
    resumeStatus: 'APPROVED',
    status: 'REJECTED',
    cgpa: 7.4,
    email: 'priya@gmail.com',
    phone: '+91 97766 55443',
    skills: ['HTML', 'CSS', 'JavaScript', 'SQL'],
    resumeUrl: '/student/resumes/res-priya',
    portfolioUrl: '/portfolio/public/priya-k',
  },
];

export function ApplicationsPage() {
  const { isLoadingApplications } = usePlacementData();
  const [applications, setApplications] = useState<ApplicationItem[]>(INITIAL_APPLICATIONS);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Selected student drawer state
  const [selectedApplication, setSelectedApplication] = useState<ApplicationItem | null>(null);

  // Resume Modal State
  const [resumeModalApp, setResumeModalApp] = useState<ApplicationItem | null>(null);
  const [resumeTemplate, setResumeTemplate] = useState<string>('minimal');

  // Derived filter options
  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(applications.map((a) => a.companyName)));
  }, [applications]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(applications.map((a) => a.department)));
  }, [applications]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobRole.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'ALL' || app.companyName === companyFilter;
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const matchesDept = departmentFilter === 'ALL' || app.department === departmentFilter;

      return matchesSearch && matchesCompany && matchesStatus && matchesDept;
    });
  }, [applications, searchQuery, companyFilter, statusFilter, departmentFilter]);

  // Status Action Handlers
  const handleUpdateStatus = (appId: string, newStatus: ApplicationItem['status']) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );

    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    toast.success(`Application status updated to ${newStatus}`);
  };

  const handleViewResume = (app: ApplicationItem) => {
    setResumeModalApp(app);
    toast.success(`Viewing verified resume for ${app.studentName}`);
  };

  const handleViewPortfolio = (app: ApplicationItem) => {
    const slug = app.studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const targetUrl = app.portfolioUrl && app.portfolioUrl !== '#' ? app.portfolioUrl : `/portfolio/public/${slug}`;
    window.open(targetUrl, '_blank');
    toast.success(`Opening interactive web portfolio for ${app.studentName}`);
  };

  const getResumeDataForApp = (app: ApplicationItem) => {
    return {
      name: app.studentName,
      email: app.email,
      phone: app.phone,
      location: `${app.department} | Roll: ${app.rollNumber}`,
      website: `https://${app.studentName.toLowerCase().replace(/[^a-z0-9]/g, '')}.dev`,
      bio: `Final-year ${app.department} candidate (CGPA: ${app.cgpa}/10.0) with hands-on experience in full-stack web applications and software engineering. Verified for 2026 campus hiring.`,
      education: [
        {
          degree: `Bachelor of Technology in ${app.department}`,
          field: app.department,
          institution: 'State Institute of Technology',
          startYear: '2022',
          endYear: '2026',
          grade: `CGPA: ${app.cgpa} / 10.0`,
        },
      ],
      experience: [
        {
          designation: 'Software Engineering Intern',
          company: `${app.companyName} Prep Lab`,
          duration: 'May 2025 - Jul 2025',
          description: 'Architected scalable microservices and built responsive UI interfaces. Optimized database query performance and implemented automated unit testing suite.',
        },
      ],
      projects: [
        {
          title: 'Campus Placement & Verification System',
          repoUrl: `github.com/${app.studentName.toLowerCase().replace(/[^a-z0-9]/g, '')}/placement-sys`,
          description: `Full-stack production platform using ${app.skills.slice(0, 3).join(', ')}. Supports applicant tracking, real-time analytics, and document approval.`,
          techStack: app.skills,
        },
      ],
      skills: app.skills.map((s) => ({ name: s, level: 'Advanced' })),
    };
  };

  if (isLoadingApplications) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={1} height="h-20" />
        <LoadingSkeleton count={5} height="h-16" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))]">
              Student Applications Management
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 font-medium">
            Review, filter, shortlist, and process candidate job applications across registered placement drives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] font-bold text-xs text-[hsl(var(--text-secondary))]">
            Total: <strong className="text-[hsl(var(--text-primary))]">{applications.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-bold text-xs">
            Interviewing: <strong className="text-[hsl(var(--primary))]">{applications.filter(a => a.status === 'INTERVIEWING').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
            <input
              type="text"
              placeholder="Search student, roll no, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] transition-all font-medium"
            />
          </div>

          {/* Company Filter */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs text-[hsl(var(--text-primary))] font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] transition-all cursor-pointer"
          >
            <option value="ALL">All Companies</option>
            {uniqueCompanies.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs text-[hsl(var(--text-primary))] font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] transition-all cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs text-[hsl(var(--text-primary))] font-medium focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] transition-all cursor-pointer"
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
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="No applications match filters"
              message="Try adjusting search terms or clear existing filter dropdowns."
              icon={<Filter className="h-10 w-10 text-[hsl(var(--text-muted))]" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] text-[11px] font-extrabold text-[hsl(var(--text-muted))] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Resume Status</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))] text-xs">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[hsl(var(--muted)/0.15)] transition-colors group cursor-pointer"
                    onClick={() => setSelectedApplication(app)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-extrabold flex items-center justify-center text-xs">
                          {app.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--primary))] transition-colors">
                            {app.studentName}
                          </p>
                          <p className="text-[11px] text-[hsl(var(--text-secondary))] font-mono">
                            {app.rollNumber} • CGPA: {app.cgpa}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[hsl(var(--text-secondary))]">
                      {app.department}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[hsl(var(--text-primary))]">{app.companyName}</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">{app.jobRole}</p>
                    </td>

                    <td className="py-3.5 px-4 text-[hsl(var(--text-secondary))] font-medium">
                      {app.appliedDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                        app.resumeStatus === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : app.resumeStatus === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {app.resumeStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                        app.status === 'SELECTED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : app.status === 'INTERVIEWING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : app.status === 'SHORTLISTED'
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] transition-colors cursor-pointer"
                          title="View Full Application Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer: Detailed Application Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[hsl(var(--background))] border-l border-[hsl(var(--border))] h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[hsl(var(--primary))] text-white font-black text-sm flex items-center justify-center shadow-md">
                    {selectedApplication.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[hsl(var(--text-primary))]">
                      {selectedApplication.studentName}
                    </h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                      {selectedApplication.rollNumber} • {selectedApplication.department}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Target Job Banner */}
              <div className="p-4 rounded-2xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[hsl(var(--text-muted))] tracking-wider block">Target Company</span>
                  <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))] mt-0.5">
                    {selectedApplication.companyName} <span className="font-medium text-xs text-[hsl(var(--text-secondary))]">({selectedApplication.jobRole})</span>
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {selectedApplication.status}
                </span>
              </div>

              {/* Contact & Academic Information */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-extrabold text-[hsl(var(--text-muted))] tracking-wider">
                  Academic & Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-[hsl(var(--primary))]" />
                    <span className="truncate font-medium text-[hsl(var(--text-primary))]">{selectedApplication.email}</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-[hsl(var(--primary))]" />
                    <span className="font-medium text-[hsl(var(--text-primary))]">{selectedApplication.phone}</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-2.5">
                    <Award className="h-4 w-4 text-emerald-500" />
                    <div>
                      <span className="text-[10px] text-[hsl(var(--text-muted))] block font-bold">Cumulative CGPA</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {selectedApplication.cgpa} / 10.0
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-sky-500" />
                    <div>
                      <span className="text-[10px] text-[hsl(var(--text-muted))] block font-bold">Resume Verification</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {selectedApplication.resumeStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Skills Badges */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-extrabold text-[hsl(var(--text-muted))] tracking-wider">
                  Technical Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] font-bold text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Submitted Verification Documents */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase font-extrabold text-[hsl(var(--text-muted))] tracking-wider">
                  Submitted Verification Documents
                </h4>

                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[hsl(var(--text-primary))]">Verified Resume (PDF)</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">Updated for 2026 Hiring Season</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewResume(selectedApplication)}
                    className="px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    View Resume
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[hsl(var(--text-primary))]">Interactive Web Portfolio</p>
                      <p className="text-[11px] text-[hsl(var(--text-secondary))]">Live Showcase & Projects</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewPortfolio(selectedApplication)}
                    className="px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
                  >
                    View Portfolio
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Application Status Actions */}
              <div className="pt-4 border-t border-[hsl(var(--border))] space-y-2">
                <h4 className="text-xs uppercase font-extrabold text-[hsl(var(--text-muted))]">Change Application Status</h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'SHORTLISTED')}
                    className="py-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 font-bold text-xs transition-colors cursor-pointer border border-sky-500/20"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'INTERVIEWING')}
                    className="py-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs transition-colors cursor-pointer border border-amber-500/20"
                  >
                    Schedule Round
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'REJECTED')}
                    className="py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition-colors cursor-pointer border border-rose-500/20"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {resumeModalApp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[hsl(var(--text-primary))] flex items-center gap-2">
                    Verified Resume — {resumeModalApp.studentName}
                  </h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] font-medium">
                    {resumeModalApp.rollNumber} • {resumeModalApp.department} • CGPA: {resumeModalApp.cgpa}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Template Selector */}
                <div className="flex items-center bg-[hsl(var(--muted)/0.5)] p-1 rounded-xl border border-[hsl(var(--border))] text-xs font-bold">
                  {(['minimal', 'modern', 'classical'] as const).map((tmpl) => (
                    <button
                      key={tmpl}
                      onClick={() => setResumeTemplate(tmpl)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                        resumeTemplate === tmpl
                          ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
                          : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                      }`}
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Print or Save PDF"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  onClick={() => {
                    window.open(`/student/resumes/${resumeModalApp.id}`, '_blank');
                  }}
                  className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                  title="Open Full Page Workspace"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setResumeModalApp(null)}
                  className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Resume Render */}
            <div className="p-6 overflow-y-auto bg-[hsl(var(--muted)/0.2)] flex justify-center">
              <div className="w-full max-w-3xl">
                <ResumePreview templateId={resumeTemplate} data={getResumeDataForApp(resumeModalApp)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
