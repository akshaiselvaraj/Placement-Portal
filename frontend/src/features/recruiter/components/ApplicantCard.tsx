import { FileText, Globe, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/common';
import type { Application } from '@/types';

interface ApplicantCardProps {
  application: Application;
  onUpdateStatus: (id: string, status: string) => Promise<any>;
  isUpdating: boolean;
}

export function ApplicantCard({ application, onUpdateStatus, isUpdating }: ApplicantCardProps) {
  const student = application.student;
  if (!student) return null;

  const isVerified = student.profileStatus === 'VERIFIED';
  
  // Find primary resume & portfolio links
  const resume = student.resumes?.[0];
  const portfolio = student.portfolios?.[0];

  return (
    <div className="flex flex-col justify-between p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs hover:border-[hsl(var(--primary)/0.3)] transition-all space-y-6">
      <div className="space-y-4">
        {/* Profile Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center text-base font-bold shrink-0">
              {student.user?.name ? student.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST'}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                {student.user?.name}
                {isVerified ? (
                  <span title="Profile Verified"><CheckCircle2 className="h-4.5 w-4.5 text-[hsl(var(--success))]" /></span>
                ) : (
                  <span title="Pending Verification"><AlertTriangle className="h-4.5 w-4.5 text-[hsl(var(--warning))]" /></span>
                )}
              </h4>
              <p className="text-xs text-[hsl(var(--text-secondary))]">{student.user?.email}</p>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        {/* Academic Details */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-[hsl(var(--muted))/0.4] p-3.5 rounded-xl border border-[hsl(var(--border))/0.5]">
          <div>
            <p className="font-semibold text-[hsl(var(--text-muted))] uppercase text-[9px] tracking-wider mb-0.5">CGPA</p>
            <p className="font-bold text-[hsl(var(--text-primary))]">{student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold text-[hsl(var(--text-muted))] uppercase text-[9px] tracking-wider mb-0.5">Roll Number</p>
            <p className="font-bold text-[hsl(var(--text-primary))]">{student.rollNumber}</p>
          </div>
          <div>
            <p className="font-semibold text-[hsl(var(--text-muted))] uppercase text-[9px] tracking-wider mb-0.5">Department</p>
            <p className="font-bold text-[hsl(var(--text-primary))] truncate">{student.department}</p>
          </div>
          <div>
            <p className="font-semibold text-[hsl(var(--text-muted))] uppercase text-[9px] tracking-wider mb-0.5">Batch / Year</p>
            <p className="font-bold text-[hsl(var(--text-primary))]">{student.batch}</p>
          </div>
        </div>

        {/* Applied for */}
        <div className="text-xs">
          <p className="font-semibold text-[hsl(var(--text-muted))] uppercase text-[9px] tracking-wider mb-0.5">Applied For</p>
          <p className="font-bold text-[hsl(var(--primary))]">{application.job?.title} ({application.job?.type})</p>
        </div>

        {/* Resume & Portfolio Links */}
        <div className="flex gap-2">
          {resume ? (
            <a
              href={`/student/resume/preview/${resume.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-xs font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              View Resume
            </a>
          ) : (
            <button
              disabled
              className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-xs font-bold text-[hsl(var(--text-muted))] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-lg opacity-50 cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              No Resume
            </button>
          )}

          {portfolio && portfolio.isPublished ? (
            <a
              href={`/portfolio/${portfolio.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors"
            >
              <Globe className="h-4 w-4" />
              View Portfolio
            </a>
          ) : (
            <button
              disabled
              className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[hsl(var(--muted))] rounded-lg opacity-50 cursor-not-allowed"
            >
              <Globe className="h-4 w-4" />
              No Portfolio
            </button>
          )}
        </div>
      </div>

      {/* Decision Actions */}
      <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between gap-2.5">
        <button
          onClick={() => onUpdateStatus(application.id, 'REJECTED')}
          disabled={isUpdating || application.status === 'REJECTED'}
          className="flex-1 text-center py-2 px-3 text-xs font-bold rounded-lg border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] text-[hsl(var(--danger))] disabled:opacity-50 transition-colors cursor-pointer"
        >
          Reject
        </button>
        <button
          onClick={() => onUpdateStatus(application.id, 'SHORTLISTED')}
          disabled={isUpdating || application.status === 'SHORTLISTED'}
          className="flex-1 text-center py-2 px-3 text-xs font-bold rounded-lg border border-[hsl(var(--info)/0.2)] bg-[hsl(var(--info-light))] hover:bg-[hsl(var(--info)/0.15)] text-[hsl(var(--info))] disabled:opacity-50 transition-colors cursor-pointer"
        >
          Shortlist
        </button>
        <button
          onClick={() => onUpdateStatus(application.id, 'SELECTED')}
          disabled={isUpdating || application.status === 'SELECTED'}
          className="flex-1 text-center py-2 px-3 text-xs font-bold rounded-lg bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white disabled:opacity-50 transition-all cursor-pointer"
        >
          Select
        </button>
      </div>
    </div>
  );
}

export default ApplicantCard;
