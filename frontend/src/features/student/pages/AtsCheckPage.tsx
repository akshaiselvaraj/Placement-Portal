import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudentProfile } from '../hooks/useStudentProfile';
import { usePublicJobs, useEligibilityCheck } from '@/features/jobs/hooks/useJobs';
import { LoadingSkeleton, StatusBadge } from '@/components/common';
import { 
  Award, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ClipboardList, 
  Zap, 
  BookOpen, 
  Cpu, 
  Sparkles, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export function AtsCheckPage() {
  const [activeTab, setActiveTab] = useState<'job' | 'custom' | 'ai'>('job');
  const { student, isLoading: isProfileLoading } = useStudentProfile();
  const { data: jobs, isLoading: isJobsLoading } = usePublicJobs();
  
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const { data: eligibility, isLoading: isEligibilityLoading } = useEligibilityCheck(selectedJobId);

  // Custom analysis state
  const [customKeywords, setCustomKeywords] = useState('');
  const [customText, setCustomText] = useState('');
  const [customResult, setCustomResult] = useState<{
    score: number;
    matched: string[];
    missing: string[];
    density: number;
  } | null>(null);

  // AI plagiarism state
  const [aiText, setAiText] = useState('');
  const [aiResult, setAiResult] = useState<{
    score: number;
    flaggedPhrases: string[];
    explanation: string;
  } | null>(null);

  const handleCustomScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || (!customKeywords && !customText)) return;

    const keywords = customKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const studentSkills = (student.skills || []).map((s: any) => s.name.toLowerCase().trim());
    
    // Normalize keywords and find matches
    const matched: string[] = [];
    const missing: string[] = [];

    keywords.forEach(kw => {
      const normKw = kw.toLowerCase().trim();
      const isMatched = studentSkills.some(sk => sk === normKw || sk.includes(normKw) || normKw.includes(sk));
      if (isMatched) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    // Substring matching in custom text
    let textScoreBonus = 0;
    let keywordDensity = 0;
    if (customText) {
      const words = customText.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
      const textLower = customText.toLowerCase();
      
      // Calculate how many of student's skills appear in the Job Description
      let foundSkillsCount = 0;
      student.skills?.forEach((sk: any) => {
        const skLower = sk.name.toLowerCase();
        if (textLower.includes(skLower)) {
          foundSkillsCount++;
        }
      });

      if (student.skills && student.skills.length > 0) {
        textScoreBonus = Math.round((foundSkillsCount / student.skills.length) * 20); // up to 20% bonus
      }

      // Keyword density estimation
      const totalWords = words.length || 1;
      let matchedWordCount = 0;
      keywords.forEach(kw => {
        const matches = textLower.match(new RegExp(kw.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'));
        if (matches) matchedWordCount += matches.length;
      });
      keywordDensity = Math.round((matchedWordCount / totalWords) * 1000) / 10;
    }

    let baseScore = keywords.length > 0 ? (matched.length / keywords.length) * 80 : 50;
    const finalScore = Math.min(100, Math.round(baseScore + textScoreBonus));

    setCustomResult({
      score: finalScore,
      matched,
      missing,
      density: keywordDensity
    });
  };

  const handleResetCustom = () => {
    setCustomKeywords('');
    setCustomText('');
    setCustomResult(null);
  };

  const handleAiScan = (e: React.FormEvent, source: 'profile' | 'pasted') => {
    e.preventDefault();
    if (!student) return;

    let textToAnalyze = '';
    if (source === 'profile') {
      textToAnalyze += student.bio || '';
      student.projects?.forEach((p: any) => {
        textToAnalyze += ' ' + (p.description || '');
      });
    } else {
      textToAnalyze = aiText;
    }

    if (!textToAnalyze.trim()) {
      alert('No text content found to scan.');
      return;
    }

    const aiBuzzwords = [
      'delve', 'testament', 'spearheaded', 'synergy', 'innovative',
      'transformative', 'revolutionary', 'leverage', 'robust', 'meticulously',
      'ecosystem', 'fostered', 'streamlined', 'seamlessly', 'cutting-edge',
      'rapidly evolving', 'not only', 'but also', 'pioneered', 'impactful',
      'utilized', 'harnessed', 'furthermore', 'moreover', 'in conclusion',
      'designed to', 'demystify', 'elevate', 'groundbreaking', 'vibrant'
    ];

    const textLower = textToAnalyze.toLowerCase();
    const flaggedPhrases: string[] = [];

    aiBuzzwords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches && matches.length > 0) {
        flaggedPhrases.push(word);
      }
    });

    if (textLower.includes('not only') && textLower.includes('but also')) {
      if (!flaggedPhrases.includes('not only... but also')) {
        flaggedPhrases.push('not only... but also');
      }
    }

    const wordCount = textToAnalyze.split(/\s+/).filter(w => w.length > 0).length || 1;
    const uniqueFlaggedCount = flaggedPhrases.length;

    let densityFactor = 15;
    if (wordCount > 150) {
      densityFactor = 8;
    } else if (wordCount > 80) {
      densityFactor = 11;
    }

    let score = Math.min(100, Math.round(uniqueFlaggedCount * densityFactor));

    const verbToVerbMatches = textLower.match(/\b[a-z]+ed\s+to\s+[a-z]+/g);
    if (verbToVerbMatches && verbToVerbMatches.length > 2) {
      score = Math.min(100, score + 10);
      if (!flaggedPhrases.includes('repetitive "verb-ed to..." structure')) {
        flaggedPhrases.push('repetitive "verb-ed to..." structure');
      }
    }

    let explanation = 'Text appears highly human-written with organic structure and minimal AI jargon.';
    if (score >= 70) {
      explanation = 'Highly likely to be AI-generated (e.g. ChatGPT). It contains a high density of common AI transitional keywords and robotic resume phrasing.';
    } else if (score >= 35) {
      explanation = 'Possibly contains mixed AI and human-written content. Try rephrasing typical corporate jargon and adding specific project metrics.';
    }

    setAiResult({
      score,
      flaggedPhrases,
      explanation
    });
  };

  const handleResetAi = () => {
    setAiText('');
    setAiResult(null);
  };

  const isLoading = isProfileLoading || isJobsLoading;

  if (isLoading) {
    return <LoadingSkeleton count={3} height="h-40" className="mt-8 animate-in" />;
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] mt-8">
        <p className="text-sm text-[hsl(var(--text-secondary))]">Failed to load student profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in text-left">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          ATS Profile Checker
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Scan your profile and resume data against current hiring needs to maximize eligibility and match rates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border))]">
        <button
          onClick={() => setActiveTab('job')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'job'
              ? 'border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job-Specific Match Analyzer
          </span>
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'custom'
              ? 'border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Custom Resume Keyword Scanner
          </span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            AI Plagiarism Checker
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'job' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[hsl(var(--primary))]" />
                Select Active Job
              </h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                Compare your current skills, qualifications, and CGPA with real-time requirements of open job postings.
              </p>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2 uppercase tracking-wide">
                  Available Job Postings
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer font-bold"
                >
                  <option value="">-- Choose a Job Posting --</option>
                  {jobs?.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} at {job.company?.name} ({job.location})
                    </option>
                  ))}
                </select>
              </div>

              {selectedJobId && (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-650 dark:text-purple-400 text-xs font-bold">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    How to boost your match rate:
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed font-medium">
                    The ATS parses your technical skills, educational degrees, CGPA threshold, projects, and certifications. Check the analysis details and click the update button if you lack key required credentials.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedJobId ? (
              <div className="p-12 text-center border border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] flex flex-col items-center justify-center">
                <Award className="h-10 w-10 text-[hsl(var(--text-muted))] mb-3.5" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">No job selected</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
                  Select one of the open job postings from the left dropdown menu to run an instant rule-based ATS analysis on your student profile.
                </p>
              </div>
            ) : isEligibilityLoading ? (
              <LoadingSkeleton count={2} height="h-32" />
            ) : eligibility ? (
              <div className="space-y-6">
                {/* Score Summary Card */}
                <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col md:flex-row items-center gap-8">
                  {/* Radial progress ring */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-[hsl(var(--muted))] fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-purple-600 fill-none transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - (eligibility.atsScore || 0) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-[hsl(var(--text-primary))]">{eligibility.atsScore}%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[hsl(var(--text-secondary))]">Match Score</span>
                    </div>
                  </div>

                  {/* Details column */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[hsl(var(--text-secondary))] font-bold">Eligibility Check:</span>
                      <StatusBadge status={eligibility.eligible ? 'VERIFIED' : 'PENDING'} />
                    </div>

                    <h3 className="text-lg font-extrabold text-[hsl(var(--text-primary))]">
                      Overall Assessment
                    </h3>

                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                      Your current profile is evaluated as <span className="font-bold text-[hsl(var(--text-primary))]">{eligibility.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}</span>.
                      {eligibility.eligible 
                        ? ' You meet the academic prerequisites, and your profile verification is complete. You can submit your application immediately.'
                        : ' You do not meet one or more criteria (e.g. CGPA, Department, or profile verification is pending). Please check details below.'
                      }
                    </p>

                    <div className="flex flex-wrap gap-4 pt-1.5 text-xs">
                      <div>
                        Your CGPA: <strong className="text-[hsl(var(--text-primary))]">{eligibility.studentCgpa ?? 'N/A'}</strong> (Required: <strong>{eligibility.requiredCgpa}</strong>)
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] self-center" />
                      {eligibility.requiredActivityPoints !== undefined && eligibility.requiredActivityPoints > 0 && (
                        <>
                          <div>
                            Activity Points: <strong className="text-[hsl(var(--text-primary))]">{eligibility.studentActivityPoints ?? 0}</strong> (Required: <strong>{eligibility.requiredActivityPoints}</strong>)
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] self-center" />
                        </>
                      )}
                      {eligibility.requiredPsLevel !== undefined && eligibility.requiredPsLevel !== 'None' && (
                        <>
                          <div>
                            PS Level: <strong className="text-[hsl(var(--text-primary))]">{eligibility.studentPsLevel || 'None'}</strong> (Required: <strong>{eligibility.requiredPsLevel}</strong>)
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] self-center" />
                        </>
                      )}
                      {eligibility.required10thMarks !== undefined && eligibility.required10thMarks > 0 && (
                        <>
                          <div>
                            10th Marks: <strong className="text-[hsl(var(--text-primary))]">{eligibility.student10thMarks ?? 0}%</strong> (Required: <strong>{eligibility.required10thMarks}%</strong>)
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] self-center" />
                        </>
                      )}
                      {eligibility.required12thMarks !== undefined && eligibility.required12thMarks > 0 && (
                        <>
                          <div>
                            12th Marks: <strong className="text-[hsl(var(--text-primary))]">{eligibility.student12thMarks ?? 0}%</strong> (Required: <strong>{eligibility.required12thMarks}%</strong>)
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--border))] self-center" />
                        </>
                      )}
                      <div>
                        Profile: <strong className="text-[hsl(var(--text-primary))]">{eligibility.profileVerified ? 'Verified' : 'Unverified'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skill match analysis */}
                  <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
                    <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <Zap className="h-4.5 w-4.5 text-amber-500" />
                      Skill Alignment
                    </h4>

                    {eligibility.atsBreakdown && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[hsl(var(--text-secondary))]">Matching skills</span>
                            <span className="text-emerald-500">
                              {eligibility.atsBreakdown.matchedSkills?.length || 0} matched
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {eligibility.atsBreakdown.matchedSkills?.length > 0 ? (
                              eligibility.atsBreakdown.matchedSkills.map((sk: string) => (
                                <span key={sk} className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                  ✓ {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[hsl(var(--text-muted))]">No matching required skills found.</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[hsl(var(--text-secondary))]">Missing required skills</span>
                            <span className="text-rose-500">
                              {eligibility.atsBreakdown.missingSkills?.length || 0} missing
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {eligibility.atsBreakdown.missingSkills?.length > 0 ? (
                              eligibility.atsBreakdown.missingSkills.map((sk: string) => (
                                <span key={sk} className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                                  ✗ {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-emerald-500 font-bold">Excellent! You possess all required skills.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
                    <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                      <BookOpen className="h-4.5 w-4.5 text-purple-500" />
                      ATS Suggestions
                    </h4>

                    {eligibility.atsBreakdown?.explanations && (
                      <ul className="space-y-2.5 text-xs text-[hsl(var(--text-secondary))] font-medium">
                        {eligibility.atsBreakdown.explanations.map((exp: string, idx: number) => {
                          const isWarning = exp.includes('below') || exp.includes('not in') || exp.includes('Missing') || exp.includes('not provided');
                          return (
                            <li key={idx} className="flex items-start gap-2">
                              {isWarning ? (
                                <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                              <span className={isWarning ? 'text-rose-500/90 dark:text-rose-400/90 font-semibold' : 'text-[hsl(var(--text-secondary))]'}>
                                {exp}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="pt-2">
                      <Link
                        to="/student/profile"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/10 cursor-pointer"
                      >
                        Go to Profile Builder
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : activeTab === 'custom' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6 text-left">
            <form onSubmit={handleCustomScan} className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-500 animate-pulse" />
                Keyword Analyzer
              </h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                Paste required job skills and descriptions below to test how well your current student profile aligns with custom targets.
              </p>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2 uppercase tracking-wide">
                  Target Required Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, Python, PostgreSQL, AWS"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2 uppercase tracking-wide">
                  Paste Full Job Description Text (Optional)
                </label>
                <textarea
                  placeholder="Paste the target Job Description to analyze keyword density and cross-reference your skills..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={!customKeywords && !customText}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-605 hover:bg-indigo-700 disabled:opacity-45 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  Scan Resume Data
                </button>
                {customResult && (
                  <button
                    type="button"
                    onClick={handleResetCustom}
                    className="p-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {!customResult ? (
              <div className="p-12 text-center border border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] flex flex-col items-center justify-center">
                <Sparkles className="h-10 w-10 text-[hsl(var(--text-muted))] mb-3.5" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Custom scan ready</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
                  Enter target keywords or paste a job description text in the left panel, and click "Scan Resume Data" to run keyword checks.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Custom Score Card */}
                <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col md:flex-row items-center gap-8">
                  {/* Radial progress ring */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-[hsl(var(--muted))] fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-indigo-500 fill-none transition-all duration-1000 ease-out"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - (customResult.score || 0) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-[hsl(var(--text-primary))]">{customResult.score}%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[hsl(var(--text-secondary))]">Match Score</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 flex-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 uppercase tracking-wide">
                      Simulation Complete
                    </span>

                    <h3 className="text-lg font-extrabold text-[hsl(var(--text-primary))]">
                      Custom Scanning Report
                    </h3>

                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                      Based on keyword analysis of your current profile skills, we calculated a matching score of <span className="font-bold text-[hsl(var(--text-primary))]">{customResult.score}%</span>. 
                      {customResult.density > 0 && ` Technical keyword density inside the job text is estimated at ${customResult.density}%.`}
                    </p>

                    <div className="pt-1.5 flex gap-4 text-xs font-semibold text-[hsl(var(--text-secondary))]">
                      <div>
                        Matched Keywords: <strong className="text-emerald-500">{customResult.matched.length}</strong>
                      </div>
                      <div className="w-1 bg-[hsl(var(--border))]" />
                      <div>
                        Missing Keywords: <strong className="text-rose-500">{customResult.missing.length}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
                  <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-amber-500" />
                    Keyword Match Results
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                        Matching Target Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {customResult.matched.length > 0 ? (
                          customResult.matched.map(kw => (
                            <span key={kw} className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                              ✓ {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[hsl(var(--text-muted))]">No matches found.</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                        Missing Target Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {customResult.missing.length > 0 ? (
                          customResult.missing.map(kw => (
                            <span key={kw} className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                              ✗ {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold">Zero missing target keywords!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[hsl(var(--border))] flex items-center justify-between text-xs text-[hsl(var(--text-secondary))] font-medium">
                    <span>Need to append these missing keywords to your profile?</span>
                    <Link
                      to="/student/profile"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold transition-all cursor-pointer"
                    >
                      Update Profile
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6 text-left">
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                AI Content Scanner
              </h3>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                Scan your current student profile bio and descriptions for AI footprint, or paste custom text drafts to estimate AI generation probability.
              </p>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => handleAiScan(e, 'profile')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer font-bold"
                >
                  <Cpu className="h-4 w-4" />
                  Scan My Profile Text
                </button>
                <div className="text-center text-[10px] text-[hsl(var(--text-muted))] font-bold uppercase tracking-wider">— OR SCAN CUSTOM TEXT —</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] mb-2 uppercase tracking-wide">
                  Paste Custom Draft (e.g. Bio or Project details)
                </label>
                <textarea
                  placeholder="Paste your text draft here to run the heuristic AI content analysis..."
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={(e) => handleAiScan(e, 'pasted')}
                  disabled={!aiText.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 disabled:opacity-45 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4" />
                  Scan Custom Text
                </button>
                {aiResult && (
                  <button
                    type="button"
                    onClick={handleResetAi}
                    className="p-2.5 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {!aiResult ? (
              <div className="p-12 text-center border border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] flex flex-col items-center justify-center">
                <Cpu className="h-10 w-10 text-[hsl(var(--text-muted))] mb-3.5" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">AI detector standby</h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
                  Click "Scan My Profile Text" or paste your custom draft in the left panel and click "Scan Custom Text" to evaluate.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Score Summary Card */}
                <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col md:flex-row items-center gap-8">
                  {/* Radial progress ring */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-[hsl(var(--muted))] fill-none"
                        strokeWidth="10"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className={`fill-none transition-all duration-1000 ease-out stroke-[2] ${
                          aiResult.score >= 70
                            ? 'stroke-rose-500'
                            : aiResult.score >= 35
                            ? 'stroke-amber-500'
                            : 'stroke-emerald-500'
                        }`}
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - (aiResult.score || 0) / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-3xl font-black ${
                        aiResult.score >= 70
                          ? 'text-rose-500'
                          : aiResult.score >= 35
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}>{aiResult.score}%</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[hsl(var(--text-secondary))]">AI Content</span>
                    </div>
                  </div>

                  {/* Assessment */}
                  <div className="space-y-3 flex-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      aiResult.score >= 70
                        ? 'bg-rose-500/10 text-rose-500'
                        : aiResult.score >= 35
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      Verdict: {aiResult.score >= 70 ? 'AI Generated' : aiResult.score >= 35 ? 'Mixed/Cluttered' : 'Human Written'}
                    </span>

                    <h3 className="text-lg font-extrabold text-[hsl(var(--text-primary))]">
                      AI Footprint Verdict
                    </h3>

                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed font-semibold">
                      {aiResult.explanation}
                    </p>
                  </div>
                </div>

                {/* Flagged clichés */}
                <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
                  <h4 className="text-sm font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
                    <Zap className="h-4.5 w-4.5 text-rose-500" />
                    Flagged Phrasing & Clichés
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider block">
                        Typical AI Jargon Detected ({aiResult.flaggedPhrases.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.flaggedPhrases.length > 0 ? (
                          aiResult.flaggedPhrases.map(phr => (
                            <span key={phr} className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                              ✗ {phr}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-500 font-bold">🎉 Outstanding! No obvious ChatGPT clichés detected.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] font-medium space-y-2">
                    <span className="font-bold text-[hsl(var(--text-primary))] block">Humanization Action Plan:</span>
                    <ul className="list-disc pl-4 space-y-1.5 text-[11px] leading-relaxed">
                      <li>Replace verbs like <strong>spearheaded</strong>, <strong>utilized</strong>, or <strong>harnessed</strong> with simpler alternatives (e.g. <em>led</em>, <em>built</em>, <em>used</em>).</li>
                      <li>Remove introductory fillers and transitional adverbs like <strong>furthermore</strong>, <strong>moreover</strong>, or <strong>delve into</strong>.</li>
                      <li>Inject direct numbers and metrics (e.g., <em>"Improved load time by 30%"</em> instead of <em>"seamlessly optimized performance for dynamic user demands"</em>).</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
