import { Request, Response } from 'express';
import { InterviewRoundService } from './interview-round.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class InterviewRoundController {
  // Student - Attended Companies
  static getAttendedCompanies = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.getStudentAttendedCompanies(req.user!.id);
    return ApiResponse.success(res, data, 'Attended companies fetched successfully');
  });

  static getAttendedCompanyDetails = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.getAttendedCompanyDetails(req.user!.id, req.params.applicationId as string);
    return ApiResponse.success(res, data, 'Attended company details fetched successfully');
  });

  static getStudentRoundQuestions = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.getStudentRoundQuestions(req.user!.id, req.params.studentRoundId as string);
    return ApiResponse.success(res, data, 'Student round questions fetched successfully');
  });

  static addQuestionsToRound = asyncHandler(async (req: Request, res: Response) => {
    const questionsList = req.body.questions || [req.body];
    const data = await InterviewRoundService.addQuestionsToRound(req.user!.id, req.params.studentRoundId as string, questionsList);
    return ApiResponse.created(res, data, 'Interview questions submitted successfully');
  });

  static updateQuestion = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.updateQuestion(req.user!.id, req.params.questionId as string, req.body);
    return ApiResponse.success(res, data, 'Interview question updated successfully');
  });

  static deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
    await InterviewRoundService.deleteQuestion(req.user!.id, req.params.questionId as string);
    return ApiResponse.success(res, null, 'Interview question deleted successfully');
  });

  static submitQuestionForReview = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.submitQuestionForReview(req.user!.id, req.params.questionId as string);
    return ApiResponse.success(res, data, 'Interview question submitted for review');
  });

  // Student - Exam Preparation
  static getExamPreparation = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.getExamPreparation({
      search: req.query.search as string,
      companyId: req.query.companyId as string,
      jobRole: req.query.jobRole as string,
      roundName: req.query.roundName as string,
      questionType: req.query.questionType as string,
      difficulty: req.query.difficulty as string,
      topic: req.query.topic as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    });
    return ApiResponse.success(res, data, 'Exam preparation data fetched successfully');
  });

  // Placement Officer - Interview Round Management
  static getPlacementOfficerRounds = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.getPlacementOfficerRounds({
      search: req.query.search as string,
      status: req.query.status as string,
    });
    return ApiResponse.success(res, data, 'Interview rounds management data fetched successfully');
  });

  static unlockRoundAccess = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.unlockRoundAccess(req.user!.id, req.params.studentRoundId as string, req.body.expiresAt);
    return ApiResponse.success(res, data, 'Student round question access unlocked successfully');
  });

  static revokeRoundAccess = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.revokeRoundAccess(req.user!.id, req.params.studentRoundId as string);
    return ApiResponse.success(res, data, 'Student round question access revoked successfully');
  });

  static updateStudentRoundStatus = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.updateStudentRoundStatus(req.user!.id, req.params.studentRoundId as string, req.body.status);
    return ApiResponse.success(res, data, 'Student round status updated successfully');
  });

  // Placement Officer - Question Review
  static getQuestionsForReview = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.getQuestionsForReview({
      status: req.query.status as any,
      companyId: req.query.companyId as string,
      search: req.query.search as string,
    });
    return ApiResponse.success(res, data, 'Questions for review fetched successfully');
  });

  static approveQuestion = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.approveQuestion(req.user!.id, req.params.questionId as string);
    return ApiResponse.success(res, data, 'Interview question approved successfully');
  });

  static rejectQuestion = asyncHandler(async (req: Request, res: Response) => {
    const data = await InterviewRoundService.rejectQuestion(req.user!.id, req.params.questionId as string, req.body.rejectionReason);
    return ApiResponse.success(res, data, 'Interview question rejected successfully');
  });
}
