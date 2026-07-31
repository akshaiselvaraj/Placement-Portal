import { Request, Response } from 'express';
import { JobService } from './job.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class JobController {
  // ── Recruiter Endpoints ─────────────────────────────
  static createJob = asyncHandler(async (req: Request, res: Response) => {
    const job = await JobService.createJob(req.user!.id, req.body);
    return ApiResponse.created(res, job, 'Job created successfully');
  });

  static updateJob = asyncHandler(async (req: Request, res: Response) => {
    const job = await JobService.updateJob(req.user!.id, req.params.id as string, req.body);
    return ApiResponse.success(res, job, 'Job updated successfully');
  });

  static deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.deleteJob(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, result, 'Job deleted successfully');
  });

  static getRecruiterJobs = asyncHandler(async (req: Request, res: Response) => {
    const jobs = await JobService.getRecruiterJobs(req.user!.id, req.query as any);
    return ApiResponse.success(res, jobs, 'Recruiter jobs fetched successfully');
  });

  // ── Public / Student Endpoints ──────────────────────
  static getPublicJobs = asyncHandler(async (req: Request, res: Response) => {
    const jobs = await JobService.getPublicJobs(req.query as any);
    return ApiResponse.success(res, jobs, 'Jobs fetched successfully');
  });

  static getJobById = asyncHandler(async (req: Request, res: Response) => {
    const job = await JobService.getJobById(req.params.id as string);
    return ApiResponse.success(res, job, 'Job details fetched successfully');
  });

  static checkEligibility = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.checkEligibility(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, result, 'Eligibility check completed');
  });

  static applyToJob = asyncHandler(async (req: Request, res: Response) => {
    const application = await JobService.applyToJob(req.user!.id, req.params.id as string);
    return ApiResponse.created(res, application, 'Application submitted successfully');
  });

  static getStudentApplications = asyncHandler(async (req: Request, res: Response) => {
    const applications = await JobService.getStudentApplications(req.user!.id);
    return ApiResponse.success(res, applications, 'Applications fetched successfully');
  });

  static withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
    const result = await JobService.withdrawApplication(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, result, 'Application withdrawn successfully');
  });
}

export default JobController;
