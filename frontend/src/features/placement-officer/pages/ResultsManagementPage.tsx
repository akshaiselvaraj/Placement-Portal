import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placementService } from '../services/placement.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import {
  Award,
  FileSpreadsheet,
  Send,
  Search,
  Sparkles,
  X,
  Edit2,
  Save,
  Link2,
} from 'lucide-react';
import type { Application } from '@/types';

export function ResultsManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [offerStatusFilter, setOfferStatusFilter] = useState('ALL');

  // Modals / Drawers
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedCompanyToPublish, setSelectedCompanyToPublish] = useState('ALL');
  const [editingResult, setEditingResult] = useState<Application | null>(null);

  // Form State for CTC editing
  const [formData, setFormData] = useState({
    offerStatus: 'PENDING',
    joiningStatus: 'PENDING',
    ctc: '0',
    baseSalary: '0',
    bonus: '0',
    stocks: '0',
    benefits: '',
    offerLetter: '',
  });

  // Queries
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['placement-results'],
    queryFn: () => placementService.getResults(),
  });

  // Mutations
  const updateResultMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => placementService.updateOfferResult(id, data),
    onSuccess: () => {
      toast.success('Offer letter CTC breakdown details saved');
      queryClient.invalidateQueries({ queryKey: ['placement-results'] });
      setEditingResult(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: placementService.bulkPublishResults,
    onSuccess: () => {
      toast.success('Results published successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-results'] });
      setIsPublishModalOpen(false);
    },
  });

  // Metrics
  const metrics = useMemo(() => {
    const list = results;
    const total = list.length;
    const ctcs = list.map((r) => r.ctc || 0);
    const highest = ctcs.length ? Math.max(...ctcs) : 0;
    const avg = ctcs.length ? (ctcs.reduce((a, b) => a + b, 0) / ctcs.length).toFixed(1) : '0';
    const accepted = list.filter((r) => r.offerStatus === 'ACCEPTED' || r.offerStatus === 'JOINED').length;
    return { total, highest, avg, accepted };
  }, [results]);

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.job?.company?.name).filter(Boolean)));
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const studentName = item.student?.user?.name || '';
      const rollNumber = item.student?.rollNumber || '';
      const companyName = item.job?.company?.name || '';
      const jobRole = item.job?.title || '';

      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobRole.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCompany = companyFilter === 'ALL' || companyName === companyFilter;
      const matchesOffer = offerStatusFilter === 'ALL' || item.offerStatus === offerStatusFilter;

      return matchesSearch && matchesCompany && matchesOffer;
    });
  }, [results, searchQuery, companyFilter, offerStatusFilter]);

  const handleOpenEditDrawer = (res: Application) => {
    setEditingResult(res);
    setFormData({
      offerStatus: res.offerStatus || 'PENDING',
      joiningStatus: res.joiningStatus || 'PENDING',
      ctc: String(res.ctc || 0),
      baseSalary: String(res.baseSalary || 0),
      bonus: String(res.bonus || 0),
      stocks: String(res.stocks || 0),
      benefits: res.benefits || '',
      offerLetter: res.offerLetter || '',
    });
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    updateResultMutation.mutate({
      id: editingResult.id,
      data: formData,
    });
  };

  const handleNotifyStudents = () => {
    toast.success(`Broadcast notification queued for placed candidates!`);
  };

  const handleExportExcel = () => {
    const headers = ['Student Name', 'Roll Number', 'Department', 'Company', 'Role', 'CTC (LPA)', 'Offer Status', 'Joining Status'];
    const rows = filteredResults.map((r) => [
      `"${r.student?.user?.name || ''}"`,
      `"${r.student?.rollNumber || ''}"`,
      `"${r.student?.department || ''}"`,
      `"${r.job?.company?.name || ''}"`,
      `"${r.job?.title || ''}"`,
      `"${r.ctc || 0}"`,
      `"${r.offerStatus || 'PENDING'}"`,
      `"${r.joiningStatus || 'PENDING'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `placement_results_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--surface))] via-[hsl(var(--surface))] to-[hsl(var(--primary)/0.04)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-7 w-7 text-[hsl(var(--primary))]" />
            <h1 className="text-2xl font-black text-[hsl(var(--text-primary))] tracking-tight">
              Publish & Manage Results
            </h1>
          </div>
          <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
            Review offer letters, publish drive selection results, export official reports, and adjust candidate salary breakdowns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleNotifyStudents}
            className="px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] font-bold text-xs text-[hsl(var(--text-primary))] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Send className="h-4 w-4 text-[hsl(var(--primary))]" />
            Notify
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            Publish Offers
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase">Total Placed</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">{metrics.total}</p>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase">Highest Package</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">{metrics.highest} LPA</p>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase">Avg Package</span>
          <p className="text-2xl font-black text-[hsl(var(--text-primary))] mt-1">{metrics.avg} LPA</p>
        </div>
        <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs">
          <span className="text-[10px] font-bold text-[hsl(var(--text-secondary))] uppercase">Offers Accepted</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.accepted}</p>
        </div>
      </div>

      {/* Control ribbon */}
      <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search placed candidate, roll number..."
            className="pl-9 pr-4 py-2 block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center justify-end">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            {uniqueCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={offerStatusFilter}
            onChange={(e) => setOfferStatusFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none"
          >
            <option value="ALL">All Offer Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Selected List */}
      {isLoading ? (
        <LoadingSkeleton count={3} height="h-16" />
      ) : filteredResults.length === 0 ? (
        <EmptyState
          title="No selection records"
          message="No selection offer results registered yet."
          icon={<Award className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
        />
      ) : (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[hsl(var(--border))]">
              <thead className="bg-[hsl(var(--muted))/0.5]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Candidate</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Company & Job</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">CTC Package</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Offer Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Offer Document</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-[hsl(var(--surface))] divide-y divide-[hsl(var(--border))]/40">
                {filteredResults.map((item) => (
                  <tr key={item.id} className="hover:bg-[hsl(var(--muted))/0.2] transition-all">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{item.student?.user?.name}</p>
                      <p className="text-[10px] text-[hsl(var(--text-secondary))]">{item.student?.rollNumber} &bull; {item.student?.department}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-[hsl(var(--text-primary))] font-semibold">
                      {item.job?.company?.name}
                      <span className="block text-[10px] text-[hsl(var(--text-secondary))] font-normal">{item.job?.title}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[hsl(var(--text-secondary))]">
                      <p className="font-bold text-[hsl(var(--text-primary))]">{item.ctc || 0} LPA</p>
                      <p className="text-[9px]">Base: {item.baseSalary || 0} LPA</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        item.offerStatus === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.offerStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {item.offerStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      {item.offerLetter ? (
                        <a
                          href={item.offerLetter}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[hsl(var(--primary))] font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          View Offer Letter
                        </a>
                      ) : (
                        <span className="text-[hsl(var(--text-muted))] italic">Not Uploaded</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditDrawer(item)}
                        className="p-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] hover:text-[hsl(var(--primary))] cursor-pointer transition-colors"
                        title="Edit CTC Breakdown"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit CTC Breakdown Drawer */}
      {editingResult && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] border-l border-[hsl(var(--border))] max-w-md w-full p-6 shadow-2xl h-full overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-[hsl(var(--border))]">
                <div>
                  <h3 className="font-black text-lg text-[hsl(var(--text-primary))]">CTC & Salary Structure</h3>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))]">{editingResult.student?.user?.name} &bull; {editingResult.job?.company?.name}</p>
                </div>
                <button
                  onClick={() => setEditingResult(null)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveResult} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Offer Status</label>
                  <select
                    value={formData.offerStatus}
                    onChange={(e) => setFormData((p) => ({ ...p, offerStatus: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Joining Status</label>
                  <select
                    value={formData.joiningStatus}
                    onChange={(e) => setFormData((p) => ({ ...p, joiningStatus: e.target.value }))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="JOINED">JOINED</option>
                    <option value="DECLINED">DECLINED</option>
                    <option value="DEFERRED">DEFERRED</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">CTC (LPA)</label>
                    <input
                      type="number"
                      value={formData.ctc}
                      onChange={(e) => setFormData((p) => ({ ...p, ctc: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Base Salary (LPA)</label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData((p) => ({ ...p, baseSalary: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Joining Bonus (LPA)</label>
                    <input
                      type="number"
                      value={formData.bonus}
                      onChange={(e) => setFormData((p) => ({ ...p, bonus: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Stocks / ESOPs (LPA)</label>
                    <input
                      type="number"
                      value={formData.stocks}
                      onChange={(e) => setFormData((p) => ({ ...p, stocks: e.target.value }))}
                      className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Other Benefits Description</label>
                  <input
                    type="text"
                    value={formData.benefits}
                    onChange={(e) => setFormData((p) => ({ ...p, benefits: e.target.value }))}
                    placeholder="e.g. Free Cab, Health Insurance, Meal Coupans"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Offer Letter File Link / URL</label>
                  <input
                    type="text"
                    value={formData.offerLetter}
                    onChange={(e) => setFormData((p) => ({ ...p, offerLetter: e.target.value }))}
                    placeholder="e.g. https://storage.portal.com/offers/doc.pdf"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={updateResultMutation.isPending}
                    className="w-full py-2.5 px-4 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Save Salary Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Publish Selection Results Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
              Publish Selections
            </h3>
            <p className="text-xs text-[hsl(var(--text-secondary))] mb-4">
              Select which partner company selection results you wish to publish to the student portal and trigger notification logs.
            </p>

            <div className="space-y-4">
              <select
                value={selectedCompanyToPublish}
                onChange={(e) => setSelectedCompanyToPublish(e.target.value)}
                className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2.5 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none"
              >
                <option value="ALL">All Placed Candidates ({results.length})</option>
                {uniqueCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const ids = results.map((r) => r.id);
                  publishMutation.mutate(ids);
                }}
                className="w-full py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Confirm and Publish Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsManagementPage;
