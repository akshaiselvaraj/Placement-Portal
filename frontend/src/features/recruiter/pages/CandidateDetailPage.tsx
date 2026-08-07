import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recruiterService, type ScheduleInterviewPayload, type AtsBreakdown } from '../services/recruiter.service';
import { useRecruiterData } from '../hooks/useRecruiterData';
import { StatusBadge, LoadingSkeleton, Github, Linkedin } from '@/components/common';
import {
  ArrowLeft, User, Briefcase, GraduationCap, Code2, Award, Phone, Mail,
  Globe, ChevronDown, ChevronUp, Calendar, Clock,
  Video, MapPin, CheckCircle, XCircle, AlertCircle, MessageSquare, Download, Plus, X
} from 'lucide-react';

function AtsBreakdownPanel({ breakdown }: { breakdown: AtsBreakdown }) {
  const [open, setOpen] = useState(false);
  const scores = breakdown?.scores || {};
  const pct = Math.round(breakdown?.score || 0);
  const color = pct >= 80 ? 'hsl(var(--success))' : pct >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-[hsl(var(--muted)/0.3)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl border-4 flex items-center justify-center font-extrabold text-sm"
            style={{ borderColor: color, color }}>
            {pct}%
          </div>
          <div className="text-left">
            <p className="font-bold text-sm text-[hsl(var(--text-primary))]">ATS Match Score</p>
            <p className="text-xs text-[hsl(var(--text-secondary))]">
              {pct >= 80 ? 'Strong match' : pct >= 60 ? 'Moderate match' : 'Weak match'} for this role
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-[hsl(var(--text-muted))]" /> : <ChevronDown className="h-4 w-4 text-[hsl(var(--text-muted))]" />}
      </button>

      {open && (
        <div className="border-t border-[hsl(var(--border))] p-4 space-y-4 animate-in">
          {/* Score bars */}
          <div className="space-y-3">
            {[
              { label: 'Skills', score: scores.skillsScore || 0, max: (breakdown.weights?.skills || 0) * 100 },
              { label: 'Education', score: scores.educationScore || 0, max: (breakdown.weights?.education || 0) * 100 },
              { label: 'CGPA', score: scores.cgpaScore || 0, max: (breakdown.weights?.cgpa || 0) * 100 },
              { label: 'Experience', score: scores.experienceScore || 0, max: (breakdown.weights?.experience || 0) * 100 },
              { label: 'Projects', score: scores.projectsScore || 0, max: (breakdown.weights?.projects || 0) * 100 },
              { label: 'Certifications', score: scores.certificationsScore || 0, max: (breakdown.weights?.certifications || 0) * 100 },
            ].map(({ label, score, max }) => {
              const ratio = max > 0 ? score / max : 0;
              const c = ratio >= 0.8 ? 'hsl(var(--success))' : ratio >= 0.5 ? 'hsl(var(--warning))' : 'hsl(var(--danger))';
              return (
                <div key={label} className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-[hsl(var(--text-secondary))] font-medium">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-[hsl(var(--border))] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, backgroundColor: c }} />
                  </div>
                  <span className="w-12 text-right font-semibold" style={{ color: c }}>{score.toFixed(1)}/{max.toFixed(0)}</span>
                </div>
              );
            })}
          </div>

          {/* Skills match */}
          {(breakdown.matchedSkills?.length > 0 || breakdown.missingSkills?.length > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[hsl(var(--border))]">
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--success))] mb-2">✓ Matched Skills</p>
                <div className="flex flex-wrap gap-1">
                  {(breakdown.matchedSkills || []).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-[hsl(var(--success-light))] text-[hsl(var(--success))]">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--danger))] mb-2">✗ Missing Skills</p>
                <div className="flex flex-wrap gap-1">
                  {(breakdown.missingSkills || []).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))]">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Eligibility */}
          {breakdown.eligibility && (
            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-2">Eligibility Check</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Department', ok: breakdown.eligibility.departmentEligible },
                  { label: 'Grad Year', ok: breakdown.eligibility.gradYearEligible },
                  { label: 'CGPA', ok: breakdown.eligibility.cgpaEligible },
                  { label: 'Activity Points', ok: breakdown.eligibility.activityPointsEligible },
                ].map(({ label, ok }) => (
                  <span key={label} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${ok ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)]' : 'bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))] border-[hsl(var(--danger)/0.2)]'}`}>
                    {ok ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Explanations */}
          {breakdown.explanations?.length > 0 && (
            <div className="pt-2 border-t border-[hsl(var(--border))]">
              <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] mb-2">Insights</p>
              <ul className="space-y-1">
                {breakdown.explanations.map((e: string, i: number) => (
                  <li key={i} className="text-xs text-[hsl(var(--text-secondary))] flex items-start gap-1.5">
                    <span className="text-[hsl(var(--primary))] mt-0.5">•</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewForm({
  applicationId,
  onSchedule,
  isPending,
  onClose,
}: {
  applicationId: string;
  onSchedule: (data: ScheduleInterviewPayload) => Promise<void>;
  isPending: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<ScheduleInterviewPayload, 'applicationId'>>({
    date: '',
    time: '',
    duration: 60,
    interviewer: '',
    meetingLink: '',
    roundType: 'TECHNICAL',
    location: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSchedule({ ...form, applicationId });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Date *</label>
          <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Time</label>
          <input type="time" value={form.time || ''} onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Round Type</label>
          <select value={form.roundType || ''} onChange={(e) => setForm({ ...form, roundType: e.target.value })}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer">
            {['SCREENING', 'TECHNICAL', 'HR', 'MANAGERIAL', 'FINAL', 'ASSIGNMENT'].map(r => (
              <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Duration (min)</label>
          <input type="number" value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Interviewer Name(s)</label>
        <input type="text" value={form.interviewer || ''} onChange={(e) => setForm({ ...form, interviewer: e.target.value })}
          placeholder="John Doe, Jane Smith"
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Meeting Link</label>
        <input type="url" value={form.meetingLink || ''} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
          placeholder="https://meet.google.com/..."
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Notes</label>
        <textarea rows={3} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Interview instructions or topics to cover..."
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer">
          {isPending ? 'Scheduling…' : 'Schedule Interview'}
        </button>
      </div>
    </form>
  );
}

export function CandidateDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { updateApplicantStatus, isUpdatingStatus, scheduleInterview, isSchedulingInterview } = useRecruiterData();

  const [activeTab, setActiveTab] = useState<'overview' | 'ats' | 'interviews' | 'history'>('overview');
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [statusAction, setStatusAction] = useState<{ status: string; label: string; color?: string } | null>(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  const { data: candidate, isLoading, refetch } = useQuery({
    queryKey: ['candidate-detail', applicationId],
    queryFn: () => recruiterService.getCandidateDetails(applicationId!),
    enabled: !!applicationId,
  });

  const handleStatusUpdate = async () => {
    if (!statusAction || !candidate) return;
    await updateApplicantStatus({
      id: candidate.id,
      data: {
        status: statusAction.status,
        notes: statusNotes || undefined,
        joiningDate: joiningDate || undefined,
      },
    });
    setStatusAction(null);
    setStatusNotes('');
    setJoiningDate('');
    refetch();
  };

  if (isLoading) return <LoadingSkeleton count={4} height="h-32" className="mt-8 animate-in" />;
  if (!candidate) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="h-12 w-12 text-[hsl(var(--text-muted))] mb-4" />
      <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Candidate not found</h3>
    </div>
  );

  const { student, job, interviews, statusHistory, atsBreakdown } = candidate;

  const QUICK_ACTIONS = [
    { status: 'UNDER_REVIEW', label: 'Mark Under Review', color: 'hsl(var(--warning))' },
    { status: 'SHORTLISTED', label: 'Shortlist', color: 'hsl(var(--info))' },
    { status: 'INTERVIEW_SCHEDULED', label: 'Move to Interview', color: 'hsl(var(--primary))' },
    { status: 'SELECTED', label: 'Select (Offer)', color: 'hsl(var(--success))' },
    { status: 'HIRED', label: 'Mark as Hired', color: 'hsl(142, 76%, 36%)' },
    { status: 'REJECTED', label: 'Reject', color: 'hsl(var(--danger))' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/recruiter/applicants')}
          className="flex items-center gap-1.5 text-sm text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applicants
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-extrabold text-xl shrink-0 border border-[hsl(var(--primary)/0.15)]">
            {student?.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-[hsl(var(--text-primary))]">{student?.user?.name}</h2>
              <StatusBadge status={candidate.status} />
            </div>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5">
              {student?.department} &bull; Batch {student?.batch} &bull; CGPA: {student?.cgpa?.toFixed(2) ?? 'N/A'}
            </p>
            <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
              Applied for <span className="font-semibold text-[hsl(var(--text-secondary))]">{job?.title}</span> &bull; {new Date(candidate.appliedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {student?.linkedin && (
              <a href={student.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors" title="LinkedIn">
                <Linkedin className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              </a>
            )}
            {student?.github && (
              <a href={student.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors" title="GitHub">
                <Github className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              </a>
            )}
            {student?.website && (
              <a href={student.website} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors" title="Portfolio">
                <Globe className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              </a>
            )}
            {student?.phone && (
              <a href={`tel:${student.phone}`} className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors" title={student.phone}>
                <Phone className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              </a>
            )}
            {student?.user?.email && (
              <a href={`mailto:${student.user.email}`} className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors" title={student.user.email}>
                <Mail className="h-4 w-4 text-[hsl(var(--text-secondary))]" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
        {[
          { key: 'overview', label: 'Profile' },
          { key: 'ats', label: 'ATS Analysis' },
          { key: 'interviews', label: `Interviews (${interviews?.length ?? 0})` },
          { key: 'history', label: 'Status History' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${activeTab === key
              ? 'bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] shadow-xs'
              : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* ── PROFILE TAB ── */}
          {activeTab === 'overview' && (
            <>
              {/* Bio */}
              {student?.bio && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-[hsl(var(--primary))]" /> About
                  </h4>
                  <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">{student.bio}</p>
                </div>
              )}

              {/* Academic Marks & Activities */}
              {(student?.tenthMarks !== null || student?.twelfthMarks !== null || student?.activityPoints !== null) && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2">
                    <Award className="h-4 w-4 text-[hsl(var(--primary))]" /> Academic Scores & Activities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {student?.tenthMarks !== null && student?.tenthMarks !== undefined && (
                      <div className="p-3.5 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                        <p className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider">10th Marks</p>
                        <p className="text-lg font-extrabold text-[hsl(var(--text-primary))] mt-1">{student.tenthMarks.toFixed(1)}%</p>
                      </div>
                    )}
                    {student?.twelfthMarks !== null && student?.twelfthMarks !== undefined && (
                      <div className="p-3.5 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                        <p className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider">12th Marks</p>
                        <p className="text-lg font-extrabold text-[hsl(var(--text-primary))] mt-1">{student.twelfthMarks.toFixed(1)}%</p>
                      </div>
                    )}
                    {student?.activityPoints !== null && student?.activityPoints !== undefined && (
                      <div className="p-3.5 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                        <p className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider">Activity Points</p>
                        <p className="text-lg font-extrabold text-[hsl(var(--text-primary))] mt-1">{student.activityPoints}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {student?.educations?.length > 0 && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
                    <GraduationCap className="h-4 w-4 text-[hsl(var(--primary))]" /> Education
                  </h4>
                  <div className="space-y-3">
                    {student.educations.map((ed) => (
                      <div key={ed.id} className="flex gap-3">
                        <div className="w-1 rounded-full bg-[hsl(var(--primary)/0.3)] shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-[hsl(var(--text-primary))]">{ed.institution}</p>
                          <p className="text-xs text-[hsl(var(--text-secondary))]">{ed.degree} in {ed.field}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">{ed.startYear} – {ed.endYear ?? 'Present'} {ed.grade ? `• ${ed.grade}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {student?.skills?.length > 0 && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-3">
                    <Code2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((sk) => (
                      <span key={sk.id} className="px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.15)]">
                        {sk.name}{sk.level ? ` · ${sk.level}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {student?.projects?.length > 0 && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
                    <Briefcase className="h-4 w-4 text-[hsl(var(--primary))]" /> Projects
                  </h4>
                  <div className="space-y-4">
                    {student.projects.map((pr) => (
                      <div key={pr.id} className="p-4 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))]">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-sm text-[hsl(var(--text-primary))]">{pr.title}</h5>
                          <div className="flex gap-1 shrink-0">
                            {pr.liveUrl && <a href={pr.liveUrl} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors"><Globe className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" /></a>}
                            {pr.repoUrl && <a href={pr.repoUrl} target="_blank" rel="noreferrer" className="p-1 rounded hover:bg-[hsl(var(--muted))] transition-colors"><Github className="h-3.5 w-3.5 text-[hsl(var(--text-muted))]" /></a>}
                          </div>
                        </div>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 line-clamp-2">{pr.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pr.techStack.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))]">{t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {student?.certifications?.length > 0 && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-[hsl(var(--primary))]" /> Certifications
                  </h4>
                  <div className="space-y-2">
                    {student.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between gap-2 py-2 border-b border-[hsl(var(--border))] last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{cert.name}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">{cert.issuer}{cert.date ? ` · ${new Date(cert.date).getFullYear()}` : ''}</p>
                        </div>
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
                            Verify
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumes */}
              {student?.resumes?.length > 0 && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-3">
                    <Download className="h-4 w-4 text-[hsl(var(--primary))]" /> Resumes
                  </h4>
                  <div className="space-y-2">
                    {student.resumes.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                        <div>
                          <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">{r.title}</p>
                          <p className="text-xs text-[hsl(var(--text-muted))]">Template: {r.templateId} &bull; {new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        {r.isApproved && <span className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--success))]"><CheckCircle className="h-3.5 w-3.5" />Approved</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── ATS TAB ── */}
          {activeTab === 'ats' && atsBreakdown && (
            <AtsBreakdownPanel breakdown={atsBreakdown} />
          )}

          {/* ── INTERVIEWS TAB ── */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[hsl(var(--text-primary))]">Interview History</h4>
                <button
                  onClick={() => setShowInterviewForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule
                </button>
              </div>

              {showInterviewForm && (
                <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-bold text-sm text-[hsl(var(--text-primary))]">Schedule Interview</h5>
                    <button onClick={() => setShowInterviewForm(false)} className="p-1 rounded hover:bg-[hsl(var(--muted))] cursor-pointer"><X className="h-4 w-4" /></button>
                  </div>
                  <InterviewForm
                    applicationId={candidate.id}
                    onSchedule={async (data) => { await scheduleInterview(data); }}
                    isPending={isSchedulingInterview}
                    onClose={() => { setShowInterviewForm(false); refetch(); }}
                  />
                </div>
              )}

              {!interviews?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  <Calendar className="h-10 w-10 text-[hsl(var(--text-muted))] mb-3" />
                  <h4 className="font-bold text-[hsl(var(--text-primary))]">No interviews scheduled</h4>
                  <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Schedule an interview to advance this candidate.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.map((iv) => (
                    <div key={iv.id} className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                            <Video className="h-4 w-4 text-[hsl(var(--primary))]" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[hsl(var(--text-primary))]">
                              {iv.roundType || 'Interview'} Round
                            </p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-[hsl(var(--text-muted))]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{new Date(iv.date).toLocaleDateString()}
                              </span>
                              {iv.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{iv.time}</span>}
                              {iv.duration && <span>{iv.duration} min</span>}
                              {iv.interviewer && <span>with {iv.interviewer}</span>}
                              {iv.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{iv.location}</span>}
                            </div>
                            {iv.meetingLink && (
                              <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-1 text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
                                <Video className="h-3 w-3" /> Join Meeting
                              </a>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={iv.status} />
                      </div>
                      {iv.feedback && (
                        <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))]">
                          <span className="font-semibold text-[hsl(var(--text-primary))]">Feedback: </span>
                          {iv.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
              <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-4">Application Timeline</h4>
              {!statusHistory?.length ? (
                <p className="text-sm text-[hsl(var(--text-secondary))]">No history available.</p>
              ) : (
                <div className="space-y-4">
                  {statusHistory.map((h) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1" />
                        <div className="w-px flex-1 bg-[hsl(var(--border))] mt-1" />
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {h.fromStatus && (
                            <>
                              <StatusBadge status={h.fromStatus} />
                              <span className="text-xs text-[hsl(var(--text-muted))]">→</span>
                            </>
                          )}
                          <StatusBadge status={h.toStatus} />
                        </div>
                        <p className="text-xs text-[hsl(var(--text-muted))] mt-1">
                          {new Date(h.createdAt).toLocaleString()}
                          {h.changedBy && ` · by ${h.changedBy}`}
                        </p>
                        {h.notes && <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 italic">"{h.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel — Actions */}
        <div className="space-y-4">
          {/* Current Status */}
          <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <h4 className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-3">Current Status</h4>
            <StatusBadge status={candidate.status} />
            <div className="mt-4 space-y-1.5 text-xs text-[hsl(var(--text-muted))]">
              <p>Applied: {new Date(candidate.appliedAt).toLocaleDateString()}</p>
              {candidate.hiredAt && <p className="text-[hsl(var(--success))]">Hired: {new Date(candidate.hiredAt).toLocaleDateString()}</p>}
              {candidate.joiningDate && <p>Joining: {new Date(candidate.joiningDate).toLocaleDateString()}</p>}
            </div>
          </div>

          {/* ATS Score */}
          <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <h4 className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-3">ATS Match</h4>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-4 flex items-center justify-center font-extrabold text-sm"
                style={{
                  borderColor: (candidate.atsScore || 0) >= 80 ? 'hsl(var(--success))' : (candidate.atsScore || 0) >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--danger))',
                  color: (candidate.atsScore || 0) >= 80 ? 'hsl(var(--success))' : (candidate.atsScore || 0) >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--danger))',
                }}>
                {Math.round(candidate.atsScore || 0)}%
              </div>
              <div>
                <p className="text-sm font-bold text-[hsl(var(--text-primary))]">
                  {(candidate.atsScore || 0) >= 80 ? 'Strong' : (candidate.atsScore || 0) >= 60 ? 'Moderate' : 'Weak'}
                </p>
                <p className="text-xs text-[hsl(var(--text-muted))]">match for role</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            <h4 className="text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wide mb-3">Update Status</h4>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.status}
                  onClick={() => setStatusAction(action)}
                  className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-left hover:opacity-90 transition-all cursor-pointer border"
                  style={{
                    backgroundColor: `${action.color}15`,
                    borderColor: `${action.color}30`,
                    color: action.color,
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Interview Button */}
          <button
            onClick={() => { setActiveTab('interviews'); setShowInterviewForm(true); }}
            className="w-full py-3 rounded-2xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[hsl(var(--primary)/0.1)] transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusAction && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setStatusAction(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-2xl space-y-4 animate-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Confirm: {statusAction.label}</h3>
                <button onClick={() => setStatusAction(null)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] cursor-pointer"><X className="h-4 w-4" /></button>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Notes (optional)</label>
                <textarea rows={3} value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add reason or note for this status change..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none" />
              </div>
              {statusAction.status === 'HIRED' && (
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Joining Date</label>
                  <input type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={() => setStatusAction(null)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleStatusUpdate} disabled={isUpdatingStatus}
                  className="px-5 py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: statusAction.color }}>
                  {isUpdatingStatus ? 'Updating…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CandidateDetailPage;
