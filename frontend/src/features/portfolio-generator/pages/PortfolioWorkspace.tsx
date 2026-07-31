import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolios } from '../hooks/usePortfolios';
import { PortfolioForm } from '../components/PortfolioForm';
import { PortfolioPreview } from '../components/PortfolioPreview';
import { LoadingSkeleton } from '@/components/common';
import { ArrowLeft, Save, Globe } from 'lucide-react';

const defaultPortfolioData = {
  name: '',
  tagline: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  github: '',
  linkedin: '',
  bio: '',
  projects: [],
  education: [],
  skills: [],
};

export function PortfolioWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id && id !== 'new';

  const {
    portfolio,
    isLoadingPortfolio,
    createPortfolio,
    updatePortfolio,
    isCreatingPortfolio,
    isUpdatingPortfolio,
  } = usePortfolios(isEditMode ? id : undefined);

  const [title, setTitle] = useState('My Portfolio');
  const [slug, setSlug] = useState('');
  const [themeId, setThemeId] = useState('minimalist');
  const [isPublished, setIsPublished] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(defaultPortfolioData);

  // Sync state if edit mode and details fetched
  useEffect(() => {
    if (isEditMode && portfolio) {
      setTitle(portfolio.title);
      setSlug(portfolio.slug);
      setThemeId(portfolio.themeId);
      setIsPublished(portfolio.isPublished);
      setPortfolioData(portfolio.data || defaultPortfolioData);
    }
  }, [isEditMode, portfolio]);

  if (isEditMode && isLoadingPortfolio) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  const handleSave = async () => {
    try {
      const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (isEditMode) {
        await updatePortfolio({
          id: id!,
          data: {
            title,
            slug: sanitizedSlug,
            themeId,
            isPublished,
            data: portfolioData,
          },
        });
      } else {
        await createPortfolio({
          title,
          slug: sanitizedSlug,
          themeId,
          isPublished,
          data: portfolioData,
        });
        navigate('/student/portfolio');
      }
    } catch (e) {}
  };

  const handleLaunchPublic = () => {
    if (slug) {
      window.open(`/portfolio/public/${slug}`, '_blank');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Workspace Header Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/portfolio')}
            className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold bg-transparent border-b border-transparent hover:border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:outline-none px-1 text-[hsl(var(--text-primary))]"
                placeholder="Portfolio Title"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))] px-1">
              <span>URL:</span>
              <span className="font-mono text-[10px] bg-[hsl(var(--muted))] px-1.5 py-0.5 rounded text-[hsl(var(--text-primary))]">
                /portfolio/public/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="font-mono text-[10px] bg-transparent border-b border-[hsl(var(--border))] focus:outline-none text-[hsl(var(--primary))] font-bold w-32"
                placeholder="url-slug"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center w-full xl:w-auto">
          <div className="w-36">
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              <option value="minimalist">Default Surface</option>
              <option value="neon">Neon Slate</option>
              <option value="emerald">Deep Emerald</option>
              <option value="dark-mode">Charcoal Gold</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold border border-[hsl(var(--border))] bg-[hsl(var(--surface))] rounded-lg select-none cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <span>Publish Site</span>
          </label>

          {isPublished && portfolio?.isApproved && (
            <button
              onClick={handleLaunchPublic}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              Visit Public Page
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isCreatingPortfolio || isUpdatingPortfolio}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Save className="h-4 w-4" />
            Save Portfolio
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Config controls */}
        <div className="xl:col-span-1">
          <PortfolioForm data={portfolioData} onChange={setPortfolioData} />
        </div>

        {/* Live Preview stylesheet page */}
        <div className="xl:col-span-1 max-h-200 overflow-y-auto border border-[hsl(var(--border))] rounded-2xl p-4 bg-[hsl(var(--muted))/0.1] shadow-inner">
          <PortfolioPreview themeId={themeId} data={portfolioData} />
        </div>
      </div>
    </div>
  );
}

export default PortfolioWorkspace;
