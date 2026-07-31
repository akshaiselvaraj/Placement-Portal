import { useState } from 'react';
import { Plus, Trash2, Edit2, Code, X, ExternalLink } from 'lucide-react';
import { Github } from '@/components/common';
import type { Project } from '@/types';

interface ProjectsSectionProps {
  projects: Project[];
  onAdd: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export function ProjectsSection({ projects, onAdd, onUpdate, onDelete }: ProjectsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTechStackInput('');
    setLiveUrl('');
    setRepoUrl('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setTitle(project.title);
    setDescription(project.description);
    setTechStackInput(project.techStack.join(', '));
    setLiveUrl(project.liveUrl || '');
    setRepoUrl(project.repoUrl || '');
    setEditingId(String(project.id));
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !techStackInput) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        techStack: techStackInput
          .split(',')
          .map((tech) => tech.trim())
          .filter((tech) => tech.length > 0),
        liveUrl: liveUrl.trim() || null,
        repoUrl: repoUrl.trim() || null,
      };

      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onAdd(payload);
      }
      setIsOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Projects</h3>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <p className="text-sm text-[hsl(var(--text-secondary))] italic">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between p-5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all bg-[hsl(var(--surface))] hover:shadow-xs group relative"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate pr-16">{proj.title}</h4>
                  
                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(String(proj.id))}
                      className="p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger-light))/0.3] rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed line-clamp-3">
                  {proj.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-[hsl(var(--muted))/0.6] text-[hsl(var(--text-secondary))] text-[10px] font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links */}
              {(proj.liveUrl || proj.repoUrl) && (
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[hsl(var(--border))]">
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Repository
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-xl z-10 animate-in space-y-4">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
                {editingId ? 'Edit Project' : 'Add Project'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Campus Placement Management System"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize your project, tech used, and outcomes..."
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                  Tech Stack (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="React, TypeScript, Express, Prisma"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Repository URL (Git)
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://myproject.com"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold rounded-lg text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsSection;
