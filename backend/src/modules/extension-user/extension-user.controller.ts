import { Request, Response } from 'express';
import { ExtensionUserService } from './extension-user.service';
import {
  registerExtensionUserSchema,
  createActivityLogSchema,
  updateExtensionUserSchema,
} from './extension-user.validation';

export class ExtensionUserController {
  // Public endpoint for extension registration
  static async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerExtensionUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: parsed.error.format(),
        });
        return;
      }

      const result = await ExtensionUserService.registerUser(parsed.data);

      res.status(result.isNew ? 201 : 200).json({
        success: true,
        message: result.isNew
          ? 'Extension user registered successfully'
          : 'User profile retrieved successfully',
        data: result.user,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to register extension user',
      });
    }
  }

  // Public/Extension endpoint to post activity logs
  static async logActivity(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createActivityLogSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid activity payload',
          errors: parsed.error.format(),
        });
        return;
      }

      const log = await ExtensionUserService.logActivity(parsed.data);

      res.status(201).json({
        success: true,
        message: 'Activity logged successfully',
        data: log,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to record activity log',
      });
    }
  }

  // Admin endpoint: List extension users with search, sort, filter, pagination
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { search, status, sortBy, order, page, limit } = req.query;

      const result = await ExtensionUserService.getAllUsers({
        search: search ? String(search) : undefined,
        status: status ? String(status) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        order: order === 'asc' ? 'asc' : 'desc',
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 10,
      });

      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch users list',
      });
    }
  }

  // Admin endpoint: Get single user detail
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const user = await ExtensionUserService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Extension user not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch user details',
      });
    }
  }

  // Admin endpoint: Update user status or details
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const parsed = updateExtensionUserSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid input payload',
          errors: parsed.error.format(),
        });
        return;
      }

      const updated = await ExtensionUserService.updateUser(id, parsed.data);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Extension user not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to update user',
      });
    }
  }

  // Admin endpoint: Dashboard KPI Stats
  static async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await ExtensionUserService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch dashboard stats',
      });
    }
  }

  // Admin endpoint: System activity logs list
  static async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = req.query;

      const result = await ExtensionUserService.getAllActivityLogs({
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 20,
      });

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch activity logs',
      });
    }
  }
}
