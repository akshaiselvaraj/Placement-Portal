import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ResumePreviewProps {
  templateId: string;
  data: any;
}

export function ResumePreview({ templateId, data }: ResumePreviewProps) {
  if (!data) return null;

  const {
    name = 'Your Full Name',
    email = 'email@example.com',
    phone = '(123) 456-7890',
    location = 'City, Country',
    website = 'https://example.com',
    bio = 'Enter a short summary about yourself here...',
    education = [],
    experience = [],
    projects = [],
    skills = [],
  } = data;

  const renderHeaderMinimal = () => (
    <div className="text-center space-y-2 border-b border-[hsl(var(--border))] pb-5">
      <h2 className="text-3xl font-extrabold text-[hsl(var(--text-primary))] uppercase tracking-wide">{name}</h2>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-[hsl(var(--text-secondary))] font-medium">
        {email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{email}</span>}
        {phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{phone}</span>}
        {location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>}
        {website && (
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">{website.replace(/(^\w+:|^)\/\//, '')}</a>
          </span>
        )}
      </div>
      {bio && <p className="text-xs text-[hsl(var(--text-secondary))] italic max-w-2xl mx-auto leading-relaxed">{bio}</p>}
    </div>
  );

  const renderHeaderModern = () => (
    <div className="bg-[hsl(var(--primary))] text-white p-6 rounded-t-xl space-y-3">
      <h2 className="text-3xl font-black tracking-tight">{name}</h2>
      {bio && <p className="text-xs text-white/80 leading-relaxed font-medium">{bio}</p>}
      <div className="flex flex-wrap gap-4 text-xs font-semibold pt-2 border-t border-white/20">
        {email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-white/70" />{email}</span>}
        {phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-white/70" />{phone}</span>}
        {location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-white/70" />{location}</span>}
        {website && (
          <span className="flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-white/70" />
            <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">{website.replace(/(^\w+:|^)\/\//, '')}</a>
          </span>
        )}
      </div>
    </div>
  );

  const renderHeaderClassical = () => (
    <div className="text-center space-y-1.5 border-b-2 border-black/80 pb-4 font-serif">
      <h2 className="text-4xl font-semibold tracking-wide text-black">{name}</h2>
      <div className="flex flex-wrap justify-center gap-3 text-xs text-black/80 font-medium">
        {email && <span>{email}</span>}
        {email && phone && <span>•</span>}
        {phone && <span>{phone}</span>}
        {phone && location && <span>•</span>}
        {location && <span>{location}</span>}
        {location && website && <span>•</span>}
        {website && <a href={website} target="_blank" rel="noopener noreferrer" className="underline">{website.replace(/(^\w+:|^)\/\//, '')}</a>}
      </div>
      {bio && <p className="text-xs text-black/70 italic leading-relaxed pt-1.5 max-w-xl mx-auto">{bio}</p>}
    </div>
  );

  // Resume Body Rendering per template
  if (templateId === 'minimal') {
    return (
      <div className="bg-white p-8 border border-[hsl(var(--border))] rounded-xl shadow-xs text-left text-black font-sans space-y-6 max-w-200 mx-auto min-h-250">
        {renderHeaderMinimal()}

        {/* Education */}
        {education.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--primary))] border-b border-[hsl(var(--border))] pb-1">Education</h3>
            <div className="space-y-4">
              {education.map((edu: any, i: number) => (
                <div key={i} className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold">{edu.institution}</h4>
                    <p className="text-[hsl(var(--text-secondary))]">{edu.degree} — {edu.field}</p>
                  </div>
                  <div className="text-right text-[hsl(var(--text-secondary))] font-medium">
                    <p>{edu.startYear} - {edu.endYear || 'Present'}</p>
                    <p className="font-bold text-[hsl(var(--primary))]">{edu.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--primary))] border-b border-[hsl(var(--border))] pb-1">Experience</h3>
            <div className="space-y-4">
              {experience.map((exp: any, i: number) => (
                <div key={i} className="text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{exp.designation}</h4>
                      <p className="text-[hsl(var(--text-secondary))] font-medium">{exp.company}</p>
                    </div>
                    <span className="text-[hsl(var(--text-secondary))] font-semibold">{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed whitespace-pre-line">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--primary))] border-b border-[hsl(var(--border))] pb-1">Projects</h3>
            <div className="space-y-4">
              {projects.map((proj: any, i: number) => (
                <div key={i} className="text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">{proj.title}</h4>
                    {proj.repoUrl && <span className="text-[10px] text-[hsl(var(--text-muted))]">{proj.repoUrl}</span>}
                  </div>
                  {proj.description && <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{proj.description}</p>}
                  {proj.techStack && (
                    <p className="text-[10px] text-[hsl(var(--primary))] font-semibold">
                      Tech Stack: {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--primary))] border-b border-[hsl(var(--border))] pb-1">Skills</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {skills.map((skill: any, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--text-primary))] font-semibold">
                  {skill.name} ({skill.level})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (templateId === 'modern') {
    return (
      <div className="bg-white border border-[hsl(var(--border))] rounded-xl shadow-xs text-left text-black font-sans max-w-200 mx-auto min-h-250 flex flex-col justify-between overflow-hidden">
        <div>
          {renderHeaderModern()}

          {/* Grid two columns */}
          <div className="grid grid-cols-3 gap-6 p-6">
            {/* Left Col (Skills + Education) */}
            <div className="col-span-1 space-y-6 border-r border-[hsl(var(--border))/0.6] pr-4">
              {/* Skills */}
              {skills.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--primary))] pb-1 border-b border-[hsl(var(--primary)/0.2)]">Skills</h3>
                  <div className="space-y-2">
                    {skills.map((skill: any, i: number) => (
                      <div key={i} className="text-xs font-semibold">
                        <p className="text-[hsl(var(--text-primary))]">{skill.name}</p>
                        <p className="text-[10px] text-[hsl(var(--text-muted))] uppercase tracking-wider font-bold mt-0.5">{skill.level}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--primary))] pb-1 border-b border-[hsl(var(--primary)/0.2)]">Education</h3>
                  <div className="space-y-4">
                    {education.map((edu: any, i: number) => (
                      <div key={i} className="text-xs font-medium space-y-1">
                        <h4 className="font-bold text-[hsl(var(--text-primary))]">{edu.institution}</h4>
                        <p className="text-[11px] text-[hsl(var(--text-secondary))]">{edu.degree}</p>
                        <p className="text-[10px] text-[hsl(var(--text-muted))]">{edu.startYear} - {edu.endYear || 'Present'}</p>
                        <p className="text-[10px] text-[hsl(var(--primary))] font-bold">Grade: {edu.grade}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col (Experience + Projects) */}
            <div className="col-span-2 space-y-6">
              {/* Experience */}
              {experience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--primary))] pb-1 border-b border-[hsl(var(--primary)/0.2)]">Experience</h3>
                  <div className="space-y-4">
                    {experience.map((exp: any, i: number) => (
                      <div key={i} className="text-xs space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-[hsl(var(--text-primary))]">{exp.designation}</h4>
                          <span className="text-[10px] text-[hsl(var(--text-muted))] font-bold">{exp.duration}</span>
                        </div>
                        <p className="text-[11px] text-[hsl(var(--text-secondary))] font-bold">{exp.company}</p>
                        {exp.description && <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed whitespace-pre-line mt-1">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[hsl(var(--primary))] pb-1 border-b border-[hsl(var(--primary)/0.2)]">Projects</h3>
                  <div className="space-y-4">
                    {projects.map((proj: any, i: number) => (
                      <div key={i} className="text-xs space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-[hsl(var(--text-primary))]">{proj.title}</h4>
                          {proj.repoUrl && <span className="text-[9px] text-[hsl(var(--text-muted))] truncate max-w-xs">{proj.repoUrl}</span>}
                        </div>
                        {proj.description && <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{proj.description}</p>}
                        {proj.techStack && (
                          <p className="text-[10px] text-[hsl(var(--primary))] font-bold mt-0.5">
                            Tech Stack: {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[hsl(var(--muted))/0.2] py-4 px-6 text-center text-[10px] text-[hsl(var(--text-muted))] font-bold border-t border-[hsl(var(--border))/0.4]">
          Generated via Placement Management Portal Resume Builder
        </div>
      </div>
    );
  }

  // Classical (serif)
  return (
    <div className="bg-white p-8 border border-[hsl(var(--border))] rounded-xl shadow-xs text-left text-black font-serif space-y-6 max-w-200 mx-auto min-h-250">
      {renderHeaderClassical()}

      {/* Education */}
      {education.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 font-serif">Education</h3>
          <div className="space-y-3">
            {education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between items-start text-xs font-serif">
                <div>
                  <h4 className="font-bold text-black">{edu.institution}</h4>
                  <p className="text-black/80">{edu.degree} in {edu.field}</p>
                </div>
                <div className="text-right text-black/85 font-medium">
                  <p>{edu.startYear} - {edu.endYear || 'Present'}</p>
                  <p className="font-bold">GPA: {edu.grade}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 font-serif">Professional Experience</h3>
          <div className="space-y-4">
            {experience.map((exp: any, i: number) => (
              <div key={i} className="text-xs font-serif space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-black">{exp.designation}</h4>
                    <p className="text-black/80 italic">{exp.company}</p>
                  </div>
                  <span className="text-black/80 font-bold">{exp.duration}</span>
                </div>
                {exp.description && <p className="text-[11px] text-black/75 leading-relaxed whitespace-pre-line">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 font-serif">Projects & Research</h3>
          <div className="space-y-3">
            {projects.map((proj: any, i: number) => (
              <div key={i} className="text-xs font-serif space-y-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-bold text-black">{proj.title}</h4>
                  {proj.repoUrl && <span className="text-[10px] text-black/60 italic">{proj.repoUrl}</span>}
                </div>
                {proj.description && <p className="text-[11px] text-black/75 leading-relaxed">{proj.description}</p>}
                {proj.techStack && (
                  <p className="text-[10px] text-black/80 font-semibold italic">
                    Technologies: {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black border-b border-black pb-0.5 font-serif">Technical Skills</h3>
          <p className="text-xs text-black/85 leading-relaxed font-serif">
            {skills.map((s: any) => `${s.name} (${s.level})`).join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default ResumePreview;
