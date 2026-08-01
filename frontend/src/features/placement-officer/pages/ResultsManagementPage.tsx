import { useState, useMemo } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  Award,
  FileSpreadsheet,
  Send,
  Search,
  Building2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Sparkles,
  X,
  CheckSquare,
  Printer,
} from 'lucide-react';

export interface SelectedResultItem {
  id: string;
  studentName: string;
  rollNumber: string;
  department: string;
  companyName: string;
  jobRole: string;
  ctc: string;
  ctcNum: number;
  selectionDate: string;
  offerStatus: 'OFFERED' | 'ACCEPTED' | 'JOINED' | 'DECLINED';
  isPublished: boolean;
}

const INITIAL_RESULTS: SelectedResultItem[] = [
  {
    id: 'res-1',
    studentName: 'Divya M.',
    rollNumber: '2022IT089',
    department: 'Information Technology',
    companyName: 'Google India',
    jobRole: 'Software Engineer (SDE-1)',
    ctc: '₹34.0 LPA',
    ctcNum: 34.0,
    selectionDate: '2026-07-28',
    offerStatus: 'ACCEPTED',
    isPublished: true,
  },
  {
    id: 'res-2',
    studentName: 'Akshai V.',
    rollNumber: '2022CSE012',
    department: 'Computer Science',
    companyName: 'Microsoft',
    jobRole: 'Full Stack Engineer',
    ctc: '₹28.5 LPA',
    ctcNum: 28.5,
    selectionDate: '2026-07-29',
    offerStatus: 'OFFERED',
    isPublished: true,
  },
  {
    id: 'res-3',
    studentName: 'Rakshana S.',
    rollNumber: '2022CSE045',
    department: 'Computer Science',
    companyName: 'Amazon',
    jobRole: 'Cloud Solutions Architect',
    ctc: '₹26.0 LPA',
    ctcNum: 26.0,
    selectionDate: '2026-07-30',
    offerStatus: 'ACCEPTED',
    isPublished: true,
  },
  {
    id: 'res-4',
    studentName: 'Karthik R.',
    rollNumber: '2022ECE034',
    department: 'Electronics',
    companyName: 'TCS Digital',
    jobRole: 'Digital Systems Engineer',
    ctc: '₹12.0 LPA',
    ctcNum: 12.0,
    selectionDate: '2026-07-25',
    offerStatus: 'JOINED',
    isPublished: false,
  },
];

export function ResultsManagementPage() {
  const { isLoadingApplications } = usePlacementData();
  const [results, setResults] = useState<SelectedResultItem[]>(INITIAL_RESULTS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [offerStatusFilter, setOfferStatusFilter] = useState('ALL');

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedCompanyToPublish, setSelectedCompanyToPublish] = useState('ALL');

  // Derived Calculations
  const totalPlaced = results.length;
  const highestCtc = useMemo(() => {
    return Math.max(...results.map((r) => r.ctcNum), 0);
  }, [results]);

  const avgCtc = useMemo(() => {
    if (!results.length) return '0';
    const sum = results.reduce((acc, curr) => acc + curr.ctcNum, 0);
    return (sum / results.length).toFixed(1);
  }, [results]);

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.companyName)));
  }, [results]);

  // Filtered list
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jobRole.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'ALL' || item.companyName === companyFilter;
      const matchesOffer = offerStatusFilter === 'ALL' || item.offerStatus === offerStatusFilter;

      return matchesSearch && matchesCompany && matchesOffer;
    });
  }, [results, searchQuery, companyFilter, offerStatusFilter]);

  // Grouped by Company
  const groupedByCompany = useMemo(() => {
    const map: Record<string, SelectedResultItem[]> = {};
    filteredResults.forEach((item) => {
      if (!map[item.companyName]) {
        map[item.companyName] = [];
      }
      map[item.companyName].push(item);
    });
    return map;
  }, [filteredResults]);

  // Actions
  const handlePublishResults = () => {
    setResults((prev) =>
      prev.map((r) =>
        selectedCompanyToPublish === 'ALL' || r.companyName === selectedCompanyToPublish
          ? { ...r, isPublished: true }
          : r
      )
    );
    toast.success('Placement results published successfully to student portal & email notifications sent!');
    setIsPublishModalOpen(false);
  };

  const handleNotifyStudents = () => {
    toast.success(`Broadcast notification sent to all ${totalPlaced} selected candidates!`);
  };

  const handleExportExcel = () => {
    // Generate CSV data download
    const headers = ['Student Name', 'Roll Number', 'Department', 'Company', 'Role', 'CTC', 'Selection Date', 'Offer Status'];
    const rows = filteredResults.map((r) => [
      r.studentName,
      r.rollNumber,
      r.department,
      r.companyName,
      r.jobRole,
      r.ctc,
      r.selectionDate,
      r.offerStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `placement_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Placement results exported to Excel (CSV)!');
  };

  const handleDownloadPDF = () => {
    window.print();
    toast.success('Opening print / PDF download generator...');
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Publish & Manage Placement Results
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Review offer letters, publish drive selection results, export official reports, and notify placed students.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleNotifyStudents}
            className="px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] font-bold text-xs text-[hsl(var(--text-primary))] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send className="h-4 w-4 text-[hsl(var(--primary))]" />
            Notify Students
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] font-bold text-xs text-sky-600 dark:text-sky-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Printer className="h-4 w-4" />
            Download PDF
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            Publish Results
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[hsl(var(--text-muted))] uppercase">Total Placed</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalPlaced} Students</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[hsl(var(--text-muted))] uppercase">Highest Package</p>
            <p className="text-2xl font-black text-[hsl(var(--text-primary))]">₹{highestCtc} LPA</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[hsl(var(--text-muted))] uppercase">Average Package</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{avgCtc} LPA</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-[hsl(var(--text-muted))] uppercase">Top Recruiters</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{uniqueCompanies.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search placed students by name, roll number, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Recruiters</option>
          {uniqueCompanies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={offerStatusFilter}
          onChange={(e) => setOfferStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Offer Statuses</option>
          <option value="OFFERED">OFFERED</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="JOINED">JOINED</option>
          <option value="DECLINED">DECLINED</option>
        </select>
      </div>

      {/* Selected Candidates Grouped by Company */}
      {isLoadingApplications ? (
        <LoadingSkeleton count={3} height="h-48" />
      ) : Object.keys(groupedByCompany).length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No placement selection results found"
            message="No candidate results match your filter criteria."
            icon={<Award className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByCompany).map(([company, list]) => (
            <div
              key={company}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs overflow-hidden"
            >
              {/* Group Header */}
              <div className="p-4 bg-[hsl(var(--muted)/0.4)] border-b border-[hsl(var(--border))] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-black text-sm flex items-center justify-center border border-[hsl(var(--primary)/0.2)]">
                    {company.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[hsl(var(--text-primary))]">{company}</h3>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{list.length} Selected Candidates</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Highest: {list[0]?.ctc}
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[hsl(var(--border))] text-[11px] uppercase font-bold text-[hsl(var(--text-secondary))] tracking-wider bg-[hsl(var(--surface))]">
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Job Role</th>
                      <th className="p-4">CTC Offered</th>
                      <th className="p-4">Selection Date</th>
                      <th className="p-4">Offer Status</th>
                      <th className="p-4 text-right">Portal Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {list.map((res) => (
                      <tr key={res.id} className="hover:bg-[hsl(var(--primary)/0.02)] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {res.studentName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[hsl(var(--text-primary))]">{res.studentName}</p>
                              <p className="text-[11px] text-[hsl(var(--text-secondary))] font-mono">
                                {res.rollNumber}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-[hsl(var(--text-secondary))]">{res.department}</td>

                        <td className="p-4 font-bold text-[hsl(var(--text-primary))]">{res.jobRole}</td>

                        <td className="p-4">
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                            {res.ctc}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-[hsl(var(--text-secondary))]">
                          {res.selectionDate}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              res.offerStatus === 'ACCEPTED' || res.offerStatus === 'JOINED'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                            }`}
                          >
                            {res.offerStatus}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {res.isPublished ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              Draft (Pending)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Results Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 pb-4 border-b border-[hsl(var(--border))]">
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="font-bold text-base text-[hsl(var(--text-primary))]">Publish Placement Results</h3>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                Publishing results will make selection status visible on the student portal and trigger automated notification emails to selected candidates.
              </p>

              <div>
                <label className="block font-bold text-[hsl(var(--text-secondary))] uppercase mb-1">
                  Select Recruiter Drive to Publish
                </label>
                <select
                  value={selectedCompanyToPublish}
                  onChange={(e) => setSelectedCompanyToPublish(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] outline-none"
                >
                  <option value="ALL">All Corporate Recruiters ({results.length} total placed)</option>
                  {uniqueCompanies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)] flex items-center gap-2 text-[11px] text-[hsl(var(--primary))] font-medium">
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>Instant broadcast to candidate dashboard & email inbox.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[hsl(var(--border))]">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishResults}
                  className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Confirm & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsManagementPage;
