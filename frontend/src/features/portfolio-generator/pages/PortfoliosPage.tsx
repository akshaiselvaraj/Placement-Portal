import { useNavigate } from 'react-router-dom';
import { usePortfolios } from '../hooks/usePortfolios';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { Globe, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export function PortfoliosPage() {
  const navigate = useNavigate();
  const { portfolios, isLoadingPortfolios, deletePortfolio } = usePortfolios();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await deletePortfolio(id);
      } catch (err) {}
    }
  };

  const handleLaunchPublic = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    window.open(`/portfolio/public/${slug}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Portfolio Generator
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Build and publish clean, modern responsive portfolio pages for recruiters to inspect.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/portfolio/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Create Portfolio
        </button>
      </div>

      {isLoadingPortfolios ? (
        <LoadingSkeleton count={2} height="h-28" />
      ) : portfolios.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No portfolios generated yet"
            message="Click the button above to launch the portfolio generator workspace."
            icon={<Globe className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New Trigger Card */}
          <button
            onClick={() => navigate('/student/portfolio/new')}
            className="p-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex flex-col items-center justify-center text-center min-h-40 group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--text-secondary))] group-hover:bg-[hsl(var(--primary)/0.08)] group-hover:text-[hsl(var(--primary))] transition-all">
              <Plus className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] mt-3">Generate New Portfolio</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Select from premium themes</p>
          </button>

          {/* User Portfolios */}
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              onClick={() => navigate(`/student/portfolio/${portfolio.id}`)}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.2)] hover:shadow-xs transition-all flex flex-col justify-between min-h-40 cursor-pointer relative group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2 pr-6">
                  <div>
                    <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate max-w-37.5">
                      {portfolio.title}
                    </h4>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] font-mono font-bold mt-1 uppercase tracking-wider">
                      Theme: {portfolio.themeId}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                    portfolio.isApproved
                      ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
                      : 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]'
                  }`}>
                    {portfolio.isApproved ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-[hsl(var(--text-secondary))] font-medium truncate max-w-50">
                    Path: <span className="font-mono text-[9px] text-[hsl(var(--primary))]">/portfolio/public/{portfolio.slug}</span>
                  </p>
                  <p className="text-[9px] text-[hsl(var(--text-muted))] font-semibold">
                    Last updated: {new Date(portfolio.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Actions panel */}
              <div className="flex gap-2.5 pt-3 border-t border-[hsl(var(--border))/0.5] justify-between items-center opacity-85 group-hover:opacity-100 transition-opacity">
                <span className={`text-[10px] font-bold ${portfolio.isPublished ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--text-muted))]'}`}>
                  {portfolio.isPublished ? 'Published' : 'Draft'}
                </span>

                <div className="flex gap-2.5">
                  <button
                    onClick={(e) => handleDelete(e, portfolio.id)}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                    title="Delete Portfolio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {portfolio.isPublished && portfolio.isApproved && (
                    <button
                      onClick={(e) => handleLaunchPublic(e, portfolio.slug)}
                      className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--primary))] transition-colors cursor-pointer"
                      title="Visit Public Page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/portfolio/${portfolio.id}`);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--primary))] transition-colors cursor-pointer"
                    title="Edit Portfolio"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortfoliosPage;
