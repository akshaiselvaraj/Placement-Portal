import { useState } from 'react';
import { Plus, X, PlusCircle, Award } from 'lucide-react';
import type { Skill } from '@/types';

interface SkillsSectionProps {
  skills: Skill[];
  onAddSkill: (data: { name: string; level?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' }) => Promise<any>;
  onDeleteSkill: (id: string) => Promise<any>;
}

export function SkillsSection({ skills, onAddSkill, onDeleteSkill }: SkillsSectionProps) {
  const [newSkillName, setNewSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'EXPERT'>('INTERMEDIATE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSkill({
        name: newSkillName.trim(),
        level: skillLevel,
      });
      setNewSkillName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Skills</h3>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Add a skill (e.g. React, Python)"
            className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            disabled={isSubmitting}
          />
        </div>
        <div className="w-full sm:w-44">
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value as any)}
            className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            disabled={isSubmitting}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !newSkillName.trim()}
          className="flex justify-center items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </form>

      {/* Skills list */}
      {skills.length === 0 ? (
        <p className="text-sm text-[hsl(var(--text-secondary))] italic">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.5] text-xs font-semibold"
            >
              <span className="text-[hsl(var(--text-primary))]">{skill.name}</span>
              {skill.level && (
                <span className="text-[10px] text-[hsl(var(--text-secondary))] font-normal tracking-wide uppercase px-1 py-0.5 rounded bg-[hsl(var(--surface))]">
                  {skill.level.toLowerCase()}
                </span>
              )}
              <button
                type="button"
                onClick={() => onDeleteSkill(String(skill.id))}
                className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--danger))] transition-colors rounded-full hover:bg-[hsl(var(--surface))] p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SkillsSection;
