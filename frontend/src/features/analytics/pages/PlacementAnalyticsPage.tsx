import { useState } from 'react';
import { useOfficerReport } from '../hooks/useAnalytics';
import { LoadingSkeleton, StatCard } from '@/components/common';
import {
  BarChart3,
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Building,
  GraduationCap,
  Calendar,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants';

export function PlacementAnalyticsPage() {
  const [batch, setBatch] = useState('');
  const [department, setDepartment] = useState('');

  const { data: stats, isLoading, refetch, isFetching } = useOfficerReport({
    batch: batch || undefined,
    department: department || undefined,
  });

  const formatLPA = (amount: number) => {
    if (!amount) return 'N/A';
    return `₹ ${(amount / 100000).toFixed(2)} LPA`;
  };

  const departmentsList = DEPARTMENTS || [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Electrical',
    'Mechanical',
    'Civil',
    'Chemical',
    'Biotechnology',
  ];

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Placement Analytics
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Real-time insights, metrics, and department breakdowns for batch recruitment.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm font-semibold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Filters Card */}
      <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--text-primary))]">
          <Filter className="h-4 w-4 text-[hsl(var(--primary))]" />
          <span>Filter Report Data</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
              Select Batch Year
            </label>
            <input
              type="text"
              placeholder="e.g. 2026"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
              Select Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
            >
              <option value="">All Departments</option>
              {departmentsList.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setBatch('');
                setDepartment('');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-sm font-semibold text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--border))] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />
      ) : stats ? (
        <div className="space-y-8">
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Candidates"
              value={stats.totalStudents}
              icon={<Users className="h-6 w-6" />}
              description="Registered student profiles"
            />
            <StatCard
              title="Placed Candidates"
              value={stats.placedStudentsCount}
              icon={<TrendingUp className="h-6 w-6 text-[hsl(var(--success))]" />}
              description="Candidates with select offers"
            />
            <StatCard
              title="Placement Rate"
              value={`${stats.placementRate}%`}
              icon={
                <div className="relative flex items-center justify-center">
                  <BarChart3 className="h-6 w-6" />
                </div>
              }
              description="Percentage of placed students"
            />
            <StatCard
              title="Average Package"
              value={formatLPA(stats.averageSalary)}
              icon={<DollarSign className="h-6 w-6 text-[hsl(var(--success))]" />}
              description="Based on published results"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Department Breakdown Column (2/3 width) */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Department-wise Breakdown</h3>
              </div>

              {Object.keys(stats.departmentBreakdown || {}).length === 0 ? (
                <p className="text-sm text-[hsl(var(--text-secondary))] text-center py-6">
                  No department breakdown data available for the chosen filters.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats.departmentBreakdown || {}).map(([dep, data]: [string, any]) => (
                    <div key={dep} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-[hsl(var(--text-primary))] font-semibold">{dep}</span>
                        <span className="text-[hsl(var(--text-secondary))] text-xs">
                          {data.placed} of {data.total} placed ({data.rate}%)
                        </span>
                      </div>
                      
                      {/* Percent Bar */}
                      <div className="h-3 w-full rounded-full bg-[hsl(var(--muted))] overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-[hsl(var(--primary)/0.6)] to-[hsl(var(--primary))] transition-all duration-500"
                          style={{ width: `${data.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General metrics dashboard (1/3 width) */}
            <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Platform Metrics</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                  <div className="flex items-center gap-2.5">
                    <Building className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Companies</span>
                  </div>
                  <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{stats.totalCompanies}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Recruiters</span>
                  </div>
                  <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{stats.totalRecruiters}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Job Openings</span>
                  </div>
                  <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{stats.totalJobs}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-[hsl(var(--text-muted))]" />
                    <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">Active Drives</span>
                  </div>
                  <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{stats.totalDrives}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] mt-8">
          <p className="text-sm text-[hsl(var(--text-secondary))]">Failed to load analytics statistics.</p>
        </div>
      )}
    </div>
  );
}

export default PlacementAnalyticsPage;
