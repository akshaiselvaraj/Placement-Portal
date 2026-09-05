import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePS, usePSLevelQuestions } from '../hooks';
import {
  Award, Search, ChevronRight, CheckCircle2, Circle, Clock,
  ArrowLeft, Eye, EyeOff, ShieldAlert, Loader2, BookOpen, AlertTriangle
} from 'lucide-react';
import { LoadingSkeleton, EmptyState } from '@/components/common';

export function PSLevelQuestionsPage() {
  const { levelId = '1' } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Track answer reveals for each question by ID
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Query student PS details to check connection and derive level states
  const { data: psData, isLoading: isPsLoading } = usePS();

  // Query level questions
  const { data: questionsData, isLoading: isQuestionsLoading, error, refetch, isRefetching } = usePSLevelQuestions(levelId);

  const toggleReveal = (qId: string) => {
    setRevealedAnswers(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (isPsLoading) {
    return (
      <div className="p-8 space-y-6">
        <LoadingSkeleton count={1} height="h-8" className="w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <LoadingSkeleton count={1} height="h-64" className="col-span-1" />
          <LoadingSkeleton count={3} height="h-32" className="col-span-3" />
        </div>
      </div>
    );
  }

  // Handle PS unconnected state
  if (!psData || !psData.psConnected) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-8 text-center space-y-5 shadow-xs">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-full w-fit mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-[hsl(var(--text-primary))]">PS Account Disconnected</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed max-w-md mx-auto">
              Connect your Personalized Skill (PS) account on the dashboard to access practice questions.
            </p>
          </div>
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[hsl(var(--primary))] text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Resolve levels list metadata
  const clearanceText = String(psData.levelClearance || '0');
  const clearanceNum = parseInt(clearanceText.replace(/\D/g, '')) || 0;

  const sidebarLevels = [1, 2, 3, 4, 5].map((lvl) => {
    let status: 'Completed' | 'In Progress' | 'Not Started' = 'Not Started';
    if (lvl <= clearanceNum) {
      status = 'Completed';
    } else if (lvl === clearanceNum + 1) {
      status = 'In Progress';
    }
    return {
      id: String(lvl),
      name: `Level ${lvl}`,
      status,
    };
  });

  // Check specific error messages or custom error structures
  const errorMsg = error ? (error as any).message || String(error) : '';
  const isSessionExpired = errorMsg.includes('SESSION_EXPIRED') || errorMsg.includes('expired') || errorMsg.includes('401');
  const isRegistrationRequired = errorMsg.includes('REGISTRATION_REQUIRED') || errorMsg.includes('register') || errorMsg.includes('403') || (questionsData && questionsData.available === false);
  const isServerUnavailable = errorMsg.includes('TIMEOUT') || errorMsg.includes('500') || errorMsg.includes('unavailable') || errorMsg.includes('failed') || errorMsg.includes('Failed');

  // Filtered Questions
  const questionsList = questionsData?.questions || [];
  const filteredQuestions = questionsList.filter((q: any) =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] rounded-xl text-[hsl(var(--text-secondary))] cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Award className="h-6 w-6 text-purple-500" />
              PS Level {levelId} Practice Questions
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              Review and study practice items for Personalized Skill Levels.
            </p>
          </div>
        </div>
        
        {questionsData?.available !== false && !isQuestionsLoading && !error && (
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isRefetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
            Refresh List
          </button>
        )}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Switcher Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-4 space-y-3">
            <h3 className="font-extrabold text-xs text-[hsl(var(--text-primary))] uppercase tracking-wider px-1">
              Select Level
            </h3>
            <div className="space-y-1">
              {sidebarLevels.map((lvl) => {
                const isActive = lvl.id === levelId;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setSearchQuery('');
                      setRevealedAnswers({});
                      navigate(`/student/ps/levels/${lvl.id}/questions`);
                    }}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[hsl(var(--primary))] text-white border-transparent shadow-xs'
                        : 'bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {lvl.status === 'Completed' ? (
                        <CheckCircle2 className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                      ) : lvl.status === 'In Progress' ? (
                        <Clock className={`h-4 w-4 ${isActive ? 'text-white' : 'text-amber-500 animate-spin'}`} />
                      ) : (
                        <Circle className="h-4 w-4 opacity-50" />
                      )}
                      <span>{lvl.name}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Questions Workspace */}
        <div className="col-span-1 lg:col-span-3 space-y-5">
          
          {/* SEARCH BAR (Only visible if questions are fetched successfully) */}
          {!isQuestionsLoading && !error && questionsData?.available !== false && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by key phrases or words..."
                className="w-full pl-10 pr-4 py-2.5 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] shadow-xs"
              />
            </div>
          )}

          {/* LOADING STATE */}
          {isQuestionsLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton count={3} height="h-40" />
            </div>
          ) : (
            <>
              {/* SESSION EXPIRED */}
              {isSessionExpired && (
                <div className="p-6 text-center border border-amber-250 bg-amber-50/50 rounded-2xl space-y-4">
                  <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-amber-850">PS Session Expired</h3>
                    <p className="text-xs text-amber-700 leading-relaxed max-w-md mx-auto">
                      Your PS session has expired. Please login to the PS Portal again to renew your credentials.
                    </p>
                  </div>
                  <a
                    href="https://ps.bitsathy.ac.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Open PS Portal <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* REGISTRATION REQUIRED */}
              {isRegistrationRequired && (
                <div className="p-6 text-center border border-purple-250 bg-purple-50/40 rounded-2xl space-y-4">
                  <BookOpen className="h-10 w-10 text-purple-500 mx-auto" />
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-purple-850">PS Exam Registration Required</h3>
                    <p className="text-xs text-purple-700 leading-relaxed max-w-md mx-auto">
                      Practice questions are available after registering for this PS level. Please complete the required PS registration on the official portal and try again.
                    </p>
                  </div>
                  <a
                    href="https://ps.bitsathy.ac.in"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Register on PS Portal <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {/* SERVER UNAVAILABLE */}
              {isServerUnavailable && !isSessionExpired && !isRegistrationRequired && (
                <div className="p-6 text-center border border-rose-250 bg-rose-50/40 rounded-2xl space-y-4">
                  <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm text-rose-850">Service Temporarily Unavailable</h3>
                    <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
                      Unable to load practice questions right now. Please try again later.
                    </p>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* EMPTY QUESTIONS STATE */}
              {!error && questionsData?.available !== false && questionsList.length === 0 && (
                <EmptyState
                  title="No questions available"
                  message="No practice questions are currently available for this level."
                />
              )}

              {/* FILTERED QUESTIONS RESULTS EMPTY */}
              {!error && questionsData?.available !== false && questionsList.length > 0 && filteredQuestions.length === 0 && (
                <EmptyState
                  title="No search results found"
                  message="Try adjusting your keyword terms or search queries."
                />
              )}

              {/* QUESTIONS LIST RENDER */}
              {!error && questionsData?.available !== false && filteredQuestions.length > 0 && (
                <div className="space-y-4">
                  {filteredQuestions.map((q: any, qIdx: number) => {
                    const isRevealed = revealedAnswers[q.id] || false;
                    
                    return (
                      <div
                        key={q.id}
                        className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-xs transition-shadow"
                      >
                        <div className="space-y-4">
                          {/* Question header */}
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-[10px] font-black text-purple-650 bg-purple-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Question {qIdx + 1}
                            </span>
                            <span className="text-[9px] font-bold text-[hsl(var(--text-muted))]">
                              ID: {q.id}
                            </span>
                          </div>

                          {/* Question text */}
                          <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))] leading-relaxed">
                            {q.question}
                          </h4>

                          {/* MCQ Options list */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {q.options.map((opt: any) => {
                              const isCorrectOption = opt.key === q.correctAnswer;
                              return (
                                <div
                                  key={opt.key}
                                  className={`p-3 rounded-xl border text-xs flex gap-2.5 items-center transition-all ${
                                    isRevealed && isCorrectOption
                                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800'
                                      : 'bg-[hsl(var(--background))] border-[hsl(var(--border))/0.7] text-[hsl(var(--text-secondary))]'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                                    isRevealed && isCorrectOption
                                      ? 'bg-emerald-500 border-transparent text-white'
                                      : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--text-muted))]'
                                  }`}>
                                    {opt.key}
                                  </span>
                                  <span className="font-semibold">{opt.text}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Actions drawer panel */}
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[hsl(var(--border))]">
                          <button
                            onClick={() => toggleReveal(q.id)}
                            className={`self-start py-1.5 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-colors ${
                              isRevealed
                                ? 'bg-amber-50 text-amber-700 border-amber-250 hover:bg-amber-100'
                                : 'bg-[hsl(var(--primary))] hover:opacity-90 text-white border-transparent'
                            }`}
                          >
                            {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {isRevealed ? 'Hide Answer' : 'Show Answer'}
                          </button>

                          {/* Reveal Answer box content */}
                          {isRevealed && (
                            <div className="p-4 bg-emerald-50/30 border border-emerald-200/50 rounded-xl space-y-2 animate-in">
                              <p className="text-xs text-emerald-800 font-extrabold flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                Correct Option: {q.correctAnswer} (
                                {q.options.find((o: any) => o.key === q.correctAnswer)?.text || ''}
                                )
                              </p>
                              {q.explanation && (
                                <div className="text-xs leading-relaxed text-[hsl(var(--text-secondary))] border-t border-emerald-100 pt-2 font-medium">
                                  <span className="font-bold text-[hsl(var(--text-primary))] block mb-0.5">Explanation:</span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default PSLevelQuestionsPage;
