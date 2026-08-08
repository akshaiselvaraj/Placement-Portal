import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewService, type InterviewQuestion } from '@/services/interview.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import {
  BookOpen,
  Search,
  Building2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export function ExamPreparationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Fetch approved exam prep data
  const { data, isLoading } = useQuery({
    queryKey: ['student-exam-prep', searchQuery, selectedCompanyId, selectedType, selectedDifficulty],
    queryFn: () =>
      interviewService.getExamPreparation({
        search: searchQuery || undefined,
        companyId: selectedCompanyId !== 'ALL' ? selectedCompanyId : undefined,
        questionType: selectedType !== 'ALL' ? selectedType : undefined,
        difficulty: selectedDifficulty !== 'ALL' ? selectedDifficulty : undefined,
      }),
  });

  const questions: InterviewQuestion[] = data?.questions || [];
  const companiesSummary = data?.companiesSummary || [];

  const handleNextPractice = () => {
    setShowAnswer(false);
    if (practiceIndex < questions.length - 1) {
      setPracticeIndex((prev) => prev + 1);
    }
  };

  const handlePrevPractice = () => {
    setShowAnswer(false);
    if (practiceIndex > 0) {
      setPracticeIndex((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-background border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> VERIFIED INTERVIEW REPOSITORY
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Exam Preparation</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Master real company interview rounds using verified questions and solutions contributed by previous successful candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIsPracticeMode(!isPracticeMode);
              setPracticeIndex(0);
              setShowAnswer(false);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              isPracticeMode
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            {isPracticeMode ? 'Switch to List View' : 'Start Practice Mode'}
          </button>
        </div>
      </div>

      {/* Companies Overview Grid */}
      {companiesSummary.length > 0 && !isPracticeMode && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Companies with Approved Interview Experiences
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companiesSummary.map((c: any) => (
              <div
                key={c.id}
                onClick={() => setSelectedCompanyId(selectedCompanyId === c.id ? 'ALL' : c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCompanyId === c.id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {c.logo ? (
                    <img src={c.logo} alt={c.name} className="h-10 w-10 rounded-lg object-contain bg-background p-1 border border-border" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">{c.totalApprovedQuestions} Verified Questions</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>{c.roles.length} Role(s)</span>
                  <span>{c.roundsCount} Round Types</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-card border border-border p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, topics..."
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Company Filter */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full py-2 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Companies</option>
              {companiesSummary.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Question Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Question Types</option>
              <option value="TECHNICAL">Technical</option>
              <option value="PROGRAMMING">Programming</option>
              <option value="APTITUDE">Aptitude</option>
              <option value="LOGICAL_REASONING">Logical Reasoning</option>
              <option value="SCENARIO_BASED">Scenario Based</option>
              <option value="HR">HR</option>
              <option value="BEHAVIORAL">Behavioral</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full py-2 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {questions.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No approved interview questions found"
          description="Approved questions will appear here once candidates submit their interview experiences and Placement Officers verify them."
        />
      ) : isPracticeMode ? (
        /* PRACTICE MODE VIEW */
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-md max-w-3xl mx-auto">
          {/* Practice Top Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                Question {practiceIndex + 1} of {questions.length}
              </span>
              <span>• {questions[practiceIndex]?.company?.name}</span>
              <span>• {questions[practiceIndex]?.roundName}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted border border-border">
                {questions[practiceIndex]?.questionType}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                questions[practiceIndex]?.difficulty === 'EASY'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : questions[practiceIndex]?.difficulty === 'HARD'
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-amber-500/10 text-amber-500'
              }`}>
                {questions[practiceIndex]?.difficulty}
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="space-y-4 py-2">
            <h3 className="text-xl font-bold text-foreground leading-relaxed">
              {questions[practiceIndex]?.question}
            </h3>

            {questions[practiceIndex]?.topic && (
              <div className="text-xs text-primary font-medium">
                Topic / Skill: <span className="bg-primary/10 px-2 py-0.5 rounded">{questions[practiceIndex]?.topic}</span>
              </div>
            )}
          </div>

          {/* Answer Toggle Section */}
          <div className="pt-4 border-t border-border space-y-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAnswer ? 'Hide Solution / Approach' : 'Show Solution / Approach'}
            </button>

            {showAnswer && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-sm text-foreground space-y-2 animate-in fade-in duration-200">
                <div className="font-semibold text-primary text-xs uppercase tracking-wider">Candidate Approach / Answer:</div>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                  {questions[practiceIndex]?.answer || 'No detailed solution text provided for this question.'}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <button
              onClick={handlePrevPractice}
              disabled={practiceIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <span className="text-xs text-muted-foreground font-medium">
              {questions[practiceIndex]?.contributor}
            </span>

            <button
              onClick={handleNextPractice}
              disabled={practiceIndex === questions.length - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Showing {questions.length} verified questions</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm hover:border-primary/40 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{q.company?.name}</span>
                    <span className="text-xs text-muted-foreground">• {q.jobRole}</span>
                    <span className="text-xs text-muted-foreground">• {q.roundName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted border border-border text-foreground">
                      {q.questionType}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
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
                  <h3 className="text-base font-semibold text-foreground leading-relaxed">{q.question}</h3>
                  {q.topic && (
                    <span className="inline-block mt-2 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                      Topic: {q.topic}
                    </span>
                  )}
                </div>

                {q.answer && (
                  <details className="group mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                      View Solution / Approach
                    </summary>
                    <div className="mt-2 p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {q.answer}
                    </div>
                  </details>
                )}

                <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>{q.contributor}</span>
                  <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
