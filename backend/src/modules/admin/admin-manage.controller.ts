import { Request, Response } from 'express';
import { AdminManageService } from './admin-manage.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../utils/api-error';
import prisma from '../../config/database';

export class AdminManageController {
  // Get currently logged-in admin's profile record ID
  private static async getPerformerAdminId(userId: string): Promise<string> {
    const admin = await prisma.admin.findUnique({
      where: { userId },
    });
    if (!admin) {
      throw ApiError.forbidden('Logged-in user does not have an admin profile');
    }
    return admin.id;
  }

  // Dashboard Stats
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await AdminManageService.getDashboardStats();
    return ApiResponse.success(res, stats, 'Admin dashboard stats retrieved');
  });

  // List admins
  static listAdmins = asyncHandler(async (req: Request, res: Response) => {
    const { search, role, status, department, sortBy, sortOrder, page, limit } = req.query;
    
    const filters = {
      search: search as string,
      role: role as string,
      status: status as string,
      department: department as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc') as 'asc' | 'desc',
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
    };

    const result = await AdminManageService.listAdmins(filters);
    return ApiResponse.success(res, result, 'Admins list retrieved successfully');
  });

  // Get single admin
  static getAdmin = asyncHandler(async (req: Request, res: Response) => {
    const admin = await AdminManageService.getAdminById(req.params.id as string);
    return ApiResponse.success(res, admin, 'Admin retrieved successfully');
  });

  // Create admin
  static createAdmin = asyncHandler(async (req: Request, res: Response) => {
    const performerId = await AdminManageController.getPerformerAdminId(req.user!.id);
    const newAdmin = await AdminManageService.createAdmin(
      req.body,
      performerId,
      req.ip,
      req.headers['user-agent'] as string | undefined
    );
    return ApiResponse.success(res, newAdmin, 'Admin user created successfully');
  });

  // Update admin
  static updateAdmin = asyncHandler(async (req: Request, res: Response) => {
    const performerId = await AdminManageController.getPerformerAdminId(req.user!.id);
    const updated = await AdminManageService.updateAdmin(
      req.params.id as string,
      req.body,
      performerId,
      req.ip,
      req.headers['user-agent'] as string | undefined
    );
    return ApiResponse.success(res, updated, 'Admin details updated successfully');
  });

  // Soft delete admin
  static deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
    const performerId = await AdminManageController.getPerformerAdminId(req.user!.id);
    await AdminManageService.deleteAdmin(
      req.params.id as string,
      performerId,
      req.ip,
      req.headers['user-agent'] as string | undefined
    );
    return ApiResponse.success(res, null, 'Admin soft deleted successfully');
  });

  // Restore admin (Undo)
  static restoreAdmin = asyncHandler(async (req: Request, res: Response) => {
    const performerId = await AdminManageController.getPerformerAdminId(req.user!.id);
    await AdminManageService.restoreAdmin(
      req.params.id as string,
      performerId,
      req.ip,
      req.headers['user-agent'] as string | undefined
    );
    return ApiResponse.success(res, null, 'Admin restored successfully');
  });

  // Update status
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id, status } = req.body;
    if (!id || !status) {
      throw ApiError.badRequest('Admin ID and Status are required');
    }
    const performerId = await AdminManageController.getPerformerAdminId(req.user!.id);
    const updated = await AdminManageService.updateStatus(
      id,
      status,
      performerId,
      req.ip,
      req.headers['user-agent']
    );
    return ApiResponse.success(res, updated, `Admin status updated to ${status}`);
  });

  // Update permissions
  static updatePermissions = asyncHandler(async (req: Request, res: Response) => {
    const { id, permissions } = req.body;
    if (!id || !Array.isArray(permissions)) {
      throw ApiError.badRequest('Admin ID and Permissions array are required');
    }
    const performerId = await AdminManageController.getPerformerAdminId(req.user!.id);
    await AdminManageService.updatePermissions(
      id,
      permissions,
      performerId,
      req.ip,
      req.headers['user-agent']
    );
    return ApiResponse.success(res, null, 'Admin permissions updated successfully');
  });

  // Get activity logs
  static getActivities = asyncHandler(async (req: Request, res: Response) => {
    const { adminId, action, limit } = req.query;
    const logs = await AdminManageService.getActivityLogs({
      adminId: adminId as string,
      action: action as string,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    return ApiResponse.success(res, logs, 'Activity logs retrieved successfully');
  });
}
