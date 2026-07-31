import { useState } from 'react';
import { Plus, Trash2, Edit2, GraduationCap, X, Calendar } from 'lucide-react';
import type { Education } from '@/types';

interface EducationSectionProps {
  educations: Education[];
  onAdd: (data: any) => Promise<any>;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export function EducationSection({ educations, onAdd, onUpdate, onDelete }: EducationSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields state
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear() - 4);
  const [endYear, setEndYear] = useState<number | null>(new Date().getFullYear());
  const [grade, setGrade] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setInstitution('');
    setDegree('');
    setField('');
    setStartYear(new Date().getFullYear() - 4);
    setEndYear(new Date().getFullYear());
    setGrade('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (edu: Education) => {
    setInstitution(edu.institution);
    setDegree(edu.degree);
    setField(edu.field);
    setStartYear(edu.startYear);
    setEndYear(edu.endYear);
    setGrade(edu.grade || '');
    setEditingId(String(edu.id));
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !degree || !field || !startYear) return;

    setIsSubmitting(true);
    try {
      const payload = {
        institution,
        degree,
        field,
        startYear: Number(startYear),
        endYear: endYear ? Number(endYear) : null,
        grade: grade || null,
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
          <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Education</h3>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Education
        </button>
      </div>

      {/* Education List */}
      {educations.length === 0 ? (
        <p className="text-sm text-[hsl(var(--text-secondary))] italic">No education entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {educations.map((edu) => (
            <div
              key={edu.id}
              className="flex justify-between items-start p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)] transition-all bg-[hsl(var(--surface))] hover:shadow-xs group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[hsl(var(--text-primary))]">{edu.institution}</h4>
                <p className="text-xs font-medium text-[hsl(var(--text-secondary))]">
                  {edu.degree} in {edu.field}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-[hsl(var(--text-muted))] font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {edu.startYear} - {edu.endYear || 'Present'}
                  </span>
                  {edu.grade && (
                    <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))]">
                      Grade: {edu.grade}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(edu)}
                  className="p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(String(edu.id))}
                  className="p-1.5 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger-light))/0.3] rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over or Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-xl z-10 animate-in space-y-4">
            <div className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">
                {editingId ? 'Edit Education' : 'Add Education'}
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
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Science"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    required
                    value={field}
                    onChange={(e) => setField(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    required
                    value={startYear || ''}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    End Year
                  </label>
                  <input
                    type="number"
                    value={endYear || ''}
                    onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : null)}
                    placeholder="Present"
                    className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
                    Grade/GPA
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. 3.9 / 4.0"
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

export default EducationSection;
