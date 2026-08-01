import { Mail, Phone, MapPin, Globe, ExternalLink, GraduationCap, Award, FolderGit2, ChevronRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Github, Linkedin } from '@/components/common';

interface PortfolioPreviewProps {
  themeId: string;
  data: any;
}

export function PortfolioPreview({ themeId, data }: PortfolioPreviewProps) {
  if (!data) return null;

  const {
    name = 'Your Full Name',
    tagline = 'Full Stack Developer',
    email = 'email@example.com',
    phone = '',
    location = '',
    website = '',
    github = '',
    linkedin = '',
    bio = 'Tell your story here...',
    projects = [],
    education = [],
    skills = [],
    avatarUrl = '',
    ctaText = 'Get in Touch',
    ctaUrl = '',
  } = data;

  // Theme styling configuration
  const themes: Record<string, {
    bg: string;
    text: string;
    textMuted: string;
    header: string;
    navLinkHover: string;
    title: string;
    accent: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    card: string;
    cardBorder: string;
    cardTitle: string;
    badge: string;
    badgeText: string;
    btnPrimary: string;
    btnSecondary: string;
    fontFamily: string;
    initialsFrame: string;
    divider: string;
    timelineDot: string;
  }> = {
    neon: {
      bg: 'bg-slate-950 text-slate-100 pb-20',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      header: 'sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900',
      navLinkHover: 'hover:text-purple-400 hover:shadow-[0_0_8px_rgba(168,85,247,0.4)]',
      title: 'text-white',
      accent: 'text-purple-400 font-extrabold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]',
      accentBg: 'bg-purple-500/10',
      accentBorder: 'border-purple-500/25',
      accentText: 'text-purple-400',
      card: 'bg-slate-900/60 border border-purple-500/10 hover:border-purple-500/30 rounded-2xl p-6 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.1)]',
      cardBorder: 'border-slate-900',
      cardTitle: 'text-white',
      badge: 'bg-purple-950/40 text-purple-300 border border-purple-500/20',
      badgeText: 'text-purple-300',
      btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20',
      btnSecondary: 'border border-slate-800 hover:bg-slate-900 text-white',
      fontFamily: 'font-sans',
      initialsFrame: 'bg-slate-900 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
      divider: 'border-purple-500/10',
      timelineDot: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    },
    minimalist: {
      bg: 'bg-slate-50 text-slate-850 pb-20',
      text: 'text-slate-850',
      textMuted: 'text-slate-500',
      header: 'sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-900',
      navLinkHover: 'hover:text-indigo-650',
      title: 'text-slate-900',
      accent: 'text-indigo-600',
      accentBg: 'bg-indigo-50',
      accentBorder: 'border-indigo-100',
      accentText: 'text-indigo-650',
      card: 'bg-white border border-slate-200 hover:border-indigo-500/30 rounded-2xl p-6 transition-all hover:shadow-md',
      cardBorder: 'border-slate-200',
      cardTitle: 'text-slate-900',
      badge: 'bg-slate-100 text-slate-600 border border-slate-200/50',
      badgeText: 'text-slate-600',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10',
      btnSecondary: 'border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white',
      fontFamily: 'font-sans',
      initialsFrame: 'bg-white border-slate-250 text-indigo-600 shadow-sm',
      divider: 'border-slate-200',
      timelineDot: 'bg-indigo-600',
    },
    'dark-mode': {
      bg: 'bg-zinc-950 text-zinc-100 pb-20',
      text: 'text-zinc-100',
      textMuted: 'text-zinc-450',
      header: 'sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900',
      navLinkHover: 'hover:text-amber-400',
      title: 'text-white',
      accent: 'text-amber-400 font-semibold',
      accentBg: 'bg-amber-500/10',
      accentBorder: 'border-amber-500/25',
      accentText: 'text-amber-400',
      card: 'bg-zinc-900 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl p-6 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]',
      cardBorder: 'border-zinc-900',
      cardTitle: 'text-white',
      badge: 'bg-amber-950/40 text-amber-300 border border-amber-500/20',
      badgeText: 'text-amber-300',
      btnPrimary: 'bg-amber-600 text-zinc-950 hover:bg-amber-505 font-bold shadow-lg shadow-amber-600/20',
      btnSecondary: 'border border-zinc-800 hover:bg-zinc-900 text-white',
      fontFamily: 'font-sans',
      initialsFrame: 'bg-zinc-900 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      divider: 'border-amber-500/10',
      timelineDot: 'bg-amber-500',
    },
    emerald: {
      bg: 'bg-black text-emerald-400 font-mono pb-20',
      text: 'text-emerald-400',
      textMuted: 'text-emerald-600',
      header: 'sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-emerald-950 text-emerald-400',
      navLinkHover: 'hover:text-white hover:bg-emerald-950/50 px-2 py-1 rounded',
      title: 'text-white font-mono',
      accent: 'text-emerald-400',
      accentBg: 'bg-emerald-950/20',
      accentBorder: 'border-emerald-800/30',
      accentText: 'text-emerald-500',
      card: 'bg-black border border-emerald-950 hover:border-emerald-700/50 rounded-lg p-6 transition-all',
      cardBorder: 'border-emerald-950',
      cardTitle: 'text-white font-bold',
      badge: 'bg-emerald-950/40 text-emerald-500 border border-emerald-950/60',
      badgeText: 'text-emerald-500',
      btnPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-lg shadow-md shadow-emerald-500/10',
      btnSecondary: 'border border-emerald-800 hover:bg-emerald-950 text-emerald-400 px-6 py-3 rounded-lg bg-black',
      fontFamily: 'font-mono',
      initialsFrame: 'bg-black border-emerald-950 text-emerald-450 rounded-lg',
      divider: 'border-emerald-950',
      timelineDot: 'bg-emerald-500',
    },
  };

  const style = themes[themeId] || themes.minimalist;

  // Get name initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className={`w-full min-h-screen text-left transition-colors duration-300 ${style.bg} ${style.fontFamily}`}>
      
      {/* 1. Header Navbar */}
      <header className={style.header}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className={`h-6 w-6 ${style.accent}`} />
            <span className={`font-bold text-base tracking-tight ${style.title}`}>Student Portfolio</span>
          </div>
          <nav className={`hidden sm:flex items-center gap-6 text-sm font-semibold ${style.textMuted}`}>
            <a href="#about" className={`transition-all ${style.navLinkHover}`}>About</a>
            {education.length > 0 && <a href="#academics" className={`transition-all ${style.navLinkHover}`}>Academics</a>}
            {projects.length > 0 && <a href="#projects" className={`transition-all ${style.navLinkHover}`}>Projects</a>}
            {skills.length > 0 && <a href="#skills" className={`transition-all ${style.navLinkHover}`}>Capabilities</a>}
          </nav>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
        <div className="md:col-span-2 space-y-6">
          <div className={`${style.accentBg} border ${style.accentBorder} ${style.accentText} text-[10px] font-bold px-3 py-1 rounded-full uppercase w-fit tracking-wider`}>
            Available for Opportunity
          </div>
          <h1 className={`text-4xl sm:text-6xl font-black ${style.title} tracking-tight leading-none`}>
            Hi, I'm <span className={style.accent}>{name}</span>
          </h1>
          <p className={`text-base sm:text-lg ${style.textMuted} leading-relaxed max-w-2xl`}>
            {tagline}. Currently seeking full-time placements or internship options to solve core computational challenges and build scalable experiences.
          </p>
          {bio && (
            <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))] max-w-2xl">
              {bio}
            </p>
          )}

          {/* Social info details bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold">
            {email && (
              <span className="flex items-center gap-1.5 text-[hsl(var(--text-secondary))]">
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1.5 text-[hsl(var(--text-secondary))]">
                <Phone className="h-4 w-4 shrink-0" />
                {phone}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5 text-[hsl(var(--text-secondary))]">
                <MapPin className="h-4 w-4 shrink-0" />
                {location}
              </span>
            )}
          </div>

          {/* Social Links and Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {ctaText && ctaUrl && (
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${style.btnPrimary}`}
              >
                {ctaText} <ChevronRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Logo Initials Frame on the right */}
        <div className="flex justify-center md:justify-end">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-48 w-48 rounded-3xl object-cover border-2 border-[hsl(var(--border))] shadow-xl hover:scale-105 transition-transform"
            />
          ) : (
            <div className={`h-48 w-48 rounded-3xl border-2 flex items-center justify-center font-black text-6xl shadow-2xl relative overflow-hidden group transition-transform hover:scale-105 ${style.initialsFrame}`}>
              {themeId === 'neon' && <div className="absolute inset-0 bg-gradient-to-tr from-purple-650/20 to-transparent group-hover:opacity-0 transition-opacity" />}
              {initials}
            </div>
          )}
        </div>
      </section>

      {/* Main Details sections container */}
      <div className="max-w-6xl mx-auto px-6 space-y-20 pt-8">
        
        {/* 3. Academics Info */}
        {education.length > 0 && (
          <section id="academics" className="space-y-6">
            <h2 className={`text-2xl font-black ${style.title} flex items-center gap-2 border-b ${style.divider} pb-3`}>
              <GraduationCap className={style.accent} /> Education & Academics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {education.map((edu: any, idx: number) => (
                <div key={idx} className={style.card}>
                  <span className={`${style.textMuted} text-[10px] font-bold uppercase tracking-wider block mb-1`}>
                    {edu.degree} — {edu.field}
                  </span>
                  <h3 className={`text-base font-extrabold ${style.cardTitle} mb-3`}>{edu.institution}</h3>
                  <div className="flex justify-between items-center pt-2.5 border-t border-[hsl(var(--border))/0.4]">
                    <span className={`text-sm font-black ${style.accent}`}>
                      {edu.grade ? `Score: ${edu.grade}` : 'N/A'}
                    </span>
                    <span className={`text-[10px] ${style.textMuted} font-bold`}>
                      Class of {edu.endYear || 'Present'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Projects Showcase */}
        {projects.length > 0 && (
          <section id="projects" className="space-y-6">
            <h2 className={`text-2xl font-black ${style.title} flex items-center gap-2 border-b ${style.divider} pb-3`}>
              <BookOpen className={style.accent} /> Engineering Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj: any, idx: number) => (
                <div key={idx} className={`${style.card} flex flex-col justify-between group`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-extrabold text-base ${style.cardTitle} group-hover:${style.accent} transition-colors`}>
                        {proj.title}
                      </h3>
                      <div className="flex gap-2 shrink-0">
                        {proj.repoUrl && (
                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`${style.textMuted} hover:${style.accent}`}
                          >
                            <ExternalLink className="h-4.5 w-4.5" />
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.description && (
                      <p className={`${style.textMuted} text-xs leading-relaxed`}>
                        {proj.description}
                      </p>
                    )}
                  </div>

                  {/* Tech stack tags */}
                  {proj.techStack && (
                    <div className="flex flex-wrap gap-1.5 mt-6 border-t border-current/10 pt-3.5">
                      {(Array.isArray(proj.techStack) ? proj.techStack : String(proj.techStack).split(','))
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                        .map((t: string) => (
                          <span key={t} className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${style.badge}`}>
                            {t}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Skills & Capabilities */}
        {skills.length > 0 && (
          <section id="skills" className="space-y-6">
            <h2 className={`text-2xl font-black ${style.title} flex items-center gap-2 border-b ${style.divider} pb-3`}>
              <Award className={style.accent} /> Core Capabilities
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill: any, idx: number) => (
                <span
                  key={idx}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 border ${style.badge}`}
                >
                  <span className={style.cardTitle}>{skill.name}</span>
                  {skill.level && (
                    <span className={`text-[9px] tracking-wider font-semibold uppercase px-1 py-0.5 rounded ${style.accentBg} ${style.accentText}`}>
                      {skill.level.substring(0, 3)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}

export default PortfolioPreview;
