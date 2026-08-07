import { useForm } from 'react-hook-form';
import { User, Phone, Globe } from 'lucide-react';
import { Github, Linkedin } from '@/components/common';
import type { StudentProfile } from '@/types';

interface ProfileFormProps {
  student: StudentProfile;
  onUpdate: (data: any) => Promise<any>;
}

export function ProfileForm({ student, onUpdate }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      name: student.user?.name || '',
      phone: student.phone || '',
      bio: student.bio || '',
      linkedin: student.linkedin || '',
      github: student.github || '',
      website: student.website || '',
      tenthMarks: student.tenthMarks !== null && student.tenthMarks !== undefined ? student.tenthMarks : '',
      twelfthMarks: student.twelfthMarks !== null && student.twelfthMarks !== undefined ? student.twelfthMarks : '',
      activityPoints: student.activityPoints !== null && student.activityPoints !== undefined ? student.activityPoints : '',
    },
  });

  const onSubmit = async (data: any) => {
    // Sanitize URLs to send null instead of empty string
    const payload = {
      name: data.name.trim(),
      phone: data.phone.trim() || null,
      bio: data.bio.trim() || null,
      linkedin: data.linkedin.trim() || null,
      github: data.github.trim() || null,
      website: data.website.trim() || null,
      tenthMarks: data.tenthMarks !== '' && data.tenthMarks !== null && data.tenthMarks !== undefined ? Number(data.tenthMarks) : null,
      twelfthMarks: data.twelfthMarks !== '' && data.twelfthMarks !== null && data.twelfthMarks !== undefined ? Number(data.twelfthMarks) : null,
      activityPoints: data.activityPoints !== '' && data.activityPoints !== null && data.activityPoints !== undefined ? parseInt(data.activityPoints, 10) : null,
    };
    await onUpdate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
        <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Personal Information</h3>
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
              <User className="h-4.5 w-4.5" />
            </span>
            <input
              {...register('name')}
              type="text"
              required
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
              <Phone className="h-4.5 w-4.5" />
            </span>
            <input
              {...register('phone')}
              type="tel"
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
          Biography (Short Bio)
        </label>
        <textarea
          {...register('bio')}
          rows={3}
          placeholder="Tell recruiters about yourself, your interests, and career goals..."
          className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
              <Linkedin className="h-4.5 w-4.5" />
            </span>
            <input
              {...register('linkedin')}
              type="url"
              placeholder="https://linkedin.com/in/..."
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
            GitHub Profile URL
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
              <Github className="h-4.5 w-4.5" />
            </span>
            <input
              {...register('github')}
              type="url"
              placeholder="https://github.com/..."
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
            Personal Website URL
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--text-muted))]">
              <Globe className="h-4.5 w-4.5" />
            </span>
            <input
              {...register('website')}
              type="url"
              placeholder="https://mywebsite.com"
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 pl-9 pr-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[hsl(var(--border))] pt-4">
        <h4 className="text-sm font-bold text-[hsl(var(--text-primary))] mb-4">Academic & Activity Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
              10th Marks (%)
            </label>
            <input
              {...register('tenthMarks')}
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g. 95.2"
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
              12th Marks (%)
            </label>
            <input
              {...register('twelfthMarks')}
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g. 92.5"
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase tracking-wider mb-1">
              Activity Points
            </label>
            <input
              {...register('activityPoints')}
              type="number"
              min="0"
              placeholder="e.g. 100"
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default ProfileForm;
