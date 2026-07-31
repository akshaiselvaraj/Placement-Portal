import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/job.service';
import type { CreateJobPayload } from '../services/job.service';

// ── Public / Student Hooks ──────────────────────────────────────
export function usePublicJobs(params?: { search?: string; type?: string }) {
  return useQuery({
    queryKey: ['publicJobs', params],
    queryFn: () => jobService.getPublicJobs(params),
  });
}

export function useJobById(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });
}

export function useEligibilityCheck(jobId: string) {
  return useQuery({
    queryKey: ['eligibility', jobId],
    queryFn: () => jobService.checkEligibility(jobId),
    enabled: !!jobId,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => jobService.applyToJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicJobs'] });
      queryClient.invalidateQueries({ queryKey: ['studentApplications'] });
    },
  });
}

export function useStudentApplications() {
  return useQuery({
    queryKey: ['studentApplications'],
    queryFn: () => jobService.getStudentApplications(),
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => jobService.withdrawApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentApplications'] });
    },
  });
}

// ── Recruiter Hooks ─────────────────────────────────────────────
export function useRecruiterJobs(params?: { status?: string; search?: string; type?: string }) {
  return useQuery({
    queryKey: ['recruiterJobs', params],
    queryFn: () => jobService.getRecruiterJobs(params),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPayload) => jobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobPayload> }) =>
      jobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobs'] });
    },
  });
}
