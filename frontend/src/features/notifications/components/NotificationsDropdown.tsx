import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { Bell, Check, Trash, ShieldCheck, Mail, Info, AlertTriangle, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    setIsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <ShieldCheck className="h-4 w-4 text-[hsl(var(--success))]" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />;
      case 'ACTION':
        return <Briefcase className="h-4 w-4 text-[hsl(var(--primary))]" />;
      default:
        return <Info className="h-4 w-4 text-[hsl(var(--info))]" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--danger))] text-[9px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover list */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 max-w-sm rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-3 duration-150">
          <div className="flex justify-between items-center pb-2 border-b border-[hsl(var(--border))] mb-3 text-xs">
            <h4 className="font-bold text-[hsl(var(--text-primary))]">In-app Alerts</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[hsl(var(--primary))] hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <Check className="h-3 w-3" />
                Read all
              </button>
            )}
          </div>

          {/* Alert roster */}
          <div className="space-y-2.5 max-h-75 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-[hsl(var(--text-muted))] font-bold">
                No alerts received yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-xl border flex gap-3 items-start transition-all cursor-pointer relative group ${
                    n.isRead
                      ? 'bg-[hsl(var(--surface))] border-[hsl(var(--border))/0.4] opacity-75 hover:opacity-100'
                      : 'bg-[hsl(var(--primary)/0.04)] border-[hsl(var(--primary)/0.15)] hover:bg-[hsl(var(--primary)/0.08)]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className="font-bold text-xs text-[hsl(var(--text-primary))] truncate">
                      {n.title}
                    </h5>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-[hsl(var(--text-muted))] font-semibold mt-1 block">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-md bg-[hsl(var(--muted))/0.5] hover:bg-[hsl(var(--danger-light))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--danger))] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsDropdown;
