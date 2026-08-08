import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, type InterviewQuestion } from '@/services/interview.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2,
  HelpCircle,
  User,
  AlertCircle,
  X,
} from 'lucide-react';

export function InterviewQuestionReviewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const selectedCompanyId = 'ALL';

  // Rejection Modal State
  const [rejectingQuestion, setRejectingQuestion] = useState<InterviewQuestion | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch Questions
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['placement-interview-questions', activeTab, searchQuery, selectedCompanyId],
    queryFn: () =>
      interviewService.getQuestionsForReview({
        status: activeTab,
        companyId: selectedCompanyId !== 'ALL' ? selectedCompanyId : undefined,
        search: searchQuery || undefined,
      }),
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: (questionId: string) => interviewService.approveQuestion(questionId),
    onSuccess: () => {
      toast.success('Question approved and published to Exam Preparation!');
      queryClient.invalidateQueries({ queryKey: ['placement-interview-questions'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve question');
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ questionId, reason }: { questionId: string; reason?: string }) =>
      interviewService.rejectQuestion(questionId, reason),
    onSuccess: () => {
      toast.success('Question rejected');
      queryClient.invalidateQueries({ queryKey: ['placement-interview-questions'] });
      setRejectingQuestion(null);
      setRejectionReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject question');
    },
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingQuestion) return;
    rejectMutation.mutate({ questionId: rejectingQuestion.id, reason: rejectionReason.trim() });
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            Interview Question Moderation Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and moderate student-submitted interview questions before publishing them to the canonical Exam Preparation bank.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('PENDING_REVIEW')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PENDING_REVIEW'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4" /> Pending Review
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'APPROVED'
              ? 'border-emerald-500 text-emerald-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" /> Approved
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'REJECTED'
              ? 'border-rose-500 text-rose-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <XCircle className="h-4 w-4" /> Rejected
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or student name..."
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={`No ${activeTab.toLowerCase().replace('_', ' ')} questions`}
          description="Submitted interview questions for this category will appear here for review."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span>{q.company?.name}</span>
                    <span className="text-muted-foreground">• {q.jobRole}</span>
                    <span className="text-muted-foreground">• {q.roundName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    <span>Submitted by: <strong>{q.student?.name}</strong> ({q.student?.rollNumber} • {q.student?.department})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-muted border border-border">
                    {q.questionType}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded ${
                    q.difficulty === 'EASY'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : q.difficulty === 'HARD'
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-base font-semibold text-foreground leading-relaxed">{q.question}</p>
                {q.topic && (
                  <span className="inline-block mt-2 text-xs text-primary font-medium bg-primary/10 px-2.5 py-0.5 rounded">
                    Topic: {q.topic}
                  </span>
                )}
              </div>

              {q.answer && (
                <div className="p-3.5 rounded-lg bg-muted/30 border border-border space-y-1">
                  <div className="text-xs font-semibold text-foreground">Candidate Approach / Solution:</div>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{q.answer}</p>
                </div>
              )}

              {q.rejectionReason && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Rejection Reason: {q.rejectionReason}</span>
                </div>
              )}

              {/* Action Buttons for Pending Questions */}
              {activeTab === 'PENDING_REVIEW' && (
                <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setRejectingQuestion(q);
                      setRejectionReason('');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => approveMutation.mutate(q.id)}
                    disabled={approveMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Publish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleConfirmReject} className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-rose-500 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> Reject Interview Question
              </h2>
              <button type="button" onClick={() => setRejectingQuestion(null)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Please specify why this question is being rejected so the student can revise it:
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Question text is duplicate, incomplete, or requires clearer phrasing."
                className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setRejectingQuestion(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 shadow-sm disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
