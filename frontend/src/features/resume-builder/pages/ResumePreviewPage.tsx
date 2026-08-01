import { useParams, useNavigate } from 'react-router-dom';
import { useResumes } from '../hooks/useResumes';
import { ResumePreview } from '../components/ResumePreview';
import { LoadingSkeleton } from '@/components/common';
import { ArrowLeft, Printer } from 'lucide-react';

export function ResumePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resume, isLoadingResume } = useResumes(id);

  if (isLoadingResume) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <LoadingSkeleton count={3} height="h-32" className="animate-in" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[hsl(var(--surface))] rounded-2xl border border-[hsl(var(--border))] max-w-lg mx-auto mt-12">
        <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">Resume Not Found</h3>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          The requested resume could not be found or you do not have permission to view it.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in pb-12">
      {/* Top Toolbar */}
      <div className="flex justify-between items-center pb-4 border-b border-[hsl(var(--border))] no-print">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[hsl(var(--text-secondary))] font-medium hidden sm:inline">
            Viewing: <strong className="text-[hsl(var(--text-primary))]">{resume.title}</strong>
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print/PDF
          </button>
        </div>
      </div>

      {/* Resume Document Wrapper */}
      <div className="bg-[hsl(var(--muted))/0.1] border border-[hsl(var(--border))] rounded-2xl p-4 sm:p-8 shadow-inner overflow-x-auto">
        <ResumePreview templateId={resume.templateId} data={resume.data} />
      </div>
    </div>
  );
}

export default ResumePreviewPage;
