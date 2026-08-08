import { Router } from 'express';
import { InterviewRoundController } from './interview-round.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  updateQuestionSchema,
  rejectQuestionSchema,
  updateStudentRoundStatusSchema,
} from './interview-round.schema';

const studentInterviewRouter = Router();

// Student Attended Companies
studentInterviewRouter.get('/attended-companies', authenticate, authorize('STUDENT'), InterviewRoundController.getAttendedCompanies);
studentInterviewRouter.get('/attended-companies/:applicationId', authenticate, authorize('STUDENT'), InterviewRoundController.getAttendedCompanyDetails);
studentInterviewRouter.get('/rounds/:studentRoundId/questions', authenticate, authorize('STUDENT'), InterviewRoundController.getStudentRoundQuestions);
studentInterviewRouter.post('/rounds/:studentRoundId/questions', authenticate, authorize('STUDENT'), InterviewRoundController.addQuestionsToRound);

// Student Questions Management
studentInterviewRouter.patch('/questions/:questionId', authenticate, authorize('STUDENT'), validate(updateQuestionSchema), InterviewRoundController.updateQuestion);
studentInterviewRouter.delete('/questions/:questionId', authenticate, authorize('STUDENT'), InterviewRoundController.deleteQuestion);
studentInterviewRouter.post('/questions/:questionId/submit', authenticate, authorize('STUDENT'), InterviewRoundController.submitQuestionForReview);

// Student Exam Preparation (Approved Questions)
studentInterviewRouter.get('/exam-preparation', authenticate, authorize('STUDENT'), InterviewRoundController.getExamPreparation);

const placementInterviewRouter = Router();

// Placement Officer - Interview Round Management
placementInterviewRouter.get('/interview-rounds', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), InterviewRoundController.getPlacementOfficerRounds);
placementInterviewRouter.post('/student-rounds/:studentRoundId/status', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), validate(updateStudentRoundStatusSchema), InterviewRoundController.updateStudentRoundStatus);
placementInterviewRouter.post('/student-rounds/:studentRoundId/unlock', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), InterviewRoundController.unlockRoundAccess);
placementInterviewRouter.post('/student-rounds/:studentRoundId/revoke', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), InterviewRoundController.revokeRoundAccess);

// Placement Officer - Question Review
placementInterviewRouter.get('/interview-questions', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), InterviewRoundController.getQuestionsForReview);
placementInterviewRouter.post('/interview-questions/:questionId/approve', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), InterviewRoundController.approveQuestion);
placementInterviewRouter.post('/interview-questions/:questionId/reject', authenticate, authorize('PLACEMENT_OFFICER', 'ADMIN'), validate(rejectQuestionSchema), InterviewRoundController.rejectQuestion);

export { studentInterviewRouter, placementInterviewRouter };
