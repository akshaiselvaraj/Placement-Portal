import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    return ApiResponse.created(res, result, 'User registered successfully');
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    return ApiResponse.success(res, result, 'Login successful');
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    // req.user is guaranteed to be set by the authenticate middleware
    const result = await AuthService.me(req.user!.id);
    return ApiResponse.success(res, result, 'Current user profile fetched');
  });

  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.changePassword(req.user!.id, req.body);
    return ApiResponse.success(res, null, 'Password updated successfully');
  });
}
