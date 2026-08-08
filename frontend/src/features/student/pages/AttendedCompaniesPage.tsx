import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, type AttendedCompany, type StudentRound, type InterviewQuestion } from '@/services/interview.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  Building2,
  CheckCircle2,
  Lock,
  Unlock,
  Plus,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Send,
  Trash2,
  Edit3,
  X,
  AlertCircle,
} from 'lucide-react';

export function AttendedCompaniesPage() {
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<AttendedCompany | null>(null);
  const [selectedRound, setSelectedRound] = useState<StudentRound | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Form State for Adding/Editing Question
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<InterviewQuestion['questionType']>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<InterviewQuestion['difficulty']>('MEDIUM');
  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Query: Attended Companies
  const { data: attendedCompanies = [], isLoading } = useQuery({
    queryKey: ['student-attended-companies'],
    queryFn: () => interviewService.getAttendedCompanies(),
  });

  // Mutation: Submit Question
  const addQuestionsMutation = useMutation({
    mutationFn: ({ studentRoundId, questions }: { studentRoundId: string; questions: any[] }) =>
      interviewService.addQuestionsToRound(studentRoundId, questions),
    onSuccess: () => {
      toast.success('Interview question submitted for officer review!');
      queryClient.invalidateQueries({ queryKey: ['student-attended-companies'] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit question');
    },
  });

  // Mutation: Delete Question
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => interviewService.deleteQuestion(questionId),
    onSuccess: () => {
      toast.success('Question deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['student-attended-companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete question');
    },
  });

  const resetForm = () => {
    setQuestionText('');
    setQuestionType('TECHNICAL');
    setDifficulty('MEDIUM');
    setTopic('');
    setAnswer('');
    setEditingQuestionId(null);
  };

  const handleOpenQuestionsModal = (app: AttendedCompany, round: StudentRound) => {
    setSelectedApp(app);
    setSelectedRound(round);
    resetForm();
    setIsQuestionModalOpen(true);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRound) return;
    if (!questionText.trim() || questionText.trim().length < 5) {
      toast.error('Question text must be at least 5 characters long.');
      return;
    }

    addQuestionsMutation.mutate({
      studentRoundId: selectedRound.id,
      questions: [
        {
          question: questionText.trim(),
          questionType,
          difficulty,
          topic: topic.trim() || undefined,
          answer: answer.trim() || undefined,
          status: 'PENDING_REVIEW',
        },
      ],
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HIRED':
      case 'SELECTED':
      case 'PASSED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{status}</span>;
      case 'INTERVIEWING':
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">{status}</span>;
      case 'SHORTLISTED':
      case 'SCHEDULED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">{status}</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  const getQuestionStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-emerald-500/10 text-emerald-500">Approved</span>;
      case 'PENDING_REVIEW':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-500/10 text-amber-400">Pending Review</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-rose-500/10 text-rose-400">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-500/10 text-slate-400">Draft</span>;
    }
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
            <Building2 className="h-7 w-7 text-primary" />
            Attended Companies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your company interview rounds and contribute verified interview questions for officer-unlocked rounds.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {attendedCompanies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No attended interview experiences yet"
          description="Your attended companies will appear here automatically based on your placement applications and interview round progress."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {attendedCompanies.map((app) => (
            <div
              key={app.applicationId}
              className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Card Top Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                  {app.company.logo ? (
                    <img
                      src={app.company.logo}
                      alt={app.company.name}
                      className="h-12 w-12 rounded-lg object-contain bg-background p-1 border border-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {app.company.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{app.jobRole}</h2>
                    <p className="text-sm font-medium text-muted-foreground">{app.company.name} • {app.company.industry || 'Technology'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Application Status</div>
                    {getStatusBadge(app.applicationStatus)}
                  </div>
                </div>
              </div>

              {/* Progress & Quick Stats */}
              <div className="py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-muted/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Total Rounds</div>
                  <div className="text-lg font-bold text-foreground">{app.totalRounds} Rounds</div>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Completed Rounds</div>
                  <div className="text-lg font-bold text-emerald-500">{app.completedRoundsCount} Completed</div>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Contribution Access</div>
                  <div className="text-lg font-bold text-blue-500">{app.unlockedRoundsCount} Unlocked</div>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground">Applied On</div>
                  <div className="text-base font-semibold text-foreground">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Interview Rounds List */}
              <div className="mt-2 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Interview Rounds
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {app.rounds.map((round) => (
                    <div
                      key={round.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all ${
                        round.isUnlocked
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                            Round {round.roundOrder}
                          </span>
                          <span className="font-semibold text-foreground">{round.roundName}</span>
                          {round.status === 'COMPLETED' || round.status === 'PASSED' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{round.description || 'Standard evaluation round'}</p>
                      </div>

                      <div className="mt-3 sm:mt-0 flex items-center gap-3 justify-between sm:justify-end">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {round.isUnlocked ? (
                            <span className="flex items-center gap-1 text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              <Unlock className="h-3.5 w-3.5" /> Access Unlocked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
                              <Lock className="h-3.5 w-3.5" /> Locked by Officer
                            </span>
                          )}
                        </div>

                        {round.isUnlocked ? (
                          <button
                            onClick={() => handleOpenQuestionsModal(app, round)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {round.questionsAddedCount > 0 ? `Questions (${round.questionsAddedCount})` : 'Add Questions'}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                          >
                            <Lock className="h-3.5 w-3.5" /> Locked
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / View Questions Modal */}
      {isQuestionModalOpen && selectedApp && selectedRound && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    UNLOCKED ROUND
                  </span>
                  <h2 className="text-lg font-bold text-foreground">{selectedRound.roundName}</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedApp.company.name} • {selectedApp.jobRole}
                </p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Existing Submitted Questions List */}
              {selectedRound.questions && selectedRound.questions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Questions Contributed by You ({selectedRound.questions.length})
                  </h3>

                  <div className="space-y-2">
                    {selectedRound.questions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">{q.question}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {getQuestionStatusBadge(q.status)}
                            {q.status !== 'APPROVED' && (
                              <button
                                onClick={() => deleteQuestionMutation.mutate(q.id)}
                                className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                                title="Delete Question"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded bg-muted border border-border font-medium">
                            {q.questionType}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-muted border border-border font-medium">
                            {q.difficulty}
                          </span>
                          {q.topic && <span className="text-primary">Topic: {q.topic}</span>}
                        </div>

                        {q.answer && (
                          <div className="text-xs text-muted-foreground bg-background p-2 rounded border border-border mt-1">
                            <span className="font-semibold text-foreground">Your Solution / Approach:</span> {q.answer}
                          </div>
                        )}

                        {q.rejectionReason && (
                          <div className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Rejection Reason: {q.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Question Form */}
              <form onSubmit={handleSubmitQuestion} className="space-y-4 pt-2 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-primary" />
                  Add New Interview Question
                </h3>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Question Text <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. What is the difference between TCP and UDP? Explain with real-world use cases."
                    className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Question Category
                    </label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value as any)}
                      className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="TECHNICAL">Technical</option>
                      <option value="PROGRAMMING">Programming / Coding</option>
                      <option value="APTITUDE">Aptitude</option>
                      <option value="LOGICAL_REASONING">Logical Reasoning</option>
                      <option value="SCENARIO_BASED">Scenario Based</option>
                      <option value="HR">HR</option>
                      <option value="BEHAVIORAL">Behavioral</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Topic / Key Skill (Optional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Computer Networks, DSA, SQL, System Design"
                    className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Your Answer / Approach (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Share how you answered this question during the interview..."
                    className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={addQuestionsMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {addQuestionsMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
