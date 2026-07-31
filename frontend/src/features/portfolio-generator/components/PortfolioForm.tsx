import { useState } from 'react';
import { useStudentProfile } from '@/features/student/hooks/useStudentProfile';
import { Copy, Plus, Trash2 } from 'lucide-react';

interface PortfolioFormProps {
  data: any;
  onChange: (newData: any) => void;
}

export function PortfolioForm({ data, onChange }: PortfolioFormProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'socials' | 'projects' | 'education' | 'skills'>('basics');

  // Fetch student profile to support "Pre-fill from Profile"
  const { student } = useStudentProfile();

  const updateField = (section: string, value: any) => {
    onChange({
      ...data,
      [section]: value,
    });
  };

  const handlePrefill = () => {
    if (!student) return;

    const prefilledData = {
      ...data,
      name: student.user?.name || data.name,
      email: student.user?.email || data.email,
      phone: student.phone || data.phone,
      location: student.bio ? 'India' : data.location,
      website: student.website || data.website,
      github: student.github || data.github,
      linkedin: student.linkedin || data.linkedin,
      bio: student.bio || data.bio,
      tagline: data.tagline || 'Student at ' + student.department,
      education: student.educations?.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear.toString(),
        endYear: edu.endYear?.toString() || '',
        grade: edu.grade || '',
      })) || data.education,
      projects: student.projects?.map((proj) => ({
        title: proj.title,
        description: proj.description,
        techStack: Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack,
        repoUrl: proj.repoUrl || '',
      })) || data.projects,
      skills: student.skills?.map((s) => ({
        name: s.name,
        level: s.level,
      })) || data.skills,
    };

    onChange(prefilledData);
  };

  const handleAddListItem = (section: string, emptyItem: any) => {
    const list = data[section] ? [...data[section]] : [];
    list.push(emptyItem);
    updateField(section, list);
  };

  const handleRemoveListItem = (section: string, idx: number) => {
    const list = data[section] ? [...data[section]] : [];
    list.splice(idx, 1);
    updateField(section, list);
  };

  const handleUpdateListItem = (section: string, idx: number, field: string, val: any) => {
    const list = data[section] ? [...data[section]] : [];
    list[idx] = {
      ...list[idx],
      [field]: val,
    };
    updateField(section, list);
  };

  return (
    <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-xs space-y-6 flex flex-col justify-between min-h-125">
      <div className="space-y-4">
        {/* Workspace Toolbar */}
        <div className="flex justify-between items-center pb-3 border-b border-[hsl(var(--border))]">
          <h3 className="font-bold text-sm text-[hsl(var(--text-primary))]">Portfolio Config Desk</h3>
          {student && (
            <button
              type="button"
              onClick={handlePrefill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] hover:bg-[hsl(var(--primary)/0.12)] rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              Pre-fill from Profile
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[hsl(var(--muted))/0.4] p-1 rounded-xl border border-[hsl(var(--border))/0.4]">
          {['basics', 'socials', 'projects', 'education', 'skills'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                activeTab === tab
                  ? 'bg-[hsl(var(--surface))] text-[hsl(var(--primary))] shadow-xs'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div className="pt-2">
          {activeTab === 'basics' && (
            <div className="space-y-4 text-xs font-medium text-[hsl(var(--text-secondary))]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Display Name</label>
                  <input
                    type="text"
                    value={data.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Job Tagline</label>
                  <input
                    type="text"
                    value={data.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Intro/Bio Statement</label>
                <textarea
                  rows={4}
                  value={data.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'socials' && (
            <div className="space-y-4 text-xs font-medium text-[hsl(var(--text-secondary))]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={data.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={data.github || ''}
                    onChange={(e) => updateField('github', e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={data.linkedin || ''}
                    onChange={(e) => updateField('linkedin', e.target.value)}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[hsl(var(--text-primary))]">Showcased Projects</h4>
                <button
                  type="button"
                  onClick={() => handleAddListItem('projects', { title: '', description: '', techStack: '', repoUrl: '' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] rounded-lg hover:bg-[hsl(var(--primary)/0.1)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Project
                </button>
              </div>

              <div className="space-y-4 max-h-87.5 overflow-y-auto pr-1">
                {(data.projects || []).map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 border border-[hsl(var(--border))] rounded-xl relative bg-[hsl(var(--muted))/0.08] space-y-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem('projects', idx)}
                      className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Project Name</label>
                        <input
                          type="text"
                          required
                          value={proj.title || ''}
                          onChange={(e) => handleUpdateListItem('projects', idx, 'title', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Repo URL</label>
                        <input
                          type="text"
                          value={proj.repoUrl || ''}
                          onChange={(e) => handleUpdateListItem('projects', idx, 'repoUrl', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Tech Stack</label>
                      <input
                        type="text"
                        value={proj.techStack || ''}
                        onChange={(e) => handleUpdateListItem('projects', idx, 'techStack', e.target.value)}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={proj.description || ''}
                        onChange={(e) => handleUpdateListItem('projects', idx, 'description', e.target.value)}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[hsl(var(--text-primary))]">Education History</h4>
                <button
                  type="button"
                  onClick={() => handleAddListItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] rounded-lg hover:bg-[hsl(var(--primary)/0.1)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add College
                </button>
              </div>

              <div className="space-y-4 max-h-87.5 overflow-y-auto pr-1">
                {(data.education || []).map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 border border-[hsl(var(--border))] rounded-xl relative bg-[hsl(var(--muted))/0.08] space-y-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem('education', idx)}
                      className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Institution</label>
                        <input
                          type="text"
                          required
                          value={edu.institution || ''}
                          onChange={(e) => handleUpdateListItem('education', idx, 'institution', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Degree / Course</label>
                        <input
                          type="text"
                          required
                          value={edu.degree || ''}
                          onChange={(e) => handleUpdateListItem('education', idx, 'degree', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Field</label>
                        <input
                          type="text"
                          value={edu.field || ''}
                          onChange={(e) => handleUpdateListItem('education', idx, 'field', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Start Year</label>
                        <input
                          type="text"
                          value={edu.startYear || ''}
                          onChange={(e) => handleUpdateListItem('education', idx, 'startYear', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">End Year</label>
                        <input
                          type="text"
                          value={edu.endYear || ''}
                          onChange={(e) => handleUpdateListItem('education', idx, 'endYear', e.target.value)}
                          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[hsl(var(--text-primary))]">Technical Skills</h4>
                <button
                  type="button"
                  onClick={() => handleAddListItem('skills', { name: '', level: 'Intermediate' })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] rounded-lg hover:bg-[hsl(var(--primary)/0.1)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Skill
                </button>
              </div>

              <div className="space-y-3 max-h-87.5 overflow-y-auto pr-1">
                {(data.skills || []).map((skill: any, idx: number) => (
                  <div key={idx} className="flex gap-3 items-center border-b border-[hsl(var(--border))/0.4] pb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Skill Name (e.g. TypeScript)"
                        value={skill.name || ''}
                        onChange={(e) => handleUpdateListItem('skills', idx, 'name', e.target.value)}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      />
                    </div>
                    <div className="w-36">
                      <select
                        value={skill.level || 'Intermediate'}
                        onChange={(e) => handleUpdateListItem('skills', idx, 'level', e.target.value)}
                        className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-1.5 px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Expert</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveListItem('skills', idx)}
                      className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PortfolioForm;
