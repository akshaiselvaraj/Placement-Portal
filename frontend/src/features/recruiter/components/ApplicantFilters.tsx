import { SearchInput } from '@/components/common';

interface JobOption {
  id: string;
  title: string;
}

interface ApplicantFiltersProps {
  jobs: JobOption[];
  selectedJobId: string;
  onJobChange: (id: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export function ApplicantFilters({
  jobs,
  selectedJobId,
  onJobChange,
  selectedStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
}: ApplicantFiltersProps) {
  return (
    <div className="p-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
      <div className="w-full md:w-auto flex-1">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search by student name or roll number..."
        />
      </div>

      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-48">
          <select
            value={selectedJobId}
            onChange={(e) => onJobChange(e.target.value)}
            className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          >
            <option value="">All Job Postings</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="block w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] py-2 px-3 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          >
            <option value="">All Application Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default ApplicantFilters;
