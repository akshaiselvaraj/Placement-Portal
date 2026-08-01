import { useStudentProfile } from '../hooks/useStudentProfile';
import { ProfileForm } from '../components/ProfileForm';
import { EducationSection } from '../components/EducationSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { SkillsSection } from '../components/SkillsSection';
import { CertificationsSection } from '../components/CertificationsSection';
import { StatusBadge, LoadingSkeleton } from '@/components/common';
import { GraduationCap, XCircle } from 'lucide-react';

export function ProfilePage() {
  const {
    student,
    isLoading,
    isError,
    updateProfile,
    reapplyProfile,
    isReapplyingProfile,
    addEducation,
    updateEducation,
    deleteEducation,
    addProject,
    updateProject,
    deleteProject,
    addSkill,
    deleteSkill,
    addCertification,
    updateCertification,
    deleteCertification,
  } = useStudentProfile();

  if (isLoading) {
    return <LoadingSkeleton count={4} height="h-28" className="mt-8 animate-in" />;
  }

  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] mt-8">
        <XCircle className="h-12 w-12 text-[hsl(var(--danger))] mb-4" />
        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Error Loading Profile</h3>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          We couldn&apos;t load your profile details. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header Summary Card */}
      <div className="relative p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {student.user?.name ? student.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'SP'}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
              {student.user?.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--text-secondary))] font-medium">
              <span>Roll No: {student.rollNumber}</span>
              <span className="text-[hsl(var(--border))]">•</span>
              <span>{student.department}</span>
              <span className="text-[hsl(var(--border))]">•</span>
              <span>Batch {student.batch}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 border-[hsl(var(--border))] pt-4 md:pt-0">
          <div className="text-left md:text-right">
            <p className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-wider">
              Profile Verification
            </p>
            <div className="mt-1 flex items-center gap-1.5 justify-end">
              <StatusBadge status={student.profileStatus} />
            </div>
          </div>
        </div>
      </div>

      {student.profileStatus === 'REJECTED' && (
        <div className="p-5 rounded-2xl border border-[hsl(var(--danger)/0.2)] bg-[hsl(var(--danger-light))] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-[hsl(var(--danger)/0.1)] text-[hsl(var(--danger))] shrink-0">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-[hsl(var(--danger))] text-sm">
                Profile Verification Rejected
              </h4>
              <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed max-w-2xl font-semibold">
                Your profile verification has been rejected by the Placement Officer. 
                Please review your credentials, correct any issues, and reapply for verification. 
                You will not be eligible to apply for jobs until your profile is verified.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await reapplyProfile();
              } catch (err) {
                // error is handled by hook
              }
            }}
            disabled={isReapplyingProfile}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.9)] active:scale-95 transition-all rounded-xl disabled:opacity-50 shrink-0 shadow-xs cursor-pointer"
          >
            {isReapplyingProfile ? 'Resubmitting...' : 'Reapply for Verification'}
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) - Forms, Education, Projects */}
        <div className="lg:col-span-2 space-y-8">
          <ProfileForm student={student} onUpdate={updateProfile} />
          
          <EducationSection
            educations={student.educations || []}
            onAdd={async (data) => {
              const { gradeType, ...payload } = data;
              const res = await addEducation(payload);
              if (gradeType === 'CGPA' && payload.grade) {
                const numericCgpa = parseFloat(payload.grade);
                if (!isNaN(numericCgpa)) {
                  await updateProfile({ cgpa: numericCgpa });
                }
              }
              return res;
            }}
            onUpdate={async (id, data) => {
              const { gradeType, ...payload } = data;
              const res = await updateEducation({ id, data: payload });
              if (gradeType === 'CGPA' && payload.grade) {
                const numericCgpa = parseFloat(payload.grade);
                if (!isNaN(numericCgpa)) {
                  await updateProfile({ cgpa: numericCgpa });
                }
              }
              return res;
            }}
            onDelete={deleteEducation}
          />

          <ProjectsSection
            projects={student.projects || []}
            onAdd={addProject}
            onUpdate={(id, data) => updateProject({ id, data })}
            onDelete={deleteProject}
          />

          <CertificationsSection
            certifications={student.certifications || []}
            onAdd={addCertification}
            onUpdate={(id, data) => updateCertification({ id, data })}
            onDelete={deleteCertification}
          />
        </div>

        {/* Right Column (1/3 width) - Skills, Summary details */}
        <div className="space-y-8">
          <SkillsSection
            skills={student.skills || []}
            onAdd={addSkill}
            onDelete={deleteSkill}
          />

          {/* Academic Stats Summary */}
          <div className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-base font-bold text-[hsl(var(--text-primary))]">Academic Summary</h3>
            </div>
            
            <div className="divide-y divide-[hsl(var(--border))] text-sm">
              <div className="flex justify-between py-2.5 font-medium">
                <span className="text-[hsl(var(--text-secondary))]">Current CGPA</span>
                <span className="text-[hsl(var(--text-primary))] font-bold">
                  {student.cgpa !== null ? student.cgpa.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-2.5 font-medium">
                <span className="text-[hsl(var(--text-secondary))]">Applications Sent</span>
                <span className="text-[hsl(var(--text-primary))] font-bold">
                  {student.applications?.length || 0}
                </span>
              </div>
              <div className="flex justify-between py-2.5 font-medium">
                <span className="text-[hsl(var(--text-secondary))]">Approved Resumes</span>
                <span className="text-[hsl(var(--text-primary))] font-bold">
                  {student.resumes?.filter(r => r.isApproved).length || 0}
                </span>
              </div>
              <div className="flex justify-between py-2.5 font-medium">
                <span className="text-[hsl(var(--text-secondary))]">Published Portfolios</span>
                <span className="text-[hsl(var(--text-primary))] font-bold">
                  {student.portfolios?.filter(p => p.isPublished).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
