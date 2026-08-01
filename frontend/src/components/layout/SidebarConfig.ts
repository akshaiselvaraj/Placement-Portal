import {
  LayoutDashboard,
  FileText,
  Briefcase,
  FolderHeart,
  Users,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  Settings,
  ClipboardList,
  UserCheck,
  BarChart3,
  Search,
  TrendingUp,
} from 'lucide-react';
import type { RoleType } from '@/lib/constants';

export interface SidebarItem {
  title: string;
  href: string;
  icon: any;
}

export const SIDEBAR_ITEMS: Record<RoleType, SidebarItem[]> = {
  ADMIN: [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Manage Users', href: '/admin/users', icon: Users },
    { title: 'System Settings', href: '/admin/settings', icon: Settings },
  ],
  PLACEMENT_OFFICER: [
    { title: 'Dashboard', href: '/placement/dashboard', icon: LayoutDashboard },
    { title: 'Students', href: '/placement/students', icon: GraduationCap },
    { title: 'Approvals', href: '/placement/approvals', icon: Building2 },
    { title: 'Interview Scheduler', href: '/placement/scheduler', icon: UserCheck },
    { title: 'Publish Results', href: '/placement/results', icon: Layers },
    { title: 'Placement Analytics', href: '/placement/analytics', icon: BarChart3 },
  ],
  RECRUITER: [
    { title: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
    { title: 'Company Profile', href: '/recruiter/company', icon: Building2 },
    { title: 'Manage Jobs', href: '/recruiter/jobs', icon: Briefcase },
    { title: 'Applicants', href: '/recruiter/applicants', icon: Users },
    { title: 'Candidate Search', href: '/recruiter/candidates', icon: Search },
    { title: 'Interviews', href: '/recruiter/interviews', icon: Calendar },
    { title: 'Hiring History', href: '/recruiter/hiring-history', icon: TrendingUp },
  ],
  STUDENT: [
    { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { title: 'Profile', href: '/student/profile', icon: Users },
    { title: 'Resume Builder', href: '/student/resumes', icon: FileText },
    { title: 'Portfolio Generator', href: '/student/portfolio', icon: FolderHeart },
    { title: 'Browse Jobs', href: '/student/jobs', icon: Briefcase },
    { title: 'My Applications', href: '/student/applications', icon: ClipboardList },
  ],
};
