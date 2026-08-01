import { useParams } from 'react-router-dom';
import { usePortfolios } from '../hooks/usePortfolios';
import { PortfolioPreview } from '../components/PortfolioPreview';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { Globe, ShieldAlert } from 'lucide-react';

export function PublicPortfolioView() {
  const { slug } = useParams<{ slug: string }>();
  const { publicPortfolio, isLoadingPublicPortfolio } = usePortfolios(undefined, slug);

  if (isLoadingPublicPortfolio) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 flex items-center justify-center">
        <LoadingSkeleton count={3} height="h-40" className="max-w-3xl w-full" />
      </div>
    );
  }

  if (!publicPortfolio) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 flex items-center justify-center text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <EmptyState
            title="Portfolio not found"
            message="This page may have been deleted, set to draft, or is awaiting verification checks."
            icon={<ShieldAlert className="h-10 w-10 text-purple-400" />}
          />
        </div>
      </div>
    );
  }

  const theme = publicPortfolio.themeId;
  let bgClass = 'bg-slate-50 dark:bg-slate-900';
  if (theme === 'neon') bgClass = 'bg-slate-950';
  else if (theme === 'emerald') bgClass = 'bg-stone-950';
  else if (theme === 'dark-mode') bgClass = 'bg-zinc-950';

  return (
    <div className="min-h-screen">
      <PortfolioPreview themeId={publicPortfolio.themeId} data={publicPortfolio.data} />
    </div>
  );
}

export default PublicPortfolioView;
