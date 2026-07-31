import { Request, Response } from 'express';
import { PlacementOfficerService } from './placement-officer.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class PlacementOfficerController {
  static getStudents = asyncHandler(async (req: Request, res: Response) => {
    const students = await PlacementOfficerService.getStudents(req.query);
    return ApiResponse.success(res, students, 'Students retrieved successfully');
  });

  static verifyStudent = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.verifyStudent(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Student profile status updated successfully');
  });

  static getResumes = asyncHandler(async (req: Request, res: Response) => {
    const resumes = await PlacementOfficerService.getResumes();
    return ApiResponse.success(res, resumes, 'Resumes retrieved successfully');
  });

  static approveResume = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.approveResume(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Resume approval status updated successfully');
  });

  static getPortfolios = asyncHandler(async (req: Request, res: Response) => {
    const portfolios = await PlacementOfficerService.getPortfolios();
    return ApiResponse.success(res, portfolios, 'Portfolios retrieved successfully');
  });

  static approvePortfolio = asyncHandler(async (req: Request, res: Response) => {
    const updated = await PlacementOfficerService.approvePortfolio(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'Portfolio approval status updated successfully');
  });

  static getApplications = asyncHandler(async (req: Request, res: Response) => {
    const applications = await PlacementOfficerService.getApplications();
    return ApiResponse.success(res, applications, 'Applications retrieved successfully');
  });

  static scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    const interview = await PlacementOfficerService.scheduleInterview(req.body);
    return ApiResponse.success(res, interview, 'Interview scheduled successfully');
  });

  static publishResult = asyncHandler(async (req: Request, res: Response) => {
    const result = await PlacementOfficerService.publishResult(req.body);
    return ApiResponse.success(res, result, 'Selection result published successfully');
  });
}
export default PlacementOfficerController;
