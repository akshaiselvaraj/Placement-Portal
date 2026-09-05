import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import type { ExtensionUserItem } from '../services/admin.service';
import { LoadingSkeleton } from '@/components/common';
import { ExternalLink, ArrowLeft, CheckCircle2, ShieldAlert, Clock, User, Mail, Hash, Calendar } from 'lucide-react';

const OFFICIAL_PS_PORTAL = 'https://ps.bitsathy.ac.in/';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<ExtensionUserItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminService
        .getExtensionUserById(id)
        .then((data) => setUser(data))
        .catch((err) => console.error('Failed to load user detail:', err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-[hsl(var(--danger))]">User Not Found</h3>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          The specified extension user profile does not exist.
        </p>
        <Link to="/admin/users" className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline">
          ← Back to Users List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="p-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-hover))] text-[hsl(var(--text-primary))] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
              {user.fullName}
            </h2>
            <p className="text-xs text-[hsl(var(--text-secondary))]">{user.email}</p>
          </div>
        </div>

        {/* Action Button: Open PS Portal */}
        <a
          href={OFFICIAL_PS_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl shadow-xs transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          Open PS Portal
        </a>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-500" />
            Basic Information
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </span>
              <span className="font-bold text-[hsl(var(--text-primary))]">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </span>
              <span className="font-semibold text-[hsl(var(--text-primary))]">{user.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" /> User ID
              </span>
              <span className="font-mono text-[10px] text-[hsl(var(--text-secondary))]">{user.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Registration Date
              </span>
              <span className="font-medium text-[hsl(var(--text-primary))]">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[hsl(var(--text-secondary))] font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Last Profile Update
              </span>
              <span className="font-medium text-[hsl(var(--text-primary))]">
                {new Date(user.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Extension & Consent Metadata */}
        <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Extension & Consent Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium">Extension Version</span>
              <span className="font-mono font-bold text-[hsl(var(--text-primary))]">v{user.extensionVersion || '1.0.0'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium">Registration Status</span>
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                user.status === 'ACTIVE'
                  ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
                  : 'bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]'
              }`}>
                {user.status}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium">Privacy Consent Accepted</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[hsl(var(--border)/0.5)]">
              <span className="text-[hsl(var(--text-secondary))] font-medium">Consent Timestamp</span>
              <span className="font-medium text-[hsl(var(--text-primary))]">
                {user.consentTimestamp ? new Date(user.consentTimestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[hsl(var(--text-secondary))] font-medium">Credential Protection</span>
              <span className="font-bold text-emerald-600">Zero Password / Cookie Stored</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-500" />
          Privacy-Conscious Activity History
        </h3>

        {(!user.activityLogs || user.activityLogs.length === 0) ? (
          <p className="text-xs text-[hsl(var(--text-secondary))] py-4">No activity records logged yet.</p>
        ) : (
          <div className="space-y-3">
            {user.activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--bg-primary)/0.3)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-[hsl(var(--primary-light))] text-[hsl(var(--primary))]">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[hsl(var(--text-primary))]">{log.activityType}</div>
                    <div className="text-[10px] text-[hsl(var(--text-secondary))] mt-0.5">
                      {log.metadata ? JSON.stringify(log.metadata) : 'Application Interaction'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-[hsl(var(--text-secondary))]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                  <a
                    href={OFFICIAL_PS_PORTAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--primary))] hover:underline"
                  >
                    <span>PS Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetailPage;
