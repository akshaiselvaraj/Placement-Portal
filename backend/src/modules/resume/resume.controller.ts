import { Request, Response } from 'express';
import { ResumeService } from './resume.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class ResumeController {
  static getResumes = asyncHandler(async (req: Request, res: Response) => {
    const resumes = await ResumeService.getResumes(req.user!.id);
    return ApiResponse.success(res, resumes, 'Resumes retrieved successfully');
  });

  static getResumeById = asyncHandler(async (req: Request, res: Response) => {
    const resume = await ResumeService.getResumeById(req.user!.id, req.user!.role, req.params.id as string);
    return ApiResponse.success(res, resume, 'Resume details retrieved successfully');
  });

  static createResume = asyncHandler(async (req: Request, res: Response) => {
    const resume = await ResumeService.createResume(req.user!.id, req.body);
    return ApiResponse.success(res, resume, 'Resume created successfully. Awaiting Placement Officer approval.', 201);
  });

  static updateResume = asyncHandler(async (req: Request, res: Response) => {
    const resume = await ResumeService.updateResume(req.user!.id, req.params.id as string, req.body);
    return ApiResponse.success(res, resume, 'Resume updated successfully. Awaiting approval review.');
  });

  static deleteResume = asyncHandler(async (req: Request, res: Response) => {
    await ResumeService.deleteResume(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Resume deleted successfully');
  });
}
export default ResumeController;
