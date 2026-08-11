import { useNavigate } from 'react-router-dom';
import { usePS } from '../hooks';
import { LoadingSkeleton } from '@/components/common';
import { Award, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

export function PSLevelsCard() {
  const navigate = useNavigate();
  const { data: psData, isLoading, isError } = usePS();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4">
        <LoadingSkeleton count={1} height="h-6" className="w-1/3" />
        <LoadingSkeleton count={3} height="h-12" />
      </div>
    );
  }

  if (isError || !psData || !psData.psConnected) {
    return null; // Don't show levels list if PS is not connected
  }

  // Derive clearance levels (expecting e.g. "3" or "Level 3" or 3)
  const clearanceText = String(psData.levelClearance || '0');
  const clearanceNum = parseInt(clearanceText.replace(/\D/g, '')) || 0;

  const levels = [1, 2, 3, 4, 5].map((lvl) => {
    let status: 'Completed' | 'In Progress' | 'Not Started' = 'Not Started';
    let progress = '0 / 5 Units';

    if (lvl <= clearanceNum) {
      status = 'Completed';
      progress = '5 / 5 Units';
    } else if (lvl === clearanceNum + 1) {
      status = 'In Progress';
      progress = '2 / 5 Units'; // mock progress for current level
    }

    return {
      id: String(lvl),
      name: `Level ${lvl}`,
      status,
      progress,
    };
  });

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4 animate-in">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-purple-500" />
        <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))]">
          Personalized Skill (PS) Levels
        </h4>
      </div>

      <div className="space-y-3">
        {levels.map((lvl) => (
          <div
            key={lvl.id}
            className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))] hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[hsl(var(--text-primary))]">
                  {lvl.name}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    lvl.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : lvl.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {lvl.status === 'Completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                  {lvl.status === 'In Progress' && <Clock className="h-2.5 w-2.5 animate-spin" />}
                  {lvl.status === 'Not Started' && <Circle className="h-2.5 w-2.5" />}
                  {lvl.status}
                </span>
              </div>
              <p className="text-[10px] text-[hsl(var(--text-muted))] font-semibold">
                Progress: {lvl.progress}
              </p>
            </div>

            <button
              onClick={() => navigate(`/student/ps/levels/${lvl.id}/questions`)}
              className="py-1.5 px-3.5 text-[10px] font-bold text-[hsl(var(--primary))] hover:text-white hover:bg-[hsl(var(--primary))] border border-[hsl(var(--primary))] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              View Practice Questions
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default PSLevelsCard;
