import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { RoleType } from '../config/constants';

export const authorize = (...allowedRoles: RoleType[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have permission to access this resource'));
      return;
    }

    next();
  };
};
