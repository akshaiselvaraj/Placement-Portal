import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResults } from '../hooks/useResults';
import { Award, BookOpen, Clock, Loader2, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '@/components/common';

export function AcademicPerformanceCard() {
  const navigate = useNavigate();
  const { resultsQuery, statusQuery, syncResults, isSyncing } = useResults();
  const [localSyncing, setLocalSyncing] = useState(false);

  if (resultsQuery.isLoading || statusQuery.isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] space-y-4">
        <LoadingSkeleton count={1} height="h-6" className="w-1/2" />
        <LoadingSkeleton count={3} height="h-10" />
      </div>
    );
  }

  const results = resultsQuery.data || [];
  const status = statusQuery.data;

  // Handle manual sync click
  const handleSync = async () => {
    setLocalSyncing(true);
    try {
      await syncResults();
    } finally {
      setLocalSyncing(false);
    }
  };

  // Convert semester number to Roman numeral
  const getRomanSemester = (sem: number) => {
    const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    return roman[sem] || String(sem);
  };

  // Date formatter: DD MMM YYYY, hh:mm A
  const formatSyncDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  const isSyncPending = isSyncing || localSyncing;

  if (results.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col items-center text-center space-y-4">
        <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
            BIP Academic Results Mirror
          </h4>
          <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed max-w-[260px] font-semibold">
            Academic result has not been synchronized yet. Sync now to fetch your SGPA/CGPA records from the BIP Portal.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncPending}
          className="w-full py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {isSyncPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {isSyncPending ? 'Synchronizing...' : 'Sync Results'}
        </button>
      </div>
    );
  }

  // Get the latest semester result
  const latestResult = results[results.length - 1];

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-5 animate-in relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h4 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          Academic Performance
        </h4>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-650">
          Sem {getRomanSemester(latestResult.semester)}
        </span>
      </div>

      {/* Stats list */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
          <span className="text-[hsl(var(--text-secondary))] font-bold">Current CGPA</span>
          <span className="font-black text-purple-600 text-sm">
            {latestResult.cgpa.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
          <span className="text-[hsl(var(--text-secondary))] font-bold">Latest SGPA</span>
          <span className="font-black text-[hsl(var(--text-primary))]">
            {latestResult.sgpa.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
          <span className="text-[hsl(var(--text-secondary))] font-bold">Latest Semester</span>
          <span className="font-black text-[hsl(var(--text-primary))]">
            Semester {getRomanSemester(latestResult.semester)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs py-1 border-b border-[hsl(var(--border))/0.3]">
          <span className="text-[hsl(var(--text-secondary))] font-bold">Last Synced</span>
          <span className="font-black text-[hsl(var(--text-primary))] flex items-center gap-1 text-right">
            <Clock className="h-3 w-3 text-[hsl(var(--text-muted))]" />
            {formatSyncDate(status?.lastSynced || latestResult.lastSynced)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => navigate('/student/results')}
          className="w-full py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-750 rounded-xl transition-all cursor-pointer shadow-xs text-center"
        >
          View Full Results
        </button>

        <button
          onClick={handleSync}
          disabled={isSyncPending}
          className="w-full py-2 text-xs font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--border)/0.3)] border border-[hsl(var(--border))] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSyncPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--primary))]" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {isSyncPending ? 'Syncing...' : 'Sync Result'}
        </button>
      </div>
    </div>
  );
}
export default AcademicPerformanceCard;
