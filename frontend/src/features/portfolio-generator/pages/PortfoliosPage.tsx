import { useState, useEffect } from 'react';
import { usePortfolios } from '../hooks/usePortfolios';
import { useStudentProfile } from '@/features/student/hooks/useStudentProfile';
import { PortfolioPreview } from '../components/PortfolioPreview';
import { LoadingSkeleton } from '@/components/common';
import { toast } from '@/store';
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  Palette,
  Save,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function PortfoliosPage() {
  const { portfolios, isLoadingPortfolios, createPortfolio, updatePortfolio, isUpdatingPortfolio } = usePortfolios();
  const { student, isLoading: isLoadingProfile } = useStudentProfile();

  const [copied, setCopied] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('minimalist');
  const [slug, setSlug] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Load portfolio parameters into state
  const myPortfolio = portfolios[0];

  useEffect(() => {
    if (myPortfolio) {
      setSelectedTheme(myPortfolio.themeId);
      setSlug(myPortfolio.slug);
      setIsPublished(myPortfolio.isPublished);
    }
  }, [myPortfolio]);

  // Helper to map student profile to portfolio data structure
  const getAutoData = () => {
    if (!student) return {};
    return {
      name: student.user?.name || '',
      email: student.user?.email || '',
      phone: student.phone || '',
      location: student.department ? `${student.department}, Batch ${student.batch}` : '',
      website: student.website || student.linkedin || student.github || '',
      github: student.github || '',
      linkedin: student.linkedin || '',
      bio: student.bio || '',
      avatarUrl: student.user?.avatar || '',
      ctaText: 'Get in Touch',
      ctaUrl: student.user?.email ? `mailto:${student.user.email}` : '',
      tagline: 'Student at ' + (student.department || 'University'),
      education: student.educations?.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear.toString(),
        endYear: edu.endYear?.toString() || '',
        grade: edu.grade || '',
      })) || [],
      projects: student.projects?.map((proj) => ({
        title: proj.title,
        description: proj.description,
        techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack,
        repoUrl: proj.repoUrl || '',
        liveUrl: proj.liveUrl || '',
      })) || [],
      skills: student.skills?.map((s) => ({
        name: s.name,
        level: s.level,
      })) || [],
    };
  };

  // Auto initialize portfolio page if student profile exists but no portfolio record found
  useEffect(() => {
    const initializePortfolio = async () => {
      if (!isLoadingPortfolios && !isLoadingProfile && portfolios.length === 0 && student) {
        const defaultSlug = (student.user?.name || 'portfolio')
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-');

        const initialSlug = `${defaultSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        const initialData = getAutoData();

        try {
          await createPortfolio({
            title: `${student.user?.name || 'My'} Portfolio`,
            slug: initialSlug,
            themeId: 'minimalist',
            isPublished: true,
            data: initialData,
          });
        } catch (err) {
          console.error('Failed to auto-initialize portfolio:', err);
        }
      }
    };

    initializePortfolio();
  }, [isLoadingPortfolios, isLoadingProfile, portfolios, student]);

  // Design themes
  const templates = [
    {
      id: 'minimalist',
      name: 'Sleek Light',
      description: 'Clean, standard white backdrop with premium primary accents.',
      previewClass: 'bg-white border-slate-200 text-slate-800 font-sans',
    },
    {
      id: 'neon',
      name: 'Modern Dark',
      description: 'Deep slate backdrop with violet borders and glowing neon highlights.',
      previewClass: 'bg-slate-900 border-purple-900/50 text-purple-300 font-sans',
    },
    {
      id: 'dark-mode',
      name: 'Warm Minimalist',
      description: 'Luxurious charcoal gold theme with sleek amber highlights.',
      previewClass: 'bg-zinc-900 border-amber-900/50 text-amber-300 font-sans',
    },
    {
      id: 'emerald',
      name: 'Emerald Developer',
      description: 'Monospaced pure black developer style with matrix-green elements.',
      previewClass: 'bg-black border-emerald-950 text-emerald-400 font-mono',
    },
  ];

  // Public url path
  const publicSlug = slug || myPortfolio?.slug || 'slug';
  const publicUrl = `${window.location.protocol}//${window.location.host}/portfolio/public/${publicSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Public URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    if (!myPortfolio) return;
    try {
      await updatePortfolio({
        id: myPortfolio.id,
        data: {
          themeId,
        },
      });
      toast.success(`Theme updated to ${templates.find((t) => t.id === themeId)?.name}!`);
    } catch (err) {}
  };

  const handleSave = async () => {
    if (!myPortfolio) return;
    const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    try {
      await updatePortfolio({
        id: myPortfolio.id,
        data: {
          slug: sanitizedSlug,
          themeId: selectedTheme,
          isPublished,
        },
      });
    } catch (err) {}
  };

  const handleSyncProfile = async () => {
    if (!myPortfolio || !student) return;
    const freshData = getAutoData();
    try {
      await updatePortfolio({
        id: myPortfolio.id,
        data: {
          data: freshData,
        },
      });
      toast.success('Successfully synchronized portfolio with your profile details!');
    } catch (err) {}
  };

  if (isLoadingPortfolios || isLoadingProfile || (!myPortfolio && student)) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 mt-8">
        <LoadingSkeleton count={3} height="h-28" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-lg mx-auto mt-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-[hsl(var(--warning))]" />
        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Profile Not Completed</h3>
        <p className="text-sm text-[hsl(var(--text-secondary))]">
          You need to fill in your student profile details first before generating a personal portfolio website.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 flex flex-col min-h-[calc(100vh-6rem)] animate-in">
      
      {/* Header toolbar */}
      <div className="border-b border-[hsl(var(--border))] pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight">Portfolio Generator</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Host a public website showcasing your educational path, projects, and certifications.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Link box */}
          <div className="bg-[hsl(var(--muted))/0.5] border border-[hsl(var(--border))] px-3 py-2 rounded-lg text-[hsl(var(--text-secondary))] text-xs truncate max-w-full sm:max-w-xs md:max-w-md font-mono select-all flex-1 flex items-center">
            {publicUrl}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs flex-1 sm:flex-initial cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Link
                </>
              )}
            </button>

            <a
              href={`/portfolio/public/${myPortfolio?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" /> Live Site
            </a>
          </div>
        </div>
      </div>

      {/* Main configuration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left config side (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Theme picker card */}
          <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[hsl(var(--text-primary))] flex items-center gap-2">
              <Palette className="h-5 w-5 text-[hsl(var(--primary))]" /> Select Portfolio Design Template
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((temp) => (
                <div
                  key={temp.id}
                  onClick={() => handleThemeChange(temp.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-2xs flex flex-col justify-between h-32 ${
                    selectedTheme === temp.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.02)]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--text-muted))/0.3]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-[hsl(var(--text-primary))] block">{temp.name}</span>
                    <span className="text-xs text-[hsl(var(--text-secondary))] block leading-tight">{temp.description}</span>
                  </div>
                  <div className={`mt-3 h-6 w-full rounded border border-current/25 flex items-center px-2 text-[10px] font-bold ${temp.previewClass}`}>
                    Sample Text
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right config sidebar (1/3 width) */}
        <div className="space-y-6">
          
          {/* 2. Publishing configurations */}
          <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-base font-extrabold text-[hsl(var(--text-primary))]">Configurations</h2>
            
            <div className="space-y-4">
              {/* URL slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[hsl(var(--text-secondary))] uppercase tracking-wider">URL Path Slug</label>
                <div className="flex items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.3] overflow-hidden px-3 py-2 text-xs">
                  <span className="text-[hsl(var(--text-muted))] font-mono">/public/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    placeholder="john-doe"
                    className="bg-transparent border-none text-[hsl(var(--text-primary))] focus:outline-none font-mono font-bold flex-1 px-1"
                  />
                </div>
              </div>

              {/* Publish switch */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))/0.3] cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Publish Portfolio</span>
                  <p className="text-[10px] text-[hsl(var(--text-secondary))]">Toggle public link visibility</p>
                </div>
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
                />
              </label>

              {/* Verification badge status */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.1]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Approval Status</span>
                  <p className="text-[10px] text-[hsl(var(--text-secondary))]">Verified by Placement Officer</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                  myPortfolio?.isApproved
                    ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
                    : 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]'
                }`}>
                  {myPortfolio?.isApproved ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Approved
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                      Pending
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex flex-col gap-2.5 border-t border-[hsl(var(--border))] pt-4">
              <button
                onClick={handleSave}
                disabled={isUpdatingPortfolio}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isUpdatingPortfolio ? 'Saving...' : 'Save Configuration'}
              </button>

              <button
                onClick={handleSyncProfile}
                disabled={isUpdatingPortfolio}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] hover:bg-[hsl(var(--primary)/0.12)] border border-[hsl(var(--primary)/0.15)] rounded-lg transition-all cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                Sync Profile Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Frame wrapper containing sandbox live preview */}
      <div className="flex-1 bg-[hsl(var(--muted))/0.2] border border-[hsl(var(--border))] rounded-2xl p-4 flex flex-col min-h-[450px] relative">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[hsl(var(--border))]">
          <span className="text-[10px] text-[hsl(var(--text-secondary))] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Sandbox Live Preview Screen ({templates.find(t => t.id === selectedTheme)?.name})
          </span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]'
              }`}
            >
              Live Render
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] border border-[hsl(var(--border))]'
              }`}
            >
              JSON Structure
            </button>
          </div>
        </div>

        <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-4 flex-1 shadow-inner overflow-auto max-h-[550px]">
          {activeTab === 'preview' ? (
            <PortfolioPreview themeId={selectedTheme} data={myPortfolio?.data || getAutoData()} />
          ) : (
            <pre className="text-left font-mono text-[10px] text-[hsl(var(--text-secondary))] whitespace-pre-wrap select-all bg-[hsl(var(--muted))/0.1] p-3 rounded-lg border border-[hsl(var(--border))/0.4]">
              {JSON.stringify(myPortfolio?.data || getAutoData(), null, 2)}
            </pre>
          )}
        </div>
      </div>

    </div>
  );
}

export default PortfoliosPage;
