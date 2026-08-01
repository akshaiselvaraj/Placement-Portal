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
  Shield,
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
    { title: 'Manage Admins', href: '/admin/admins', icon: Shield },
    { title: 'Manage Companies', href: '/admin/companies', icon: Building2 },
    { title: 'System Audit Logs', href: '/admin/logs', icon: ClipboardList },
    { title: 'System Settings', href: '/admin/settings', icon: Settings },
  ],
  PLACEMENT_OFFICER: [
    { title: 'Dashboard', href: '/placement/dashboard', icon: LayoutDashboard },
    { title: 'Students', href: '/placement/students', icon: GraduationCap },
    { title: 'Placement Drives', href: '/placement/drives', icon: Calendar },
    { title: 'Companies', href: '/placement/companies', icon: Building2 },
    { title: 'Applications', href: '/placement/applications', icon: ClipboardList },
    { title: 'Approvals Desk', href: '/placement/approvals', icon: UserCheck },
    { title: 'Scheduler', href: '/placement/scheduler', icon: UserCheck },
    { title: 'Publish Results', href: '/placement/results', icon: Layers },
    { title: 'Placement Analytics', href: '/placement/analytics', icon: BarChart3 },
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
