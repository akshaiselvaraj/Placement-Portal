import { useState } from 'react';
import { usePS } from '../hooks';
import { BookOpen, CheckCircle, Clock, Award, BarChart3, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { LoadingSkeleton } from '@/components/common';

export function PSCoursesCard() {
  const { data: psData, isLoading } = usePS();
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <LoadingSkeleton count={1} height="h-10" className="w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <LoadingSkeleton count={5} height="h-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton count={3} height="h-48" />
        </div>
      </div>
    );
  }

  if (!psData || !psData.psConnected || !psData.courses || psData.courses.length === 0) {
    return null;
  }

  const courses = psData.courses;

  // Calculate metrics
  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => c.status === 'COMPLETED').length;
  const inProgressCourses = courses.filter((c) => c.status === 'IN_PROGRESS').length;
  const totalLevelsCompleted = courses.reduce((sum, c) => sum + c.completedLevels, 0);
  const totalLevelsCount = courses.reduce((sum, c) => sum + c.totalLevels, 0);
  const overallCompletionPercent = totalLevelsCount > 0 ? Math.round((totalLevelsCompleted / totalLevelsCount) * 100) : 0;

  const toggleExpand = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <div className="space-y-6 animate-in mt-8">
      {/* Header and Sync indicator */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-xl font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[hsl(var(--primary))]" />
            Personalized Skill Courses
          </h3>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 font-semibold">
            Track your milestones and programming skill progression.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Courses */}
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Total Courses</p>
            <p className="text-lg font-black text-[hsl(var(--text-primary))]">{totalCourses}</p>
          </div>
        </div>

        {/* Completed Courses */}
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Completed</p>
            <p className="text-lg font-black text-emerald-550">{completedCourses}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">In Progress</p>
            <p className="text-lg font-black text-blue-500">{inProgressCourses}</p>
          </div>
        </div>

        {/* Total Levels Completed */}
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Levels Cleared</p>
            <p className="text-lg font-black text-purple-500">{totalLevelsCompleted} / {totalLevelsCount}</p>
          </div>
        </div>

        {/* Overall Completion % */}
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Overall Progress</p>
            <p className="text-lg font-black text-amber-550">{overallCompletionPercent}%</p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isCompleted = course.status === 'COMPLETED';
          const isExpanded = !!expandedCourses[course.courseId];
          const hasImage = !!course.imageUrl;

          return (
            <div
              key={course.courseId}
              className="group p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:shadow-xs hover:border-[hsl(var(--border-hover))] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Course Image & Badges */}
                <div className="flex gap-4 items-start">
                  <div className="h-12 w-12 rounded-xl bg-linear-to-tr from-[hsl(var(--primary)/0.05)] to-[hsl(var(--primary)/0.15)] flex items-center justify-center shrink-0 border border-[hsl(var(--border))] overflow-hidden relative">
                    {hasImage ? (
                      <img
                        src={course.imageUrl!}
                        alt={course.courseName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-[hsl(var(--primary))]/70" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))] leading-tight truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                        {course.courseName}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))/0.3]">
                        {course.category}
                      </span>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-500/10 text-emerald-500">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-500/10 text-blue-550">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[hsl(var(--text-secondary))]">
                    <span>{course.completedLevels} / {course.totalLevels} Levels</span>
                    <span className="text-[hsl(var(--text-primary))]">{Math.round(course.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-[hsl(var(--muted))] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'
                      }`}
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Levels Accordion (Accordion triggers details) */}
              <div className="border-t border-[hsl(var(--border))/0.3] pt-3">
                <button
                  onClick={() => toggleExpand(course.courseId)}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? 'HIDE LEVEL DETAILS' : 'VIEW LEVEL DETAILS'}</span>
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {isExpanded && (
                  <div className="mt-3.5 space-y-2 border-l border-[hsl(var(--border))] pl-3.5 animate-in">
                    {Array.from({ length: course.totalLevels }).map((_, i) => {
                      const levelNum = i + 1;
                      const isLevelCleared = levelNum <= course.completedLevels;
                      return (
                        <div key={levelNum} className="flex items-center gap-2 text-[11px] font-semibold">
                          <div
                            className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 border ${
                              isLevelCleared
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--text-muted))]'
                            }`}
                          >
                            {isLevelCleared ? (
                              <span className="text-[9px] font-black">✓</span>
                            ) : (
                              <span className="text-[9px] font-bold">{levelNum}</span>
                            )}
                          </div>
                          <span
                            className={
                              isLevelCleared ? 'text-[hsl(var(--text-primary))] font-bold' : 'text-[hsl(var(--text-secondary))]'
                            }
                          >
                            Level {levelNum} {isLevelCleared ? 'Cleared' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PSCoursesCard;
