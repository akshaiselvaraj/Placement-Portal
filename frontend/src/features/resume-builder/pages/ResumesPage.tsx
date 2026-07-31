import { useNavigate } from 'react-router-dom';
import { useResumes } from '../hooks/useResumes';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { FileText, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

export function ResumesPage() {
  const navigate = useNavigate();
  const { resumes, isLoadingResumes, deleteResume } = useResumes();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(id);
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Resume Builder
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Build and manage template-based resumes for job applications.
          </p>
        </div>

        <button
          onClick={() => navigate('/student/resumes/new')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Create Resume
        </button>
      </div>

      {isLoadingResumes ? (
        <LoadingSkeleton count={2} height="h-28" />
      ) : resumes.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-12">
          <EmptyState
            title="No resumes built yet"
            message="Click the button above to launch the workspace and construct your first template."
            icon={<FileText className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Resume trigger card */}
          <button
            onClick={() => navigate('/student/resumes/new')}
            className="p-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.4)] transition-all flex flex-col items-center justify-center text-center min-h-40 group cursor-pointer shadow-2xs"
          >
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--text-secondary))] group-hover:bg-[hsl(var(--primary)/0.08)] group-hover:text-[hsl(var(--primary))] transition-all">
              <Plus className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] mt-3">Build New Resume</h4>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Select from premium layout styles</p>
          </button>

          {/* User Resumes */}
          {resumes.map((resume) => (
            <div
              key={resume.id}
              onClick={() => navigate(`/student/resumes/${resume.id}`)}
              className="p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:border-[hsl(var(--primary)/0.2)] hover:shadow-xs transition-all flex flex-col justify-between min-h-40 cursor-pointer relative group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2 pr-6">
                  <div>
                    <h4 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate max-w-37.5">
                      {resume.title}
                    </h4>
                    <p className="text-[10px] text-[hsl(var(--text-secondary))] font-bold uppercase tracking-wider mt-0.5">
                      Template: {resume.templateId}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase rounded-full ${
                    resume.isApproved
                      ? 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))]'
                      : 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))]'
                  }`}>
                    {resume.isApproved ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </span>
                </div>

                <p className="text-[10px] text-[hsl(var(--text-muted))] font-semibold">
                  Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions panel */}
              <div className="flex gap-2.5 pt-3 border-t border-[hsl(var(--border))/0.5] justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDelete(e, resume.id)}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                  title="Delete Resume"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/student/resumes/${resume.id}`);
                  }}
                  className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--primary))] transition-colors cursor-pointer"
                  title="Edit Resume"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumesPage;
