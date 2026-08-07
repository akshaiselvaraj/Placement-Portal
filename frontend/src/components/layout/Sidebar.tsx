import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { SIDEBAR_ITEMS } from './SidebarConfig';
import type { RoleType } from '@/lib/constants';
import { X, GraduationCap } from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const items = SIDEBAR_ITEMS[user.role as RoleType] || [];

  const renderNavItems = () => {
    return (
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-md shadow-[hsl(var(--primary)/0.15)] scale-[1.02]'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] hover:translate-x-1'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-(--sidebar-width) bg-[hsl(var(--surface))] border-r border-[hsl(var(--border))] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-(--navbar-height) px-6 border-b border-[hsl(var(--border))/0.6] flex items-center justify-between bg-gradient-to-r from-[hsl(var(--surface))] to-[hsl(var(--muted))/0.2]">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="p-1.5 rounded-xl bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-black text-lg tracking-tight gradient-text">
              PlaceHub
            </span>
          </Link>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        {renderNavItems()}

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[hsl(var(--border))] text-center">
          <p className="text-[10px] font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wider">
            Version 1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
