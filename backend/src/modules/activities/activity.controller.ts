import { Request, Response } from 'express';
import { ActivityService } from './activity.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { ActivityOtpType, Role } from '@prisma/client';

export class ActivityController {
  static createActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await ActivityService.createActivity(req.body, req.user!.id);
    return ApiResponse.created(res, activity, 'Activity created successfully');
  });

  static getActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await ActivityService.getActivities(req.user!.role, req.user!.id);
    return ApiResponse.success(res, activities, 'Activities fetched successfully');
  });

  static getStudentActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await ActivityService.getStudentActivities(req.user!.id);
    return ApiResponse.success(res, activities, 'My activities fetched successfully');
  });

  static getActivityDetails = asyncHandler(async (req: Request, res: Response) => {
    const activity = await ActivityService.getActivityDetails(req.params.id as string, req.user!.role, req.user!.id);
    return ApiResponse.success(res, activity, 'Activity details fetched successfully');
  });

  static updateActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await ActivityService.updateActivity(req.params.id as string, req.body, req.user!.id, req.user!.role);
    return ApiResponse.success(res, activity, 'Activity updated successfully');
  });

  static cancelActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await ActivityService.cancelActivity(req.params.id as string, req.user!.id, req.user!.role);
    return ApiResponse.success(res, activity, 'Activity cancelled successfully');
  });

  static regenerateOtp = asyncHandler(async (req: Request, res: Response) => {
    const { type } = req.body;
    if (!type || !Object.values(ActivityOtpType).includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP type specified' });
    }
    const result = await ActivityService.generateOtp(req.params.id as string, type as ActivityOtpType, req.user!.id);
    return ApiResponse.success(res, result, 'OTP regenerated successfully');
  });

  // Student participation actions
  static joinActivity = asyncHandler(async (req: Request, res: Response) => {
    const { otp } = req.body;
    const participant = await ActivityService.joinActivity(req.params.id as string, req.user!.id, otp);
    return ApiResponse.success(res, participant, 'Joined activity successfully');
  });

  static startActivity = asyncHandler(async (req: Request, res: Response) => {
    const { otp } = req.body;
    const participant = await ActivityService.startActivity(req.params.id as string, req.user!.id, otp);
    return ApiResponse.success(res, participant, 'Activity started successfully');
  });

  static endActivity = asyncHandler(async (req: Request, res: Response) => {
    const { otp } = req.body;
    const participant = await ActivityService.endActivity(req.params.id as string, req.user!.id, otp);
    return ApiResponse.success(res, participant, 'Activity completed successfully. Points awarded!');
  });

  static getParticipants = asyncHandler(async (req: Request, res: Response) => {
    const participants = await ActivityService.getParticipants(req.params.id as string);
    return ApiResponse.success(res, participants, 'Participants list fetched successfully');
  });

  static getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const logs = await ActivityService.getAuditLogs(req.params.id as string);
    return ApiResponse.success(res, logs, 'Audit logs fetched successfully');
  });

  static getAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ActivityService.getAnalytics();
    return ApiResponse.success(res, stats, 'Analytics stats fetched successfully');
  });
}
