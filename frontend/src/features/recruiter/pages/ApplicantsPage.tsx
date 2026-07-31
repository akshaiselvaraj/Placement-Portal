import { useState, useMemo } from 'react';
import { useRecruiterData } from '../hooks/useRecruiterData';
import { ApplicantFilters } from '../components/ApplicantFilters';
import { ApplicantCard } from '../components/ApplicantCard';
import { LoadingSkeleton, EmptyState } from '@/components/common';
import { Users } from 'lucide-react';

export function ApplicantsPage() {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all applicants first
  const { applicants, isLoadingApplicants, updateApplicantStatus, isUpdatingStatus } = useRecruiterData();

  // Dynamically extract distinct jobs from applicants data
  const jobsList = useMemo(() => {
    const jobsMap: Record<string, string> = {};
    applicants.forEach((app) => {
      if (app.job?.id && app.job?.title) {
        jobsMap[app.job.id] = app.job.title;
      }
    });
    return Object.entries(jobsMap).map(([id, title]) => ({ id, title }));
  }, [applicants]);

  // Apply filters in memory
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      // Job Filter
      if (selectedJobId && app.job?.id !== selectedJobId) {
        return false;
      }
      // Status Filter
      if (selectedStatus && app.status !== selectedStatus) {
        return false;
      }
      // Search Term Filter (Name or Roll Number)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const studentName = app.student?.user?.name?.toLowerCase() || '';
        const rollNo = app.student?.rollNumber?.toLowerCase() || '';
        if (!studentName.includes(query) && !rollNo.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [applicants, selectedJobId, selectedStatus, searchTerm]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateApplicantStatus({ id, status });
    } catch (e) {
      // Error handled by hook mutation
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          Applicant Management
        </h2>
        <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
          Review student profiles, portfolios, and update application status.
        </p>
      </div>

      {/* Filter panel */}
      <ApplicantFilters
        jobs={jobsList}
        selectedJobId={selectedJobId}
        onJobChange={setSelectedJobId}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Data loading or grid list */}
      {isLoadingApplicants ? (
        <LoadingSkeleton count={3} height="h-44" className="mt-6" />
      ) : filteredApplicants.length === 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--surface))] py-16">
          <EmptyState
            title="No applicants found"
            message="No application records match your filter criteria."
            icon={<Users className="h-8 w-8 text-[hsl(var(--text-muted))]" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplicants.map((app) => (
            <ApplicantCard
              key={app.id}
              application={app}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={isUpdatingStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ApplicantsPage;
