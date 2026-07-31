import { useAuthStore, useThemeStore } from '@/store';
import { useAuth } from '@/features/auth';
import { Sun, Moon, LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { NotificationsDropdown } from '@/features/notifications';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export function Navbar({ onToggleMobileSidebar }: NavbarProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-(--navbar-height) border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-[hsl(var(--text-primary))]">
          Placement Portal
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Dropdown */}
        <NotificationsDropdown />

        {/* User Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center text-xs font-semibold">
                {user ? getInitials(user.name) : <UserIcon className="h-4 w-4" />}
              </div>
            )}
            <span className="hidden sm:inline text-sm font-medium text-[hsl(var(--text-primary))]">
              {user?.name}
            </span>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay background to dismiss menu */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-lg p-2 z-50 animate-in">
                <div className="px-3 py-2 border-b border-[hsl(var(--border))] mb-1.5">
                  <p className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] truncate">
                    {user?.email}
                  </p>
                  <p className="inline-block mt-1.5 px-2 py-0.5 rounded bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-bold tracking-wide uppercase">
                    {user?.role.replace('_', ' ')}
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[hsl(var(--danger))] rounded-lg hover:bg-[hsl(var(--danger)/0.08)] transition-colors cursor-pointer font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
