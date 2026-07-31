import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResumes } from '../hooks/useResumes';
import { ResumeForm } from '../components/ResumeForm';
import { ResumePreview } from '../components/ResumePreview';
import { LoadingSkeleton } from '@/components/common';
import { ArrowLeft, Save, Eye } from 'lucide-react';

const defaultResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  bio: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
};

export function ResumeWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id && id !== 'new';

  const { resume, isLoadingResume, createResume, updateResume, isCreatingResume, isUpdatingResume } = useResumes(
    isEditMode ? id : undefined
  );

  const [title, setTitle] = useState('My Resume');
  const [templateId, setTemplateId] = useState('minimal');
  const [resumeData, setResumeData] = useState<any>(defaultResumeData);

  // Sync state if edit mode and details fetched
  useEffect(() => {
    if (isEditMode && resume) {
      setTitle(resume.title);
      setTemplateId(resume.templateId);
      setResumeData(resume.data || defaultResumeData);
    }
  }, [isEditMode, resume]);

  if (isEditMode && isLoadingResume) {
    return <LoadingSkeleton count={3} height="h-32" className="mt-8 animate-in" />;
  }

  const handleSave = async () => {
    try {
      if (isEditMode) {
        await updateResume({
          id: id!,
          data: {
            title,
            templateId,
            data: resumeData,
          },
        });
      } else {
        await createResume({
          title,
          templateId,
          data: resumeData,
        });
        navigate('/student/resumes');
      }
    } catch (e) {}
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Workspace Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/resumes')}
            className="p-2 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold bg-transparent border-b border-transparent hover:border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:outline-none px-1 text-[hsl(var(--text-primary))]"
              placeholder="Resume Name"
            />
            <p className="text-xs text-[hsl(var(--text-secondary))] px-1">
              Select layout template below to change preview stylesheet
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">
          <div className="w-36">
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
            >
              <option value="minimal">Minimalist Layout</option>
              <option value="modern">Modern Sidebar</option>
              <option value="classical">Classical Serif</option>
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            Print/PDF
          </button>

          <button
            onClick={handleSave}
            disabled={isCreatingResume || isUpdatingResume}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] rounded-lg transition-all cursor-pointer shadow-xs"
          >
            <Save className="h-4 w-4" />
            Save Resume
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Form parameters */}
        <div className="xl:col-span-1">
          <ResumeForm data={resumeData} onChange={setResumeData} />
        </div>

        {/* Live Preview layout */}
        <div className="xl:col-span-1 max-h-200 overflow-y-auto border border-[hsl(var(--border))] rounded-2xl p-4 bg-[hsl(var(--muted))/0.1] shadow-inner">
          <ResumePreview templateId={templateId} data={resumeData} />
        </div>
      </div>
    </div>
  );
}

export default ResumeWorkspace;
