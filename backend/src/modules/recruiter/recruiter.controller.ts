import { Request, Response } from 'express';
import { RecruiterService } from './recruiter.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class RecruiterController {
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const recruiter = await RecruiterService.getProfile(req.user!.id);
    return ApiResponse.success(res, recruiter, 'Recruiter profile fetched successfully');
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const recruiter = await RecruiterService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, recruiter, 'Recruiter profile updated successfully');
  });

  static getCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await RecruiterService.getCompany(req.user!.id);
    return ApiResponse.success(res, company, 'Company details fetched successfully');
  });

  static getApplicants = asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.query.jobId as string | undefined;
    const status = req.query.status as string | undefined;
    const applicants = await RecruiterService.getApplicants(req.user!.id, jobId, status);
    return ApiResponse.success(res, applicants, 'Applicants fetched successfully');
  });

  static updateApplicantStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await RecruiterService.updateApplicantStatus(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    return ApiResponse.success(res, result, 'Applicant status updated successfully');
  });
}
export default RecruiterController;
