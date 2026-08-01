import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class AdminController {
  static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await AdminService.getUsers(req.query);
    return ApiResponse.success(res, users, 'Users retrieved successfully');
  });

  static toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const updated = await AdminService.toggleUserStatus(req.params.id as string, req.body);
    return ApiResponse.success(res, updated, 'User status updated successfully');
  });

  static getCompanies = asyncHandler(async (req: Request, res: Response) => {
    const companies = await AdminService.getCompanies();
    return ApiResponse.success(res, companies, 'Companies retrieved successfully');
  });

  static createCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await AdminService.createCompany(req.body);
    return ApiResponse.success(res, company, 'Company registered successfully');
  });

  static updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await AdminService.updateCompany(req.params.id as string, req.body);
    return ApiResponse.success(res, company, 'Company details updated successfully');
  });

  static getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await AdminService.getSettings();
    return ApiResponse.success(res, settings, 'System settings retrieved successfully');
  });

  static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await AdminService.updateSettings(req.body);
    return ApiResponse.success(res, settings, 'System settings updated successfully');
  });
}
export default AdminController;

