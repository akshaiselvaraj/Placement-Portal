import { useState } from 'react';
import { useRecruiterJobs, useCreateJob, useUpdateJob, useDeleteJob } from '../hooks/useJobs';
import { useRecruiterData } from '@/features/recruiter/hooks/useRecruiterData';
import { LoadingSkeleton, StatusBadge } from '@/components/common';
import type { Job } from '@/types';
import type { CreateJobPayload } from '../services/job.service';
import {
  Plus,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  Clock,
} from 'lucide-react';

type FormMode = 'create' | 'edit';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
const JOB_STATUSES = ['DRAFT', 'OPEN', 'CLOSED', 'FILLED'];

export function RecruiterJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: jobs, isLoading } = useRecruiterJobs({
    search: searchQuery || undefined,
    status: statusFilter || undefined,
  });
  const { company } = useRecruiterData();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [showModal, setShowModal] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<CreateJobPayload>({
    title: '',
    description: '',
    companyId: '',
    type: 'Full-time',
    location: '',
    salaryMin: null,
    salaryMax: null,
    deadline: '',
    status: 'DRAFT',
    eligibility: '',
    requirements: '',
  });

  const openCreateModal = () => {
    setFormMode('create');
    setEditingJob(null);
    setForm({
      title: '',
      description: '',
      companyId: company?.id || '',
      type: 'Full-time',
      location: '',
      salaryMin: null,
      salaryMax: null,
      deadline: '',
      status: 'DRAFT',
      eligibility: '',
      requirements: '',
    });
    setShowModal(true);
  };

  const openEditModal = (job: Job) => {
    setFormMode('edit');
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      companyId: job.companyId,
      type: job.type,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      deadline: job.deadline.split('T')[0],
      status: job.status,
      eligibility: job.eligibility || '',
      requirements: job.requirements || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      ...form,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    };
    const cId = company?.id || form.companyId;
    if (cId) {
      payload.companyId = cId;
    } else {
      delete payload.companyId;
    }

    if (formMode === 'create') {
      await createJob.mutateAsync(payload);
    } else if (editingJob) {
      await updateJob.mutateAsync({ id: editingJob.id, data: payload });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await deleteJob.mutateAsync(id);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `₹${(min / 100000).toFixed(1)}L – ₹${(max / 100000).toFixed(1)}L`;
    if (min) return `From ₹${(min / 100000).toFixed(1)}L`;
    return `Up to ₹${(max! / 100000).toFixed(1)}L`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'hsl(var(--success))';
      case 'DRAFT': return 'hsl(var(--text-muted))';
      case 'CLOSED': return 'hsl(var(--warning))';
      case 'FILLED': return 'hsl(var(--primary))';
      default: return 'hsl(var(--text-secondary))';
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={4} height="h-36" className="mt-8 animate-in" />;
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
            Manage Jobs
          </h2>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Create and manage job postings for {company?.name || 'your company'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold text-sm hover:opacity-90 transition-all shadow-md cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <input
            type="text"
            placeholder="Search job titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--text-muted))]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {!jobs || jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-[hsl(var(--text-muted))]" />
          </div>
          <h3 className="text-lg font-bold text-[hsl(var(--text-primary))]">No jobs posted yet</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-sm">
            Start by creating a new job posting to attract talented students.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-[hsl(var(--primary)/0.3)]"
            >
              {/* Status indicator dot */}
              <div
                className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getStatusColor(job.status) }}
                title={job.status}
              />

              <div className="space-y-4">
                {/* Title & Company */}
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--text-primary))] line-clamp-1 pr-6">
                    {job.title}
                  </h3>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 font-medium">
                    {job.company?.name}
                  </p>
                </div>

                {/* Meta chips */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] font-medium">
                    <Briefcase className="h-3 w-3" />
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] font-medium">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <StatusBadge status={job.status} />
                </div>

                {/* Salary */}
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-secondary))]">
                  <DollarSign className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
                  <span className="font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
                  <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-muted))]">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {job._count?.applications ?? 0} applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-1.5 rounded-lg hover:bg-[hsl(var(--danger)/0.08)] text-[hsl(var(--danger))] transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────── */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 animate-in" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-2xl p-6 space-y-6 animate-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[hsl(var(--text-primary))]">
                  {formMode === 'create' ? 'Post New Job' : 'Edit Job Posting'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the role, responsibilities, and perks…"
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                  />
                </div>

                {/* Type + Location row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                      Job Type *
                    </label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
                    >
                      {JOB_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Bangalore, India"
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    />
                  </div>
                </div>

                {/* Salary row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                      Min Salary (₹)
                    </label>
                    <input
                      type="number"
                      value={form.salaryMin ?? ''}
                      onChange={(e) => setForm({ ...form, salaryMin: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 300000"
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                      Max Salary (₹)
                    </label>
                    <input
                      type="number"
                      value={form.salaryMax ?? ''}
                      onChange={(e) => setForm({ ...form, salaryMax: e.target.value ? Number(e.target.value) : null })}
                      placeholder="e.g. 800000"
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    />
                  </div>
                </div>

                {/* Deadline + Status row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] cursor-pointer"
                    >
                      {JOB_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                    Eligibility Criteria
                  </label>
                  <input
                    type="text"
                    value={form.eligibility ?? ''}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. CGPA >= 7.0"
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-xs font-semibold text-[hsl(var(--text-secondary))] mb-1.5 uppercase tracking-wide">
                    Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={form.requirements ?? ''}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    placeholder="e.g. React, Node.js, TypeScript, 1+ year of experience"
                    className="w-full px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--text-primary))] placeholder-[hsl(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] resize-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createJob.isPending || updateJob.isPending}
                    className="px-6 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {createJob.isPending || updateJob.isPending
                      ? 'Saving…'
                      : formMode === 'create'
                        ? 'Post Job'
                        : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RecruiterJobsPage;
