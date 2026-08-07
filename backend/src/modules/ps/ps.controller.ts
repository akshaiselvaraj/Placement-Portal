import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { ApiResponse } from '../../utils/api-response';
import { psService } from './ps.service';
import { PS_MESSAGES } from './ps.constants';
import { ApiError } from '../../utils/api-error';

export class PSController {
  static connectPS = asyncHandler(async (req: Request, res: Response) => {
    const cookie = req.headers['x-ps-session'] as string;
    if (!cookie) {
      throw ApiError.badRequest('X-PS-Session header is required');
    }

    await psService.connectPS(req.user!.id, cookie);
    return ApiResponse.success(res, null, PS_MESSAGES.CONNECT_SUCCESS);
  });

  static getPSData = asyncHandler(async (req: Request, res: Response) => {
    const student = await psService.getPSData(req.user!.id);
    
    // Return only requested PS data properties
    const psData = {
      activityPoints: student.activityPoints ?? 0,
      opportunityPoints: student.opportunityPoints ?? 0,
      responsiveScore: student.responsiveScore ?? 0,
      levelClearance: student.levelClearance ?? null,
      lastSynced: student.lastSynced ?? null,
      psConnected: student.psConnected,
    };

    return ApiResponse.success(res, psData, 'PS data fetched successfully');
  });

  static disconnectPS = asyncHandler(async (req: Request, res: Response) => {
    await psService.disconnectPS(req.user!.id);
    return ApiResponse.success(res, null, PS_MESSAGES.DISCONNECT_SUCCESS);
  });
}
