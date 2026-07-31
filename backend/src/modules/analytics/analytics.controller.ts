import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { Role } from '@prisma/client';

export class AnalyticsController {
  static getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const role = req.user!.role;
    const userId = req.user!.id;

    let stats: any = {};

    switch (role) {
      case Role.STUDENT:
        stats = await AnalyticsService.getStudentAnalytics(userId);
        break;
      case Role.RECRUITER:
        stats = await AnalyticsService.getRecruiterAnalytics(userId);
        break;
      case Role.PLACEMENT_OFFICER:
        stats = await AnalyticsService.getOfficerAnalytics(req.query as any);
        break;
      case Role.ADMIN:
        stats = await AnalyticsService.getAdminAnalytics();
        break;
      default:
        stats = {};
    }

    return ApiResponse.success(res, stats, 'Analytics stats fetched successfully');
  });

  static getOfficerReports = asyncHandler(async (req: Request, res: Response) => {
    const stats = await AnalyticsService.getOfficerAnalytics(req.query as any);
    return ApiResponse.success(res, stats, 'Officer report generated successfully');
  });
}
