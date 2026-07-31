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
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
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
        <div className="h-(--navbar-height) px-6 border-b border-[hsl(var(--border))] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
            <GraduationCap className="h-6 w-6 text-[hsl(var(--primary))]" />
            <span className="font-extrabold text-base tracking-tight text-[hsl(var(--text-primary))]">
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
