import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlacementData } from '../hooks/usePlacementData';
import { placementService } from '../services/placement.service';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { toast } from '@/store';
import { FileText, Globe, ExternalLink, ShieldCheck, History, X, Check } from 'lucide-react';

export function ApprovalsDesk() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'resumes' | 'portfolios' | 'documents'>('resumes');
  const [selectedDocHistory, setSelectedDocHistory] = useState<any[] | null>(null);

  // Zod comments modal
  const [commentsDocId, setCommentsDocId] = useState<string | null>(null);
  const [commentsText, setCommentsText] = useState('');
  const [actionStatus, setActionStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  const {
    resumes,
    isLoadingResumes,
    approveResume,
    isApprovingResume,
    portfolios,
    isLoadingPortfolios,
    approvePortfolio,
    isApprovingPortfolio,
  } = usePlacementData();

  // Documents query
  const { data: documents = [], isLoading: isLoadingDocs } = useQuery({
    queryKey: ['placement-documents'],
    queryFn: () => placementService.getDocuments(),
    enabled: activeTab === 'documents',
  });

  // Approval mutation
  const approveDocMutation = useMutation({
    mutationFn: ({ id, status, comments }: { id: string; status: string; comments?: string }) =>
      placementService.approveDocument(id, { status, comments }),
    onSuccess: () => {
      toast.success('Document verification status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['placement-documents'] });
      setCommentsDocId(null);
      setCommentsText('');
    },
  });

  const handleApproveResume = async (id: string, isApproved: boolean) => {
    try {
      await approveResume({ id, isApproved });
    } catch (e) {}
  };

  const handleApprovePortfolio = async (id: string, isApproved: boolean) => {
    try {
      await approvePortfolio({ id, isApproved });
    } catch (e) {}
  };

  const openCommentModal = (docId: string, status: 'APPROVED' | 'REJECTED') => {
    setCommentsDocId(docId);
    setActionStatus(status);
    setCommentsText('');
  };

  const handleConfirmDocApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentsDocId) return;
    approveDocMutation.mutate({
      id: commentsDocId,
      status: actionStatus,
      comments: commentsText,
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Verification & Approvals Desk
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review student resumes, portfolios, and uploaded transcripts or NOC certificates.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2.5 p-1 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--surface))] w-fit">
        <button
          onClick={() => setActiveTab('resumes')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'resumes'
              ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
              : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
          }`}
        >
          Resumes Queue
        </button>
        <button
          onClick={() => setActiveTab('portfolios')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'portfolios'
              ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
              : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
          }`}
        >
          Portfolios Queue
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
              : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
          }`}
        >
          Document Center
        </button>
      </div>

      {/* Resumes Tab */}
      {activeTab === 'resumes' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Resumes Awaiting Review</h3>
          {isLoadingResumes ? (
            <LoadingSkeleton count={2} height="h-28" />
          ) : resumes.length === 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
              <EmptyState
                title="Resume queue empty"
                message="All submitted student resumes have been approved or rejected."
                icon={<FileText className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between hover:border-[hsl(var(--primary)/0.2)] transition-all space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                          {resume.student?.user?.name || 'Student'}
                        </h4>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                          {resume.student?.user?.email}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        resume.isApproved ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]' : 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]'
                      }`}>
                        {resume.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>

                    <a
                      href={`/student/resume/preview/${resume.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] hover:bg-[hsl(var(--primary)/0.1)] rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview Resume Template
                    </a>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-[hsl(var(--border))]">
                    <button
                      onClick={() => handleApproveResume(resume.id, false)}
                      disabled={isApprovingResume || !resume.isApproved}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-lg border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] text-[hsl(var(--danger))] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveResume(resume.id, true)}
                      disabled={isApprovingResume || resume.isApproved}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white disabled:opacity-50 transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Portfolios Tab */}
      {activeTab === 'portfolios' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Portfolios Awaiting Review</h3>
          {isLoadingPortfolios ? (
            <LoadingSkeleton count={2} height="h-28" />
          ) : portfolios.length === 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
              <EmptyState
                title="Portfolio queue empty"
                message="All custom portfolios have been verified."
                icon={<Globe className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex flex-col justify-between hover:border-[hsl(var(--primary)/0.2)] transition-all space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">
                          {portfolio.student?.user?.name || 'Student'}
                        </h4>
                        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                          {portfolio.student?.user?.email}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        portfolio.isApproved ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]' : 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]'
                      }`}>
                        {portfolio.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>

                    <a
                      href={`/portfolio/${portfolio.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] hover:bg-[hsl(var(--primary)/0.1)] rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview Custom Theme
                    </a>
                  </div>

                  <div className="flex gap-2.5 pt-3 border-t border-[hsl(var(--border))]">
                    <button
                      onClick={() => handleApprovePortfolio(portfolio.id, false)}
                      disabled={isApprovingPortfolio || !portfolio.isApproved}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-lg border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] hover:bg-[hsl(var(--danger)/0.15)] text-[hsl(var(--danger))] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprovePortfolio(portfolio.id, true)}
                      disabled={isApprovingPortfolio || portfolio.isApproved}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white disabled:opacity-50 transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Document Approvals Desk</h3>
          {isLoadingDocs ? (
            <LoadingSkeleton count={3} height="h-20" />
          ) : documents.length === 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
              <EmptyState
                title="No documents uploaded"
                message="Students have not uploaded mark sheets or NOC documents yet."
                icon={<ShieldCheck className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
              />
            </div>
          ) : (
            <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[hsl(var(--border))]">
                  <thead className="bg-[hsl(var(--muted))/0.5]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Document Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Version</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-[hsl(var(--text-secondary))] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[hsl(var(--surface))] divide-y divide-[hsl(var(--border))]/40">
                    {documents.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-[hsl(var(--muted))/0.2] transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-bold text-sm text-[hsl(var(--text-primary))]">{doc.student?.user?.name}</p>
                          <p className="text-[10px] text-[hsl(var(--text-secondary))]">{doc.student?.rollNumber}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                          <p className="font-semibold text-[hsl(var(--text-primary))]">{doc.title}</p>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-[hsl(var(--primary))] hover:underline font-medium inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View File
                          </a>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                            doc.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : doc.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-bold text-[hsl(var(--text-primary))]">
                          v{doc.version || 1}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs space-x-2">
                          <button
                            onClick={() => openCommentModal(doc.id, 'APPROVED')}
                            className="px-2.5 py-1.5 rounded-lg bg-[hsl(var(--success))] hover:bg-emerald-600 text-white font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openCommentModal(doc.id, 'REJECTED')}
                            className="px-2.5 py-1.5 rounded-lg bg-[hsl(var(--danger))] hover:bg-rose-600 text-white font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setSelectedDocHistory(doc.approvalHistories)}
                            className="p-1.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] cursor-pointer inline-flex items-center"
                            title="Approval History"
                          >
                            <History className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Log Modal */}
      {selectedDocHistory && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-md w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedDocHistory(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-[hsl(var(--primary))]" />
              Approval Timeline History
            </h3>

            <div className="space-y-4 max-h-80 overflow-y-auto pl-2 border-l border-[hsl(var(--border))]">
              {selectedDocHistory.map((hist: any, index: number) => (
                <div key={hist.id || index} className="relative pl-4 text-xs space-y-1">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[hsl(var(--primary))]" />
                  <p className="font-bold text-[hsl(var(--text-primary))]">
                    {hist.status} &bull; v{hist.version || 1}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-secondary))]">
                    Verified by: {hist.approvedBy} on {new Date(hist.approvedOn).toLocaleString()}
                  </p>
                  {hist.comments && (
                    <p className="p-2 rounded bg-[hsl(var(--muted))/0.2] text-[10px] text-[hsl(var(--text-secondary))] italic">
                      "{hist.comments}"
                    </p>
                  )}
                </div>
              ))}
              {selectedDocHistory.length === 0 && (
                <p className="text-center italic text-xs text-[hsl(var(--text-muted))] py-4">No verification logs recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Comments Modal */}
      {commentsDocId && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-sm w-full p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setCommentsDocId(null)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))]">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-[hsl(var(--text-primary))] flex items-center gap-2 mb-4">
              {actionStatus === 'APPROVED' ? (
                <Check className="h-5 w-5 text-emerald-500" />
              ) : (
                <X className="h-5 w-5 text-rose-500" />
              )}
              Add Verification Remarks
            </h3>

            <form onSubmit={handleConfirmDocApproval} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[hsl(var(--text-secondary))] uppercase mb-1.5">Remarks / Comments</label>
                <textarea
                  rows={3}
                  value={commentsText}
                  onChange={(e) => setCommentsText(e.target.value)}
                  placeholder="e.g. Marks match CGPA profile / Govt ID blurry..."
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={approveDocMutation.isPending}
                className="w-full py-2 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
              >
                Confirm Verification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalsDesk;
