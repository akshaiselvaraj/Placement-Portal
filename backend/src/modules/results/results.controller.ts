import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { ApiResponse } from '../../utils/api-response';
import { resultsService } from './results.service';
import { syncResultsSchema } from './results.validation';
import { ApiError } from '../../utils/api-error';
import prisma from '../../config/database';

export class ResultsController {
  static getResults = asyncHandler(async (req: Request, res: Response) => {
    const results = await resultsService.getStudentResults(req.user!.id);
    return ApiResponse.success(res, results, 'Academic results retrieved successfully');
  });

  static getSemesterResult = asyncHandler(async (req: Request, res: Response) => {
    const semester = parseInt(req.params.semester as string);
    if (isNaN(semester) || semester <= 0) {
      throw ApiError.badRequest('Invalid semester number');
    }

    const result = await resultsService.getSemesterResult(req.user!.id, semester);
    if (!result) {
      throw ApiError.notFound(`Academic results for semester ${semester} not found`);
    }

    return ApiResponse.success(res, result, `Semester ${semester} results retrieved successfully`);
  });

  static syncResults = asyncHandler(async (req: Request, res: Response) => {
    // 1. Validate payload structure using Zod
    const validationResult = syncResultsSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });
      throw ApiError.badRequest('Invalid results payload', errors);
    }

    // 2. Execute sync orchestration
    const syncStatus = await resultsService.syncResults(req.user!.id, validationResult.data);
    return ApiResponse.success(res, syncStatus, 'Academic results synchronized successfully');
  });

  static getStatus = asyncHandler(async (req: Request, res: Response) => {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    const results = await resultsService.getStudentResults(req.user!.id);

    return ApiResponse.success(res, {
      connected: student.psConnected,
      lastSynced: student.lastSynced || null,
      resultAvailable: results.length > 0
    }, 'Status retrieved successfully');
  });
}
