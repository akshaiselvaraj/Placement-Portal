import { useRef, useState, useEffect } from 'react';
import { useStudentProfile } from '@/features/student/hooks/useStudentProfile';
import { ResumeForm } from '../components/ResumeForm';
import { LoadingSkeleton } from '@/components/common';
import {
  FileText,
  Printer,
  User,
  GraduationCap,
  Award,
  AlertCircle,
  Sparkles,
  Edit,
} from 'lucide-react';

const defaultResumeData = {
  name: '',
  email: '',
  phone: '',
  website: '',
  bio: '',
  location: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
};

export function ResumesPage() {
  const { student, isLoading } = useStudentProfile();
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'creative' | 'corporate'>('classic');
  const [manualData, setManualData] = useState<any>(defaultResumeData);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Sync default values when student profile is loaded
  useEffect(() => {
    if (student) {
      setManualData({
        name: student.user?.name || '',
        email: student.user?.email || '',
        phone: student.phone || '',
        website: student.website || '',
        bio: student.bio || '',
        location: student.department || '',
        education: student.educations?.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.startYear.toString(),
          endYear: edu.endYear?.toString() || '',
          grade: edu.grade || '',
        })) || [],
        experience: [],
        projects: student.projects?.map((proj) => ({
          title: proj.title,
          description: proj.description,
          techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack,
          repoUrl: proj.repoUrl || '',
        })) || [],
        skills: student.skills?.map((s) => ({
          name: s.name,
          level: s.level,
        })) || [],
      });
    }
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
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
          You need to fill in your student profile details first before you can compile a resume.
        </p>
      </div>
    );
  }

  // Derive resume details based on manual vs automatic mode
  const resumeDetails = mode === 'auto'
    ? {
        name: student.user?.name || '',
        email: student.user?.email || '',
        phone: student.phone || '',
        website: student.website || '',
        bio: student.bio || '',
        educations: student.educations || [],
        experience: [], // no career experience in student profile directly
        projects: student.projects || [],
        skills: student.skills || [],
        certifications: student.certifications || [],
      }
    : {
        name: manualData.name || '',
        email: manualData.email || '',
        phone: manualData.phone || '',
        website: manualData.website || '',
        bio: manualData.bio || '',
        educations: (manualData.education || []).map((edu: any, i: number) => ({
          id: String(i),
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startYear: edu.startYear,
          endYear: edu.endYear,
          grade: edu.grade,
        })),
        experience: (manualData.experience || []).map((exp: any, i: number) => ({
          id: String(i),
          role: exp.role,
          companyName: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        })),
        projects: (manualData.projects || []).map((proj: any, i: number) => ({
          id: String(i),
          title: proj.title,
          description: proj.description,
          techStack: proj.techStack,
          repoUrl: proj.repoUrl,
        })),
        skills: (manualData.skills || []).map((s: any, i: number) => ({
          id: String(i),
          name: s.name,
          level: s.level,
        })),
        certifications: [], // manual fields don't edit certifications tab directly
      };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in">
      {/* Self-contained print stylesheet */}
      <style>{`
        @media print {
          /* Hide everything on the page */
          body * {
            visibility: hidden !important;
          }
          /* Show only the resume content */
          #printable-resume, #printable-resume * {
            visibility: visible !important;
          }
          #printable-resume {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 794px !important;
            min-height: 1123px !important;
            margin: 0 !important;
            padding: 48px !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Header toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[hsl(var(--border))] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[hsl(var(--text-primary))] tracking-tight">Professional Resume Builder</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Compile and print a clean resume compiled from your verified profile metrics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Automatic vs Manual Mode Toggle */}
          <div className="flex bg-[hsl(var(--muted))/0.5] p-1 rounded-xl border border-[hsl(var(--border))]">
            <button
              onClick={() => setMode('auto')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'auto'
                  ? 'bg-[hsl(var(--surface))] text-[hsl(var(--primary))] shadow-xs'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 inline mr-1" />
              Automatic
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'manual'
                  ? 'bg-[hsl(var(--surface))] text-[hsl(var(--primary))] shadow-xs'
                  : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              <Edit className="h-3.5 w-3.5 inline mr-1" />
              Manual
            </button>
          </div>

          {/* Template Selector dropdown */}
          <select
            className="px-3.5 py-2.5 border border-[hsl(var(--border))] rounded-lg text-xs bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] font-bold cursor-pointer transition-all"
            value={template}
            onChange={(e) => setTemplate(e.target.value as any)}
          >
            <option value="classic">Classic Traditional</option>
            <option value="modern">Modern Split-Column</option>
            <option value="creative">Creative Bold (Sidebar)</option>
            <option value="corporate">Professional Corporate</option>
          </select>

          <button
            onClick={handlePrint}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Editor & Preview Split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Config Panel */}
        <div className="lg:col-span-1">
          {mode === 'auto' ? (
            <div className="bg-[hsl(var(--surface))] p-6 rounded-2xl border border-[hsl(var(--border))] shadow-2xs space-y-6">
              <h3 className="font-bold text-[hsl(var(--text-primary))] text-base">Resume Content Sources</h3>
              <div className="space-y-4 text-xs font-semibold text-[hsl(var(--text-secondary))]">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <span>Personal: <strong className="text-[hsl(var(--text-primary))]">{student.user?.name}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <span>Academics: <strong className="text-[hsl(var(--text-primary))]">{student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'} CGPA</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <span>Certifications: <strong className="text-[hsl(var(--text-primary))]">{student.certifications?.length || 0} items</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <span>Projects: <strong className="text-[hsl(var(--text-primary))]">{student.projects?.length || 0} items</strong></span>
                </div>
              </div>
              <div className="bg-[hsl(var(--muted))/0.3] p-4 rounded-xl border border-[hsl(var(--border))] text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                * Automatic Mode retrieves details directly from your profile settings. Modify dashboard stats to alter this layout.
              </div>
            </div>
          ) : (
            <ResumeForm data={manualData} onChange={setManualData} />
          )}
        </div>

        {/* Right Side: Print Canvas container */}
        <div className="lg:col-span-2 bg-slate-200 p-4 sm:p-8 rounded-2xl flex justify-center overflow-auto max-h-[80vh] border border-slate-350 shadow-inner">
          {/* Printable wrapper */}
          <div
            ref={resumeRef}
            id="printable-resume"
            className={`w-[794px] min-h-[1123px] bg-white shadow-2xl flex flex-col text-slate-800 font-sans print:shadow-none print:p-8 ${
              template === 'creative' ? 'p-0 overflow-hidden' : 'p-12'
            }`}
          >
            {/* Template 1: CLASSIC TRADITIONAL */}
            {template === 'classic' && (
              <div className="space-y-6 text-xs leading-normal text-left flex-1">
                {/* Header */}
                <div className="text-center space-y-1.5 border-b border-slate-300 pb-4">
                  <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900">{resumeDetails.name}</h2>
                  <p className="text-slate-500 font-medium flex justify-center gap-3">
                    {resumeDetails.phone && <span>{resumeDetails.phone}</span>}
                    {resumeDetails.phone && <span>|</span>}
                    <span>{resumeDetails.email}</span>
                    {resumeDetails.website && <span>|</span>}
                    {resumeDetails.website && <span className="underline">{resumeDetails.website}</span>}
                  </p>
                </div>

                {/* Education */}
                {resumeDetails.educations && resumeDetails.educations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Academic Background
                    </h3>
                    <div className="space-y-3">
                      {resumeDetails.educations.map((edu: any) => (
                        <div key={edu.id} className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{edu.institution}</h4>
                            <p className="text-slate-600 font-medium">{edu.degree} — {edu.field}</p>
                            {edu.grade && <p className="text-slate-550 font-medium text-[11px]">Score / CGPA: {edu.grade}</p>}
                          </div>
                          <span className="font-semibold text-slate-500">{edu.startYear} - {edu.endYear || 'Present'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience (Manual mode only) */}
                {resumeDetails.experience && resumeDetails.experience.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Professional Experience
                    </h3>
                    <div className="space-y-4">
                      {resumeDetails.experience.map((exp: any) => (
                        <div key={exp.id} className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900">{exp.role}</h4>
                            <p className="text-slate-600 font-medium">{exp.companyName}</p>
                            {exp.description && <p className="text-slate-550 mt-1">{exp.description}</p>}
                          </div>
                          <span className="font-semibold text-slate-500">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeDetails.projects && resumeDetails.projects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Key Engineering Projects
                    </h3>
                    <div className="space-y-4">
                      {resumeDetails.projects.map((proj: any) => (
                        <div key={proj.id} className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900">{proj.title}</h4>
                            {proj.repoUrl && (
                              <span className="text-[10px] text-slate-450 font-mono">{proj.repoUrl}</span>
                            )}
                          </div>
                          <p className="text-slate-650">{proj.description}</p>
                          {proj.techStack && (
                            <p className="text-[10px] font-bold text-slate-600">
                              Technologies: {proj.techStack}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeDetails.skills && resumeDetails.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Skills & Expertise
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {resumeDetails.skills.map((s: any) => `${s.name}${s.level ? ` (${s.level.toLowerCase()})` : ''}`).join(', ')}
                    </p>
                  </div>
                )}

                {/* Certifications (Auto mode only) */}
                {resumeDetails.certifications && resumeDetails.certifications.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                      Certifications & Accolades
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {resumeDetails.certifications.map((c: any) => (
                        <div key={c.id}>
                          <h4 className="font-bold text-slate-900">{c.name}</h4>
                          <p className="text-slate-600 font-medium">Issuer: {c.issuer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template 2: MODERN SPLIT-COLUMN */}
            {template === 'modern' && (
              <div className="grid grid-cols-3 gap-8 text-[11px] leading-normal flex-1 text-left">
                {/* Left Column */}
                <div className="col-span-1 border-r border-slate-200 pr-6 space-y-6">
                  {/* Info */}
                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-slate-900 uppercase leading-tight">{resumeDetails.name}</h2>
                    <p className="text-slate-500 font-semibold break-all">{resumeDetails.email}</p>
                    {resumeDetails.phone && <p className="text-slate-500 font-semibold">{resumeDetails.phone}</p>}
                    {resumeDetails.website && <p className="text-slate-500 font-semibold break-all text-[9.5px]">{resumeDetails.website}</p>}
                  </div>

                  {/* Academics CGPA */}
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 uppercase text-xs">Academics</h3>
                    <p className="font-bold text-blue-600 text-lg">{student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'} CGPA</p>
                    <p className="text-slate-500 text-[10px]">{student.department}</p>
                  </div>

                  {/* Skills List */}
                  {resumeDetails.skills && resumeDetails.skills.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-slate-900 uppercase text-xs">Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeDetails.skills.map((s: any) => (
                          <span key={s.id} className="bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications (Auto mode only) */}
                  {resumeDetails.certifications && resumeDetails.certifications.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-slate-900 uppercase text-xs">Credentials</h3>
                      <div className="space-y-2 text-[10px]">
                        {resumeDetails.certifications.map((c: any) => (
                          <div key={c.id}>
                            <p className="font-bold text-slate-800">{c.name}</p>
                            <p className="text-slate-500">{c.issuer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="col-span-2 space-y-6">
                  {/* Education */}
                  {resumeDetails.educations && resumeDetails.educations.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-slate-900 uppercase text-xs border-b-2 border-blue-600 pb-1 w-fit">
                        Education
                      </h3>
                      <div className="space-y-3">
                        {resumeDetails.educations.map((edu: any) => (
                          <div key={edu.id} className="space-y-0.5">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900">{edu.institution}</h4>
                              <span className="text-[10px] text-slate-400 font-semibold">{edu.startYear} - {edu.endYear || 'Present'}</span>
                            </div>
                            <p className="text-slate-655">{edu.degree} in {edu.field}</p>
                            {edu.grade && <p className="text-[10px] font-bold text-blue-600">Grade: {edu.grade}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience (Manual mode only) */}
                  {resumeDetails.experience && resumeDetails.experience.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-slate-900 uppercase text-xs border-b-2 border-blue-600 pb-1 w-fit">
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {resumeDetails.experience.map((exp: any) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900">{exp.role}</h4>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </span>
                            </div>
                            <p className="text-slate-600 font-bold">{exp.companyName}</p>
                            {exp.description && <p className="text-slate-500 mt-1">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeDetails.projects && resumeDetails.projects.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-slate-900 uppercase text-xs border-b-2 border-blue-600 pb-1 w-fit">
                        Projects
                      </h3>
                      <div className="space-y-4">
                        {resumeDetails.projects.map((proj: any) => (
                          <div key={proj.id} className="space-y-1">
                            <h4 className="font-bold text-slate-900">{proj.title}</h4>
                            <p className="text-slate-500 text-[10.5px] leading-relaxed">{proj.description}</p>
                            {proj.techStack && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(Array.isArray(proj.techStack) ? proj.techStack : String(proj.techStack).split(','))
                                  .map((t: string) => (
                                    <span key={t} className="bg-slate-100 text-slate-650 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                      {t.trim()}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template 3: CREATIVE BOLD (SIDEBAR Layout) */}
            {template === 'creative' && (
              <div className="flex flex-1 text-slate-800 text-[11px] leading-normal min-h-[1123px] text-left">
                {/* Left Sidebar */}
                <div className="w-1/3 bg-slate-900 text-slate-200 p-8 flex flex-col gap-6">
                  <div className="space-y-2 border-b border-slate-800 pb-6">
                    <h2 className="text-xl font-extrabold text-white uppercase tracking-tight leading-tight">{resumeDetails.name}</h2>
                    <p className="text-blue-400 font-bold text-xs">{student.department}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold tracking-wider uppercase text-slate-450">Contact</h3>
                    <p className="text-slate-300 break-all">{resumeDetails.email}</p>
                    {resumeDetails.phone && <p className="text-slate-300">{resumeDetails.phone}</p>}
                    {resumeDetails.website && <p className="text-slate-400 break-all text-[9.5px]">{resumeDetails.website}</p>}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold tracking-wider uppercase text-slate-450">Key Stats</h3>
                    <div>
                      <p className="text-slate-400 text-[10px]">CGPA</p>
                      <p className="text-xl font-extrabold text-white">{student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'} / 10.0</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">Batch Year</p>
                      <p className="text-sm font-bold text-white">Class of {student.batch}</p>
                    </div>
                  </div>

                  {resumeDetails.skills && resumeDetails.skills.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-extrabold tracking-wider uppercase text-slate-450">Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeDetails.skills.map((s: any) => (
                          <span key={s.id} className="bg-slate-800 text-slate-200 text-[9px] px-2 py-0.5 rounded font-bold border border-slate-700">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side Content */}
                <div className="w-2/3 bg-white p-8 flex flex-col gap-6">
                  {/* Education */}
                  {resumeDetails.educations && resumeDetails.educations.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Education
                      </h3>
                      <div className="space-y-3">
                        {resumeDetails.educations.map((edu: any) => (
                          <div key={edu.id}>
                            <h4 className="font-bold text-slate-900 text-xs">{edu.institution}</h4>
                            <p className="text-slate-500 text-[10px] mt-0.5">{edu.degree} in {edu.field} ({edu.startYear} - {edu.endYear || 'Present'})</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience (Manual mode only) */}
                  {resumeDetails.experience && resumeDetails.experience.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Experience
                      </h3>
                      <div className="space-y-4">
                        {resumeDetails.experience.map((exp: any) => (
                          <div key={exp.id} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-bold text-slate-900 text-xs">{exp.role}</h4>
                              <span className="text-[10px] text-slate-400">{exp.startDate} - {exp.endDate || 'Present'}</span>
                            </div>
                            <p className="text-blue-600 font-bold text-[10px]">{exp.companyName}</p>
                            {exp.description && <p className="text-slate-500 text-[10px] mt-1">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeDetails.projects && resumeDetails.projects.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Projects
                      </h3>
                      <div className="space-y-4">
                        {resumeDetails.projects.map((proj: any) => (
                          <div key={proj.id} className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-xs">{proj.title}</h4>
                            <p className="text-slate-500 text-[10px] leading-relaxed">{proj.description}</p>
                            {proj.techStack && (
                              <p className="text-[9px] text-blue-600 font-bold">
                                Stack: {proj.techStack}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications (Auto mode only) */}
                  {resumeDetails.certifications && resumeDetails.certifications.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                        Certifications
                      </h3>
                      <div className="space-y-2">
                        {resumeDetails.certifications.map((c: any) => (
                          <div key={c.id} className="text-[10px]">
                            <p className="font-bold text-slate-800 leading-tight">{c.name}</p>
                            <p className="text-slate-500 text-[9px] mt-0.5">{c.issuer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template 4: PROFESSIONAL CORPORATE */}
            {template === 'corporate' && (
              <div className="space-y-6 text-xs leading-normal font-serif flex flex-col flex-1 text-left">
                {/* Header banner */}
                <div className="bg-slate-800 text-white p-6 -mx-12 -mt-12 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold tracking-wide uppercase font-sans">{resumeDetails.name}</h2>
                    <p className="text-slate-350 font-medium font-sans text-xs mt-1">{student.department || 'Student'}</p>
                  </div>
                  <div className="text-right text-[10px] space-y-0.5 font-sans">
                    {resumeDetails.phone && <p>Tel: {resumeDetails.phone}</p>}
                    <p>Email: {resumeDetails.email}</p>
                    {resumeDetails.website && <p>Website: {resumeDetails.website}</p>}
                  </div>
                </div>

                {/* Education */}
                {resumeDetails.educations && resumeDetails.educations.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-0.5 font-sans">
                      Academic Profile
                    </h3>
                    <div className="space-y-3">
                      {resumeDetails.educations.map((edu: any) => (
                        <div key={edu.id} className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 font-sans">{edu.institution}</h4>
                            <p className="text-slate-650">{edu.degree} in {edu.field} {edu.grade ? `(GPA: ${edu.grade})` : ''}</p>
                          </div>
                          <span className="font-bold text-slate-700 font-sans">{edu.startYear} - {edu.endYear || 'Present'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience (Manual mode only) */}
                {resumeDetails.experience && resumeDetails.experience.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-0.5 font-sans">
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {resumeDetails.experience.map((exp: any) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-900 font-sans">{exp.role}</h4>
                            <span className="font-bold text-slate-600 font-sans">
                              {exp.startDate} - {exp.endDate || 'Present'}
                            </span>
                          </div>
                          <p className="text-slate-700 italic">{exp.companyName}</p>
                          {exp.description && <p className="text-slate-600 text-[11px] leading-relaxed mt-1">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeDetails.projects && resumeDetails.projects.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-0.5 font-sans">
                      Engineering Projects
                    </h3>
                    <div className="space-y-4">
                      {resumeDetails.projects.map((proj: any) => (
                        <div key={proj.id} className="space-y-1">
                          <h4 className="font-bold text-slate-900 font-sans">{proj.title}</h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{proj.description}</p>
                          {proj.techStack && (
                            <p className="text-[10px] font-bold text-slate-700 font-sans">
                              Stack: {proj.techStack}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeDetails.skills && resumeDetails.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-0.5 font-sans">
                      Skills
                    </h3>
                    <p className="text-slate-700 leading-relaxed font-sans text-[11px]">
                      {resumeDetails.skills.map((s: any) => s.name).join(', ')}
                    </p>
                  </div>
                )}

                {/* Certifications (Auto mode only) */}
                {resumeDetails.certifications && resumeDetails.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-0.5 font-sans">
                      Certifications & Accolades
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {resumeDetails.certifications.map((c: any) => (
                        <div key={c.id}>
                          <h4 className="font-bold text-slate-900 font-sans">{c.name}</h4>
                          <p className="text-slate-650 font-medium">Issuer: {c.issuer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResumesPage;
