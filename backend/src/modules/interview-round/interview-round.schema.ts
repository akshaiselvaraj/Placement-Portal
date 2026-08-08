import { z } from 'zod';
import { QuestionType, QuestionDifficulty, QuestionStatus, StudentRoundStatus } from '@prisma/client';

export const createInterviewRoundSchema = z.object({
  placementDriveId: z.string().optional(),
  companyId: z.string().optional(),
  name: z.string().min(1, 'Round name is required'),
  roundOrder: z.number().int().positive().default(1),
  description: z.string().optional(),
});

export const updateStudentRoundStatusSchema = z.object({
  status: z.nativeEnum(StudentRoundStatus),
});

export const unlockRoundAccessSchema = z.object({
  expiresAt: z.string().optional().nullable(),
});

export const createQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters long').max(2000, 'Question is too long'),
  questionType: z.nativeEnum(QuestionType).default(QuestionType.TECHNICAL),
  difficulty: z.nativeEnum(QuestionDifficulty).default(QuestionDifficulty.MEDIUM),
  topic: z.string().max(100).optional(),
  answer: z.string().max(4000).optional(),
  status: z.nativeEnum(QuestionStatus).optional().default(QuestionStatus.PENDING_REVIEW),
});

export const createQuestionsBatchSchema = z.object({
  questions: z.array(createQuestionSchema).min(1, 'At least one question is required'),
});

export const updateQuestionSchema = z.object({
  question: z.string().min(5).max(2000).optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
  difficulty: z.nativeEnum(QuestionDifficulty).optional(),
  topic: z.string().max(100).optional().nullable(),
  answer: z.string().max(4000).optional().nullable(),
  status: z.nativeEnum(QuestionStatus).optional(),
});

export const rejectQuestionSchema = z.object({
  rejectionReason: z.string().max(1000).optional(),
});
