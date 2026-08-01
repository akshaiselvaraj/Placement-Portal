import { useState } from 'react';
import { useRecruiterInterviews } from '../hooks/useRecruiterData';
import { StatusBadge, LoadingSkeleton } from '@/components/common';
import type { UpdateInterviewPayload } from '../services/recruiter.service';
import {
  Calendar, Clock, Video, MapPin, Users, CheckCircle, XCircle,
  X, Star
} from 'lucide-react';

type Tab = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface FeedbackModalProps {
  interviewId: string;
  onSave: (id: string, data: UpdateInterviewPayload) => Promise<void>;
  isPending: boolean;
  onClose: () => void;
}

function FeedbackModal({ interviewId, onSave, isPending, onClose }: FeedbackModalProps) {
  const [result, setResult] = useState<'PENDING' | 'PASSED' | 'FAILED'>('PENDING');
  const [feedback, setFeedback] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    await onSave(interviewId, {
      status: 'COMPLETED',
      result,
      feedback,
      notes,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-2xl space-y-5 animate-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Record Interview Result</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-2 uppercase tracking-wide">Result</label>
            <div className="flex gap-2">
              {(['PENDING', 'PASSED', 'FAILED'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResult(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    result === r
                      ? r === 'PASSED'
                        ? 'bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]'
                        : r === 'FAILED'
                        ? 'bg-[hsl(var(--danger))] text-white border-[hsl(var(--danger))]'
                        : 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {r === 'PASSED' ? '✓ Passed' : r === 'FAILED' ? '✗ Failed' : '○ Pending'}
                </button>
              ))}
            </div>
          </div>

          {result === 'PASSED' && (
            <div className="p-3 rounded-lg bg-[hsl(var(--success-light))] border border-[hsl(var(--success)/0.2)] text-sm text-[hsl(var(--success))] flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Candidate will be automatically moved to SELECTED status.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Feedback</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Assessment of the candidate's performance..."
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private notes for the team..."
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'Saving…' : 'Save Result'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function InterviewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('SCHEDULED');
  const [feedbackInterviewId, setFeedbackInterviewId] = useState<string | null>(null);

  const { interviews, isLoadingInterviews, updateInterview, isUpdating } = useRecruiterInterviews();

  const filtered = interviews.filter((iv) => {
    if (activeTab === 'SCHEDULED') return iv.status === 'SCHEDULED';
    if (activeTab === 'COMPLETED') return iv.status === 'COMPLETED';
    return iv.status === 'CANCELLED';
  });

  const counts = {
    SCHEDULED: interviews.filter((iv) => iv.status === 'SCHEDULED').length,
    COMPLETED: interviews.filter((iv) => iv.status === 'COMPLETED').length,
    CANCELLED: interviews.filter((iv) => iv.status === 'CANCELLED').length,
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this interview?')) {
      await updateInterview({ id, data: { status: 'CANCELLED' } });
    }
  };

  const handleSaveResult = async (id: string, data: UpdateInterviewPayload) => {
    await updateInterview({ id, data });
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'SCHEDULED', label: 'Upcoming' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">Interviews</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Manage scheduled, completed, and cancelled interview sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] w-full sm:w-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] shadow-xs'
                : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-secondary))]'
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === key ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))] text-[hsl(var(--text-muted))]'
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoadingInterviews ? (
        <LoadingSkeleton count={4} height="h-28" />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
          <Calendar className="h-12 w-12 text-[hsl(var(--text-muted))] mb-4" />
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">
            No {activeTab.toLowerCase()} interviews
          </h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
            {activeTab === 'SCHEDULED'
              ? 'No upcoming interviews. Schedule interviews from the Applicants module.'
              : `No ${activeTab.toLowerCase()} interview records found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((iv) => {
            const candidate = iv.application?.student?.user;
            const job = iv.application?.job;
            const resultColor = iv.result === 'PASSED' ? 'hsl(var(--success))' : iv.result === 'FAILED' ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))';

            return (
              <div
                key={iv.id}
                className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] font-bold shrink-0">
                      {candidate?.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[hsl(var(--text-primary))]">{candidate?.name || 'Unknown'}</h4>
                        <span className="text-xs text-[hsl(var(--text-muted))]">•</span>
                        <span className="text-xs font-medium text-[hsl(var(--text-secondary))]">{job?.title}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[hsl(var(--text-muted))]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(iv.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {iv.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{iv.time}</span>}
                        {iv.duration && <span>{iv.duration} min</span>}
                        {iv.roundType && (
                          <span className="px-2 py-0.5 rounded-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] font-semibold">
                            {iv.roundType}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--text-muted))]">
                        {iv.interviewer && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {iv.interviewer}
                          </span>
                        )}
                        {iv.meetingLink && (
                          <a
                            href={iv.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[hsl(var(--primary))] font-semibold hover:underline"
                          >
                            <Video className="h-3 w-3" /> Join Meeting
                          </a>
                        )}
                        {iv.location && iv.location !== 'Online' && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {iv.location}
                          </span>
                        )}
                      </div>

                      {iv.status === 'COMPLETED' && iv.result && iv.result !== 'PENDING' && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-semibold" style={{ color: resultColor }}>
                            {iv.result === 'PASSED' ? '✓ Passed' : '✗ Failed'}
                          </span>
                          {iv.feedback && (
                            <span className="text-xs text-[hsl(var(--text-secondary))] line-clamp-1 italic">
                              "{iv.feedback}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={iv.status} />
                    {iv.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => setFeedbackInterviewId(iv.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-white text-xs font-semibold hover:opacity-90 cursor-pointer"
                        >
                          <Star className="h-3 w-3" />
                          Record Result
                        </button>
                        <button
                          onClick={() => handleCancel(iv.id)}
                          className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                          title="Cancel Interview"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackInterviewId && (
        <FeedbackModal
          interviewId={feedbackInterviewId}
          onSave={handleSaveResult}
          isPending={isUpdating}
          onClose={() => setFeedbackInterviewId(null)}
        />
      )}
    </div>
  );
}

export default InterviewsPage;
