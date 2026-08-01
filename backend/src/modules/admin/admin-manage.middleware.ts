import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';

export const checkAdminPermission = (requiredPermission: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      if (req.user.role !== 'ADMIN') {
        throw ApiError.forbidden('Only administrators can access this resource');
      }

      // Fetch admin profile
      const admin = await prisma.admin.findUnique({
        where: { userId: req.user.id },
        include: {
          permissions: {
            select: { permission: true },
          },
        },
      });

      if (!admin) {
        throw ApiError.forbidden('Admin profile not found');
      }

      if (admin.status !== 'ACTIVE') {
        throw ApiError.forbidden(`Your admin account status is ${admin.status}`);
      }

      // SUPER_ADMIN has all privileges
      if (admin.role === 'SUPER_ADMIN') {
        return next();
      }

      // Check if permission is present
      const hasPermission = admin.permissions.some(
        (p) => p.permission.toUpperCase() === requiredPermission.toUpperCase()
      );

      if (!hasPermission) {
        throw ApiError.forbidden(`You do not have required permission: ${requiredPermission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
