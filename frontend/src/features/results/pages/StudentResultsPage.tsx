import { useState } from 'react';
import { useResults } from '../hooks/useResults';
import {
  Award, RefreshCw, Loader2, FileSpreadsheet,
  CheckCircle, ArrowLeft, Clock,
  ChevronRight, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/common';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function StudentResultsPage() {
  const navigate = useNavigate();
  const { resultsQuery, statusQuery, syncResults, isSyncing } = useResults();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [localSyncing, setLocalSyncing] = useState(false);

  if (resultsQuery.isLoading || statusQuery.isLoading) {
    return (
      <div className="p-8 space-y-6">
        <LoadingSkeleton count={1} height="h-8" className="w-1/4" />
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  const results = resultsQuery.data || [];
  const status = statusQuery.data;

  // Find overall completed levels & cgpa
  const latestResult = results.length > 0 ? results[results.length - 1] : null;
  const currentCgpa = latestResult ? latestResult.cgpa : 0.0;
  const semestersCompleted = results.length;

  // Initialize selected semester if not set
  if (selectedSemester === null && results.length > 0) {
    setSelectedSemester(results[results.length - 1].semester);
  }

  const activeResult = results.find(r => r.semester === selectedSemester);

  const handleSync = async () => {
    setLocalSyncing(true);
    try {
      await syncResults();
    } finally {
      setLocalSyncing(false);
    }
  };

  const getRomanSemester = (sem: number) => {
    const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    return roman[sem] || String(sem);
  };

  const formatSyncDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const isSyncPending = isSyncing || localSyncing;

  // Chart data normalization
  const chartData = results.map(r => ({
    name: `Sem ${getRomanSemester(r.semester)}`,
    SGPA: r.sgpa,
    CGPA: r.cgpa,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="p-2 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] rounded-xl text-[hsl(var(--text-secondary))] cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[hsl(var(--text-primary))] flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-purple-500" />
              Academic Results
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              View your semester-wise grades, cumulative averages, and sync state history.
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncPending}
          className="px-4 py-2 bg-purple-650 hover:bg-purple-750 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSyncPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isSyncPending ? 'Syncing Results...' : 'Sync Results'}
        </button>
      </div>

      {results.length === 0 ? (
        <div className="p-12 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] flex flex-col items-center space-y-4 shadow-xs">
          <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
            <FileSpreadsheet className="h-8 w-8 text-purple-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">No results found</h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] max-w-sm mx-auto font-medium">
              BIP academic results have not been synchronized. Please synchronize your results to begin.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncPending}
            className="px-5 py-2.5 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSyncPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Sync Results Now
          </button>
        </div>
      ) : (
        <>
          {/* Summary metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Cumulative CGPA</p>
                <p className="text-xl font-black text-purple-655 mt-0.5">{currentCgpa.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Semesters Completed</p>
                <p className="text-xl font-black text-emerald-650 mt-0.5">{semestersCompleted} Semesters</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))]">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">Last Synced Status</p>
                <p className="text-xs font-black text-[hsl(var(--text-primary))] mt-1 truncate">
                  {formatSyncDate(status?.lastSynced || latestResult?.lastSynced)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Area Chart */}
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-purple-500" />
              SGPA / CGPA Progression Chart
            </h3>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="hsl(var(--text-muted))" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--surface))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Area type="monotone" dataKey="SGPA" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSgpa)" />
                  <Area type="monotone" dataKey="CGPA" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCgpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Semester Breakdown details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Semester selector menu */}
            <div className="col-span-1 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-4 space-y-3">
              <h3 className="font-extrabold text-xs text-[hsl(var(--text-primary))] uppercase tracking-wider px-1">
                Semesters
              </h3>
              <div className="space-y-1">
                {results.map((r) => {
                  const isActive = r.semester === selectedSemester;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedSemester(r.semester)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-purple-650 text-white border-transparent shadow-xs'
                          : 'bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))]'
                      }`}
                    >
                      <span>Semester {getRomanSemester(r.semester)}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Semester subjects breakdown */}
            <div className="col-span-1 lg:col-span-3 space-y-4">
              {activeResult && (
                <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[hsl(var(--border))/0.4] pb-4">
                    <div>
                      <h3 className="font-black text-base text-[hsl(var(--text-primary))]">
                        Semester {getRomanSemester(activeResult.semester)} Detailed Grades
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-secondary))] font-medium mt-0.5">
                        Course outcomes and grade points scored.
                      </p>
                    </div>

                    <div className="flex gap-4 text-xs font-bold">
                      <div className="px-3 py-1.5 bg-purple-50 rounded-lg text-purple-750">
                        SGPA: <span className="font-black">{activeResult.sgpa.toFixed(2)}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-750">
                        CGPA: <span className="font-black">{activeResult.cgpa.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects table */}
                  <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--background))]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[hsl(var(--muted))] font-bold text-[hsl(var(--text-muted))] uppercase border-b border-[hsl(var(--border))] text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Course Code</th>
                          <th className="p-3">Course Title</th>
                          <th className="p-3 text-center">Credits</th>
                          <th className="p-3 text-center">Grade</th>
                          <th className="p-3 text-center">Grade Point</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[hsl(var(--border))]">
                        {activeResult.subjects.map((sub) => (
                          <tr key={sub.id} className="hover:bg-[hsl(var(--surface))] font-medium">
                            <td className="p-3 font-bold text-[hsl(var(--text-primary))]">{sub.courseCode}</td>
                            <td className="p-3">{sub.courseName}</td>
                            <td className="p-3 text-center font-semibold text-[hsl(var(--text-secondary))]">{sub.credits}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded font-black text-[10px] ${
                                sub.grade === 'O' || sub.grade === 'A+' || sub.grade === 'A'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {sub.grade}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold">{sub.gradePoint.toFixed(1)}</td>
                            <td className="p-3 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                sub.resultStatus === 'PASS'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-250'
                                  : 'bg-rose-50 text-rose-700 border border-rose-250'
                              }`}>
                                {sub.resultStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default StudentResultsPage;
