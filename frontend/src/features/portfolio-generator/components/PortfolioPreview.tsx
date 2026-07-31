import { Mail, Phone, MapPin, Globe, ExternalLink } from 'lucide-react';
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
  } = data;

  // Determine theme styles
  let bgClass = 'bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]';
  let cardClass = 'bg-[hsl(var(--muted))/0.1] border border-[hsl(var(--border))]';
  let accentText = 'text-[hsl(var(--primary))]';
  let buttonClass = 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))]';

  if (themeId === 'neon') {
    bgClass = 'bg-slate-950 text-slate-100';
    cardClass = 'bg-slate-900/60 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.05)]';
    accentText = 'text-purple-400 font-extrabold shadow-purple-500/10 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]';
    buttonClass = 'bg-purple-600 text-white hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
  } else if (themeId === 'emerald') {
    bgClass = 'bg-stone-950 text-stone-100';
    cardClass = 'bg-stone-900/80 border border-emerald-500/20';
    accentText = 'text-emerald-400 font-bold';
    buttonClass = 'bg-emerald-600 text-white hover:bg-emerald-750';
  } else if (themeId === 'dark-mode') {
    bgClass = 'bg-zinc-950 text-zinc-100';
    cardClass = 'bg-zinc-900 border border-amber-500/20';
    accentText = 'text-amber-400 font-semibold';
    buttonClass = 'bg-amber-600 text-zinc-950 hover:bg-amber-500 font-bold';
  }

  return (
    <div className={`w-full rounded-2xl overflow-hidden min-h-187.5 p-6 sm:p-10 transition-all ${bgClass} space-y-12 text-left`}>
      {/* Hero / Header banner */}
      <div className="space-y-4 pb-8 border-b border-[hsl(var(--border))/0.4]">
        <span className={`text-xs uppercase tracking-widest font-black ${accentText}`}>
          Portfolio Welcome
        </span>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">{name}</h2>
        <p className="text-base sm:text-lg text-[hsl(var(--text-secondary))] font-medium">
          {tagline}
        </p>

        {bio && (
          <p className="text-sm leading-relaxed max-w-3xl text-[hsl(var(--text-secondary))] pt-2">
            {bio}
          </p>
        )}

        {/* Contact bar */}
        <div className="flex flex-wrap gap-4 pt-4 text-xs font-semibold">
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

        {/* Social Link Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--muted))] text-xs font-bold transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </a>
          )}
        </div>
      </div>

      {/* Projects Showcase */}
      {projects.length > 0 && (
        <div className="space-y-6">
          <h3 className={`text-lg font-black uppercase tracking-wider ${accentText}`}>
            Showcased Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj: any, idx: number) => (
              <div key={idx} className={`p-6 rounded-2xl ${cardClass} flex flex-col justify-between space-y-4`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-extrabold text-sm tracking-tight">{proj.title}</h4>
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-[hsl(var(--text-muted))] hover:${accentText}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-3">
                      {proj.description}
                    </p>
                  )}
                </div>

                {proj.techStack && (
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${accentText}`}>
                    Stack: {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills cloud */}
      {skills.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-lg font-black uppercase tracking-wider ${accentText}`}>
            Core Capabilities
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill: any, idx: number) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-[hsl(var(--border))/0.4] bg-[hsl(var(--surface))] shadow-xs"
              >
                {skill.name} <span className={`ml-1 text-[10px] opacity-70 ${accentText}`}>{skill.level}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education timeline */}
      {education.length > 0 && (
        <div className="space-y-6">
          <h3 className={`text-lg font-black uppercase tracking-wider ${accentText}`}>
            Academic Background
          </h3>
          <div className="space-y-4 pl-4 border-l-2 border-[hsl(var(--border))/0.6]">
            {education.map((edu: any, idx: number) => (
              <div key={idx} className="relative space-y-1">
                <div className="absolute -left-5.25 top-1.5 w-2 h-2 rounded-full bg-[hsl(var(--primary))]" />
                <div className="flex flex-wrap justify-between items-baseline gap-2">
                  <h4 className="font-bold text-sm">{edu.institution}</h4>
                  <span className="text-xs text-[hsl(var(--text-muted))] font-bold">
                    {edu.startYear} - {edu.endYear || 'Present'}
                  </span>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  {edu.degree} — {edu.field}
                </p>
                {edu.grade && (
                  <p className={`text-[10px] font-bold ${accentText}`}>Grade: {edu.grade}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioPreview;
