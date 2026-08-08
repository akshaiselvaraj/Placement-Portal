import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { QuestionType, QuestionDifficulty, QuestionStatus, StudentRoundStatus } from '@prisma/client';

export class InterviewRoundService {
  // Helper to ensure default rounds exist for a company/placement drive and student applications
  private static async ensureDefaultRoundsForApplication(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { company: true },
        },
        studentRounds: {
          include: {
            interviewRound: true,
            roundAccess: true,
            questions: true,
          },
        },
      },
    });

    if (!application) return null;

    const companyId = application.job.companyId;

    // Check if placement drive exists for this company
    const placementDrive = await prisma.placementDrive.findFirst({
      where: { companyId },
    });

    const driveId = placementDrive?.id || null;

    // Find existing rounds for this company/drive
    let rounds = await prisma.interviewRound.findMany({
      where: {
        OR: [
          ...(driveId ? [{ placementDriveId: driveId }] : []),
          { companyId },
        ],
      },
      orderBy: { roundOrder: 'asc' },
    });

    // If no rounds exist yet, create default 3 rounds
    if (rounds.length === 0) {
      const defaultRoundTemplates = [
        { name: 'Round 1 - Aptitude & Online Assessment', roundOrder: 1, description: 'Quantitative, logical reasoning, and verbal aptitude test.' },
        { name: 'Round 2 - Technical Interview', roundOrder: 2, description: 'Core CS concepts, data structures, algorithms, and domain questions.' },
        { name: 'Round 3 - HR & Managerial Interview', roundOrder: 3, description: 'Behavioral, cultural fit, and managerial evaluation.' },
      ];

      for (const tpl of defaultRoundTemplates) {
        const createdRound = await prisma.interviewRound.create({
          data: {
            name: tpl.name,
            roundOrder: tpl.roundOrder,
            description: tpl.description,
            companyId,
            placementDriveId: driveId,
          },
        });
        rounds.push(createdRound);
      }
    }

    // Ensure StudentRound records exist for each round for this application
    for (const round of rounds) {
      const existingStudentRound = application.studentRounds.find(
        (sr) => sr.interviewRoundId === round.id
      );

      if (!existingStudentRound) {
        // If application is INTERVIEWING, HIRED, or SELECTED, default first round to COMPLETED
        let initialStatus: StudentRoundStatus = StudentRoundStatus.NOT_STARTED;
        let completedAt: Date | null = null;

        if (round.roundOrder === 1 && ['INTERVIEWING', 'SHORTLISTED', 'SELECTED', 'HIRED'].includes(application.status)) {
          initialStatus = StudentRoundStatus.COMPLETED;
          completedAt = new Date();
        } else if (round.roundOrder === 2 && ['SELECTED', 'HIRED'].includes(application.status)) {
          initialStatus = StudentRoundStatus.COMPLETED;
          completedAt = new Date();
        }

        await prisma.studentRound.create({
          data: {
            studentId: application.studentId,
            applicationId: application.id,
            interviewRoundId: round.id,
            status: initialStatus,
            completedAt,
          },
        });
      }
    }

    // Refetch updated application with student rounds
    return await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { company: true },
        },
        studentRounds: {
          include: {
            interviewRound: true,
            roundAccess: true,
            questions: true,
          },
          orderBy: { interviewRound: { roundOrder: 'asc' } },
        },
      },
    });
  }

  // ==========================================
  // 1. STUDENT - ATTENDED COMPANIES
  // ==========================================

  static async getStudentAttendedCompanies(userId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    // Get all applications of the student
    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          include: { company: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const results = [];

    for (const app of applications) {
      const updatedApp = await this.ensureDefaultRoundsForApplication(app.id);
      if (!updatedApp) continue;

      const rounds = updatedApp.studentRounds.map((sr) => {
        const isUnlocked = Boolean(
          sr.roundAccess &&
          sr.roundAccess.isUnlocked &&
          (!sr.roundAccess.expiresAt || new Date(sr.roundAccess.expiresAt) > new Date())
        );

        return {
          id: sr.id,
          interviewRoundId: sr.interviewRoundId,
          roundName: sr.interviewRound.name,
          roundOrder: sr.interviewRound.roundOrder,
          description: sr.interviewRound.description,
          status: sr.status,
          completedAt: sr.completedAt,
          isUnlocked,
          accessGrantedAt: sr.roundAccess?.grantedAt || null,
          questionsAddedCount: sr.questions.length,
          questions: sr.questions,
        };
      });

      const completedCount = rounds.filter((r) => r.status === 'COMPLETED' || r.status === 'PASSED').length;
      const unlockedCount = rounds.filter((r) => r.isUnlocked).length;

      results.push({
        applicationId: updatedApp.id,
        company: {
          id: updatedApp.job.company.id,
          name: updatedApp.job.company.name,
          logo: updatedApp.job.company.logo,
          industry: updatedApp.job.company.industry,
        },
        jobRole: updatedApp.job.title,
        jobType: updatedApp.job.type,
        applicationStatus: updatedApp.status,
        appliedAt: updatedApp.appliedAt,
        totalRounds: rounds.length,
        completedRoundsCount: completedCount,
        unlockedRoundsCount: unlockedCount,
        rounds,
      });
    }

    return results;
  }

  static async getAttendedCompanyDetails(userId: string, applicationId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const app = await prisma.application.findFirst({
      where: { id: applicationId, studentId: student.id },
    });

    if (!app) throw ApiError.notFound('Application not found or access denied');

    const updatedApp = await this.ensureDefaultRoundsForApplication(applicationId);
    if (!updatedApp) throw ApiError.notFound('Application details could not be loaded');

    const rounds = updatedApp.studentRounds.map((sr) => {
      const isUnlocked = Boolean(
        sr.roundAccess &&
        sr.roundAccess.isUnlocked &&
        (!sr.roundAccess.expiresAt || new Date(sr.roundAccess.expiresAt) > new Date())
      );

      return {
        id: sr.id,
        interviewRoundId: sr.interviewRoundId,
        roundName: sr.interviewRound.name,
        roundOrder: sr.interviewRound.roundOrder,
        description: sr.interviewRound.description,
        status: sr.status,
        completedAt: sr.completedAt,
        isUnlocked,
        questionsAddedCount: sr.questions.length,
        questions: sr.questions,
      };
    });

    return {
      applicationId: updatedApp.id,
      company: updatedApp.job.company,
      jobRole: updatedApp.job.title,
      applicationStatus: updatedApp.status,
      appliedAt: updatedApp.appliedAt,
      rounds,
    };
  }

  static async getStudentRoundQuestions(userId: string, studentRoundId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const studentRound = await prisma.studentRound.findUnique({
      where: { id: studentRoundId },
      include: {
        interviewRound: true,
        application: {
          include: { job: { include: { company: true } } },
        },
        roundAccess: true,
        questions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!studentRound || studentRound.studentId !== student.id) {
      throw ApiError.forbidden('Student round not found or access denied');
    }

    const isUnlocked = Boolean(
      studentRound.roundAccess &&
      studentRound.roundAccess.isUnlocked &&
      (!studentRound.roundAccess.expiresAt || new Date(studentRound.roundAccess.expiresAt) > new Date())
    );

    return {
      studentRoundId: studentRound.id,
      companyName: studentRound.application.job.company.name,
      jobRole: studentRound.application.job.title,
      roundName: studentRound.interviewRound.name,
      roundStatus: studentRound.status,
      isUnlocked,
      questions: studentRound.questions,
    };
  }

  // ==========================================
  // 2. STUDENT - SUBMIT QUESTIONS (STRICT AUTHORIZATION)
  // ==========================================

  static async addQuestionsToRound(userId: string, studentRoundId: string, questionsList: any[]) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const studentRound = await prisma.studentRound.findUnique({
      where: { id: studentRoundId },
      include: {
        roundAccess: true,
        application: {
          include: { job: { include: { company: true } } },
        },
        interviewRound: true,
      },
    });

    if (!studentRound) {
      throw ApiError.notFound('Student round not found');
    }

    // MANDATORY BACKEND AUTHORIZATION CHECKS
    if (studentRound.studentId !== student.id) {
      throw ApiError.forbidden('You can only submit questions for your own interview rounds.');
    }

    const isUnlocked = Boolean(
      studentRound.roundAccess &&
      studentRound.roundAccess.isUnlocked &&
      (!studentRound.roundAccess.expiresAt || new Date(studentRound.roundAccess.expiresAt) > new Date())
    );

    if (!isUnlocked) {
      throw ApiError.forbidden(
        'You are not authorized to submit questions for this round. The Placement Officer must unlock the round after completion.'
      );
    }

    // Create questions
    const createdQuestions = [];

    for (const qData of questionsList) {
      const q = await prisma.interviewQuestion.create({
        data: {
          studentId: student.id,
          studentRoundId: studentRound.id,
          question: qData.question,
          questionType: qData.questionType || QuestionType.TECHNICAL,
          difficulty: qData.difficulty || QuestionDifficulty.MEDIUM,
          topic: qData.topic || null,
          answer: qData.answer || null,
          status: qData.status || QuestionStatus.PENDING_REVIEW,
        },
      });
      createdQuestions.push(q);
    }

    return createdQuestions;
  }

  static async updateQuestion(userId: string, questionId: string, data: any) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const question = await prisma.interviewQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.studentId !== student.id) {
      throw ApiError.forbidden('Question not found or access denied');
    }

    if (question.status === QuestionStatus.APPROVED && data.status !== QuestionStatus.PENDING_REVIEW) {
      throw ApiError.forbidden('Approved questions cannot be modified unless resubmitted.');
    }

    return await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        ...(data.question && { question: data.question }),
        ...(data.questionType && { questionType: data.questionType }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.topic !== undefined && { topic: data.topic }),
        ...(data.answer !== undefined && { answer: data.answer }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  static async deleteQuestion(userId: string, questionId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const question = await prisma.interviewQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.studentId !== student.id) {
      throw ApiError.forbidden('Question not found or access denied');
    }

    if (question.status === QuestionStatus.APPROVED) {
      throw ApiError.forbidden('Approved questions cannot be deleted.');
    }

    await prisma.interviewQuestion.delete({ where: { id: questionId } });
  }

  static async submitQuestionForReview(userId: string, questionId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const question = await prisma.interviewQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.studentId !== student.id) {
      throw ApiError.forbidden('Question not found or access denied');
    }

    return await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: { status: QuestionStatus.PENDING_REVIEW },
    });
  }

  // ==========================================
  // 3. STUDENT - EXAM PREPARATION (CONSUMPTION)
  // ==========================================

  static async getExamPreparation(filters: {
    search?: string;
    companyId?: string;
    jobRole?: string;
    roundName?: string;
    questionType?: string;
    difficulty?: string;
    topic?: string;
    page?: string;
    limit?: string;
  }) {
    const pageNum = parseInt(filters.page || '1', 10);
    const limitNum = parseInt(filters.limit || '20', 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: QuestionStatus.APPROVED,
    };

    if (filters.companyId) {
      where.studentRound = {
        application: {
          job: { companyId: filters.companyId },
        },
      };
    }

    if (filters.jobRole) {
      where.studentRound = {
        ...(where.studentRound || {}),
        application: {
          ...(where.studentRound?.application || {}),
          job: {
            ...(where.studentRound?.application?.job || {}),
            title: { contains: filters.jobRole, mode: 'insensitive' },
          },
        },
      };
    }

    if (filters.questionType) {
      where.questionType = filters.questionType;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.topic) {
      where.topic = { contains: filters.topic, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { question: { contains: filters.search, mode: 'insensitive' } },
        { answer: { contains: filters.search, mode: 'insensitive' } },
        { topic: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const totalQuestions = await prisma.interviewQuestion.count({ where });

    const questions = await prisma.interviewQuestion.findMany({
      where,
      include: {
        studentRound: {
          include: {
            interviewRound: true,
            application: {
              include: {
                job: { include: { company: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.questionType,
      difficulty: q.difficulty,
      topic: q.topic,
      answer: q.answer,
      createdAt: q.createdAt,
      company: {
        id: q.studentRound.application.job.company.id,
        name: q.studentRound.application.job.company.name,
        logo: q.studentRound.application.job.company.logo,
      },
      jobRole: q.studentRound.application.job.title,
      roundName: q.studentRound.interviewRound.name,
      contributor: 'Contributed by a student', // Generic attribution for privacy
    }));

    // Aggregate companies with approved questions count
    const approvedQuestionsAll = await prisma.interviewQuestion.findMany({
      where: { status: QuestionStatus.APPROVED },
      include: {
        studentRound: {
          include: {
            interviewRound: true,
            application: {
              include: { job: { include: { company: true } } },
            },
          },
        },
      },
    });

    const companyMap = new Map<string, { id: string; name: string; logo: string | null; count: number; roles: Set<string>; rounds: Set<string> }>();

    for (const q of approvedQuestionsAll) {
      const comp = q.studentRound.application.job.company;
      const role = q.studentRound.application.job.title;
      const round = q.studentRound.interviewRound.name;

      if (!companyMap.has(comp.id)) {
        companyMap.set(comp.id, {
          id: comp.id,
          name: comp.name,
          logo: comp.logo,
          count: 0,
          roles: new Set<string>(),
          rounds: new Set<string>(),
        });
      }

      const item = companyMap.get(comp.id)!;
      item.count++;
      item.roles.add(role);
      item.rounds.add(round);
    }

    const companiesSummary = Array.from(companyMap.values()).map((c) => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      totalApprovedQuestions: c.count,
      roles: Array.from(c.roles),
      roundsCount: c.rounds.size,
    }));

    return {
      questions: sanitizedQuestions,
      pagination: {
        total: totalQuestions,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalQuestions / limitNum) || 1,
      },
      companiesSummary,
    };
  }

  // ==========================================
  // 4. PLACEMENT OFFICER - ROUND ACCESS MANAGEMENT
  // ==========================================

  static async getPlacementOfficerRounds(filters: { search?: string; status?: string }) {
    // Get all student rounds across applications
    const studentRounds = await prisma.studentRound.findMany({
      include: {
        student: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        interviewRound: true,
        application: {
          include: {
            job: { include: { company: true } },
          },
        },
        roundAccess: {
          include: {
            grantedBy: { select: { name: true, email: true } },
          },
        },
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let filtered = studentRounds;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sr) =>
          sr.student.user.name.toLowerCase().includes(s) ||
          sr.student.rollNumber.toLowerCase().includes(s) ||
          sr.application.job.company.name.toLowerCase().includes(s) ||
          sr.application.job.title.toLowerCase().includes(s) ||
          sr.interviewRound.name.toLowerCase().includes(s)
      );
    }

    return filtered.map((sr) => {
      const isUnlocked = Boolean(
        sr.roundAccess &&
        sr.roundAccess.isUnlocked &&
        (!sr.roundAccess.expiresAt || new Date(sr.roundAccess.expiresAt) > new Date())
      );

      return {
        studentRoundId: sr.id,
        student: {
          id: sr.student.id,
          name: sr.student.user.name,
          email: sr.student.user.email,
          rollNumber: sr.student.rollNumber,
          department: sr.student.department,
        },
        company: {
          id: sr.application.job.company.id,
          name: sr.application.job.company.name,
          logo: sr.application.job.company.logo,
        },
        jobRole: sr.application.job.title,
        applicationId: sr.application.id,
        applicationStatus: sr.application.status,
        round: {
          id: sr.interviewRound.id,
          name: sr.interviewRound.name,
          order: sr.interviewRound.roundOrder,
        },
        roundStatus: sr.status,
        completedAt: sr.completedAt,
        isUnlocked,
        grantedBy: sr.roundAccess?.grantedBy?.name || null,
        grantedAt: sr.roundAccess?.grantedAt || null,
        expiresAt: sr.roundAccess?.expiresAt || null,
        questionsCount: sr.questions.length,
      };
    });
  }

  static async unlockRoundAccess(officerUserId: string, studentRoundId: string, expiresAt?: string | null) {
    const studentRound = await prisma.studentRound.findUnique({
      where: { id: studentRoundId },
      include: {
        student: { include: { user: true } },
        interviewRound: true,
        application: { include: { job: { include: { company: true } } } },
      },
    });

    if (!studentRound) throw ApiError.notFound('Student round not found');

    // Update round status to COMPLETED if not already
    let newStatus = studentRound.status;
    if (studentRound.status === 'NOT_STARTED' || studentRound.status === 'SCHEDULED' || studentRound.status === 'IN_PROGRESS') {
      newStatus = StudentRoundStatus.COMPLETED;
    }

    return await prisma.$transaction(async (tx) => {
      await tx.studentRound.update({
        where: { id: studentRoundId },
        data: {
          status: newStatus,
          completedAt: studentRound.completedAt || new Date(),
        },
      });

      const access = await tx.roundAccess.upsert({
        where: { studentRoundId },
        update: {
          isUnlocked: true,
          grantedById: officerUserId,
          grantedAt: new Date(),
          revokedAt: null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
        create: {
          studentRoundId,
          studentId: studentRound.studentId,
          grantedById: officerUserId,
          isUnlocked: true,
          grantedAt: new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      // Send notification to student
      await tx.notification.create({
        data: {
          userId: studentRound.student.userId,
          title: 'Interview Round Unlocked',
          message: `Question contribution access for ${studentRound.interviewRound.name} at ${studentRound.application.job.company.name} has been unlocked! You can now submit your interview experience.`,
          type: 'SUCCESS',
          link: '/student/attended-companies',
        },
      });

      return access;
    });
  }

  static async revokeRoundAccess(officerUserId: string, studentRoundId: string) {
    const studentRound = await prisma.studentRound.findUnique({
      where: { id: studentRoundId },
    });

    if (!studentRound) throw ApiError.notFound('Student round not found');

    return await prisma.roundAccess.update({
      where: { studentRoundId },
      data: {
        isUnlocked: false,
        revokedAt: new Date(),
      },
    });
  }

  static async updateStudentRoundStatus(officerUserId: string, studentRoundId: string, status: StudentRoundStatus) {
    const sr = await prisma.studentRound.findUnique({ where: { id: studentRoundId } });
    if (!sr) throw ApiError.notFound('Student round not found');

    return await prisma.studentRound.update({
      where: { id: studentRoundId },
      data: {
        status,
        completedAt: ['COMPLETED', 'PASSED'].includes(status) ? new Date() : sr.completedAt,
      },
    });
  }

  // ==========================================
  // 5. PLACEMENT OFFICER - QUESTION MODERATION
  // ==========================================

  static async getQuestionsForReview(filters: { status?: QuestionStatus; companyId?: string; search?: string }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.companyId) {
      where.studentRound = {
        application: {
          job: { companyId: filters.companyId },
        },
      };
    }

    if (filters.search) {
      where.OR = [
        { question: { contains: filters.search, mode: 'insensitive' } },
        { student: { user: { name: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }

    const questions = await prisma.interviewQuestion.findMany({
      where,
      include: {
        student: {
          include: { user: { select: { name: true, email: true, avatar: true } } },
        },
        studentRound: {
          include: {
            interviewRound: true,
            application: {
              include: { job: { include: { company: true } } },
            },
          },
        },
        reviewedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return questions.map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.questionType,
      difficulty: q.difficulty,
      topic: q.topic,
      answer: q.answer,
      status: q.status,
      rejectionReason: q.rejectionReason,
      createdAt: q.createdAt,
      student: {
        id: q.student.id,
        name: q.student.user.name,
        rollNumber: q.student.rollNumber,
        department: q.student.department,
      },
      company: {
        id: q.studentRound.application.job.company.id,
        name: q.studentRound.application.job.company.name,
        logo: q.studentRound.application.job.company.logo,
      },
      jobRole: q.studentRound.application.job.title,
      roundName: q.studentRound.interviewRound.name,
      reviewedBy: q.reviewedBy?.name || null,
      reviewedAt: q.reviewedAt || null,
    }));
  }

  static async approveQuestion(officerUserId: string, questionId: string) {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: {
        student: { include: { user: true } },
        studentRound: {
          include: {
            interviewRound: true,
            application: { include: { job: { include: { company: true } } } },
          },
        },
      },
    });

    if (!question) throw ApiError.notFound('Interview question not found');

    const updated = await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        status: QuestionStatus.APPROVED,
        reviewedById: officerUserId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: question.student.userId,
        title: 'Interview Question Approved',
        message: `Your interview question for ${question.studentRound.application.job.company.name} (${question.studentRound.interviewRound.name}) has been approved and published to Exam Preparation!`,
        type: 'SUCCESS',
        link: '/student/exam-preparation',
      },
    });

    return updated;
  }

  static async rejectQuestion(officerUserId: string, questionId: string, rejectionReason?: string) {
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: {
        student: { include: { user: true } },
        studentRound: {
          include: {
            interviewRound: true,
            application: { include: { job: { include: { company: true } } } },
          },
        },
      },
    });

    if (!question) throw ApiError.notFound('Interview question not found');

    const updated = await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        status: QuestionStatus.REJECTED,
        rejectionReason: rejectionReason || 'Requires revision',
        reviewedById: officerUserId,
        reviewedAt: new Date(),
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: question.student.userId,
        title: 'Interview Question Requires Changes',
        message: `Your interview question for ${question.studentRound.application.job.company.name} was not approved. Reason: ${rejectionReason || 'Requires revision'}. You can update and resubmit it.`,
        type: 'WARNING',
        link: '/student/attended-companies',
      },
    });

    return updated;
  }
}
