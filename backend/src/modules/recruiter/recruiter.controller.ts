import { Request, Response } from 'express';
import { RecruiterService } from './recruiter.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class RecruiterController {
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const data = await RecruiterService.getDashboardStats(req.user!.id);
    return ApiResponse.success(res, data, 'Recruiter dashboard stats fetched successfully');
  });

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
    const applicants = await RecruiterService.getApplicants(req.user!.id, req.query as any);
    return ApiResponse.success(res, applicants, 'Applicants fetched successfully');
  });

  static getCandidateDetails = asyncHandler(async (req: Request, res: Response) => {
    const candidate = await RecruiterService.getCandidateDetails(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, candidate, 'Candidate details fetched successfully');
  });

  static updateApplicantStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await RecruiterService.updateApplicantStatus(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    return ApiResponse.success(res, result, 'Applicant status updated successfully');
  });

  static searchCandidates = asyncHandler(async (req: Request, res: Response) => {
    const query = (req.query.q as string) || '';
    const candidates = await RecruiterService.searchCandidates(req.user!.id, query);
    return ApiResponse.success(res, candidates, 'Candidate search results fetched successfully');
  });

  static scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    const interview = await RecruiterService.scheduleInterview(req.user!.id, req.body);
    return ApiResponse.created(res, interview, 'Interview scheduled successfully');
  });

  static getInterviews = asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const interviews = await RecruiterService.getInterviews(req.user!.id, status);
    return ApiResponse.success(res, interviews, 'Interviews fetched successfully');
  });

  static updateInterview = asyncHandler(async (req: Request, res: Response) => {
    const interview = await RecruiterService.updateInterview(
      req.user!.id,
      req.params.id as string,
      req.body
    );
    return ApiResponse.success(res, interview, 'Interview updated successfully');
  });

  static getHiringHistory = asyncHandler(async (req: Request, res: Response) => {
    const history = await RecruiterService.getHiringHistory(req.user!.id);
    return ApiResponse.success(res, history, 'Hiring history fetched successfully');
  });
}

export default RecruiterController;
