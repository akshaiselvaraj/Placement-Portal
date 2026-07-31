import { Request, Response } from 'express';
import { StudentService } from './student.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class StudentController {
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const student = await StudentService.getProfileByUserId(req.user!.id);
    return ApiResponse.success(res, student, 'Student profile fetched successfully');
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const student = await StudentService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, student, 'Student profile updated successfully');
  });

  // --- Education Controller Methods ---
  static addEducation = asyncHandler(async (req: Request, res: Response) => {
    const edu = await StudentService.addEducation(req.user!.id, req.body);
    return ApiResponse.created(res, edu, 'Education record added successfully');
  });

  static updateEducation = asyncHandler(async (req: Request, res: Response) => {
    const edu = await StudentService.updateEducation(req.user!.id, req.params.id as string, req.body);
    return ApiResponse.success(res, edu, 'Education record updated successfully');
  });

  static deleteEducation = asyncHandler(async (req: Request, res: Response) => {
    await StudentService.deleteEducation(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Education record deleted successfully');
  });

  // --- Projects Controller Methods ---
  static addProject = asyncHandler(async (req: Request, res: Response) => {
    const proj = await StudentService.addProject(req.user!.id, req.body);
    return ApiResponse.created(res, proj, 'Project record added successfully');
  });

  static updateProject = asyncHandler(async (req: Request, res: Response) => {
    const proj = await StudentService.updateProject(req.user!.id, req.params.id as string, req.body);
    return ApiResponse.success(res, proj, 'Project record updated successfully');
  });

  static deleteProject = asyncHandler(async (req: Request, res: Response) => {
    await StudentService.deleteProject(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Project record deleted successfully');
  });

  // --- Skills Controller Methods ---
  static addSkill = asyncHandler(async (req: Request, res: Response) => {
    const skill = await StudentService.addSkill(req.user!.id, req.body);
    return ApiResponse.created(res, skill, 'Skill added successfully');
  });

  static deleteSkill = asyncHandler(async (req: Request, res: Response) => {
    await StudentService.deleteSkill(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Skill deleted successfully');
  });

  // --- Certifications Controller Methods ---
  static addCertification = asyncHandler(async (req: Request, res: Response) => {
    const cert = await StudentService.addCertification(req.user!.id, req.body);
    return ApiResponse.created(res, cert, 'Certification record added successfully');
  });

  static updateCertification = asyncHandler(async (req: Request, res: Response) => {
    const cert = await StudentService.updateCertification(req.user!.id, req.params.id as string, req.body);
    return ApiResponse.success(res, cert, 'Certification record updated successfully');
  });

  static deleteCertification = asyncHandler(async (req: Request, res: Response) => {
    await StudentService.deleteCertification(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Certification record deleted successfully');
  });
}
export default StudentController;
