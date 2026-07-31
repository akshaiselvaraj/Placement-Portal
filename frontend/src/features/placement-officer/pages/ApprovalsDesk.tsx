import { useState } from 'react';
import { usePlacementData } from '../hooks/usePlacementData';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { CheckCircle2, XCircle, FileText, Globe, ExternalLink, ShieldCheck } from 'lucide-react';

export function ApprovalsDesk() {
  const [activeTab, setActiveTab] = useState<'resumes' | 'portfolios'>('resumes');
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

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Approvals Desk
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review and approve customized resume templates and student portfolio pages.
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
      </div>

      {/* Queue tables */}
      {activeTab === 'resumes' ? (
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
      ) : (
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
    </div>
  );
}

export default ApprovalsDesk;
