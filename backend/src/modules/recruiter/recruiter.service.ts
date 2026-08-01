import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { APPLICATION_STATUS } from '../../config/constants';
import type {
  updateRecruiterProfileSchema,
  updateApplicantStatusSchema,
  applicantQuerySchema,
  scheduleInterviewSchema,
  updateInterviewSchema,
} from './recruiter.schema';
import { z } from 'zod';
import { AtsService } from './ats.service';

export class RecruiterService {
  /**
   * Get dynamic dashboard stats directly from the database.
   */
  static async getDashboardStats(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true, user: { select: { name: true } } },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const companyId = recruiter.companyId;

    // Fetch jobs for company
    const jobs = await prisma.job.findMany({
      where: { companyId },
      select: { id: true, status: true },
    });

    const activeJobsCount = jobs.filter((j) => j.status === 'OPEN').length;
    const closedJobsCount = jobs.filter((j) => j.status === 'CLOSED' || j.status === 'FILLED').length;
    const jobIds = jobs.map((j) => j.id);

    // Fetch all applications for recruiter's jobs
    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: {
        job: { select: { id: true, title: true } },
        student: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            skills: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const totalApplicants = applications.length;
    const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
    const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
    const inInterviewCount = applications.filter((a) => a.status === 'INTERVIEWING').length;
    const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
    const hiredCount = applications.filter((a) => a.status === 'HIRED').length;
    const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

    // Recent applications (top 10)
    const recentApplications = applications.slice(0, 10).map((app) => ({
      id: app.id,
      studentId: app.studentId,
      studentName: app.student.user.name,
      studentAvatar: app.student.user.avatar,
      jobTitle: app.job.title,
      jobId: app.job.id,
      appliedAt: app.appliedAt,
      status: app.status,
      atsScore: app.atsScore ?? 0,
      atsBreakdown: app.atsBreakdown,
    }));

    return {
      stats: {
        totalApplicants,
        underReviewCount,
        shortlistedCount,
        inInterviewCount,
        selectedCount,
        hiredCount,
        rejectedCount,
        activeJobsCount,
        closedJobsCount,
      },
      recentApplications,
    };
  }

  /**
   * Get Recruiter Profile.
   */
  static async getProfile(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, email: true, name: true, avatar: true },
        },
        company: true,
      },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    return recruiter;
  }

  /**
   * Update Recruiter Profile & Company Profile.
   */
  static async updateProfile(userId: string, data: z.infer<typeof updateRecruiterProfileSchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { id: true, companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    return await prisma.$transaction(async (tx) => {
      if (data.name) {
        await tx.user.update({
          where: { id: userId },
          data: { name: data.name },
        });
      }

      if (data.designation !== undefined || data.phone !== undefined) {
        await tx.recruiterProfile.update({
          where: { userId },
          data: {
            ...(data.designation !== undefined && { designation: data.designation }),
            ...(data.phone !== undefined && { phone: data.phone }),
          },
        });
      }

      if (data.company) {
        await tx.company.update({
          where: { id: recruiter.companyId },
          data: {
            ...(data.company.name && { name: data.company.name }),
            ...(data.company.logo !== undefined && { logo: data.company.logo }),
            ...(data.company.website !== undefined && { website: data.company.website }),
            ...(data.company.industry !== undefined && { industry: data.company.industry }),
            ...(data.company.description !== undefined && { description: data.company.description }),
            ...(data.company.location !== undefined && { location: data.company.location }),
            ...(data.company.email !== undefined && { email: data.company.email }),
            ...(data.company.phone !== undefined && { phone: data.company.phone }),
            ...(data.company.size !== undefined && { size: data.company.size }),
            ...(data.company.foundedYear !== undefined && { foundedYear: data.company.foundedYear }),
            ...(data.company.address !== undefined && { address: data.company.address }),
          },
        });
      }

      return await tx.recruiterProfile.findUnique({
        where: { userId },
        include: {
          user: { select: { id: true, email: true, name: true, avatar: true } },
          company: true,
        },
      });
    });
  }

  /**
   * Get Company Details for Recruiter.
   */
  static async getCompany(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const company = await prisma.company.findUnique({
      where: { id: recruiter.companyId },
    });

    if (!company) {
      throw ApiError.notFound('Company details not found');
    }

    return company;
  }

  /**
   * Get Applicants with advanced filtering, sorting, pagination, and ATS recalculation.
   */
  static async getApplicants(userId: string, filters: z.infer<typeof applicantQuerySchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const whereClause: any = {
      job: {
        companyId: recruiter.companyId,
      },
    };

    if (filters.jobId) {
      whereClause.jobId = filters.jobId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.student = {
        user: {
          name: { contains: filters.search, mode: 'insensitive' },
        },
      };
    }

    if (filters.department) {
      whereClause.student = {
        ...whereClause.student,
        department: { contains: filters.department, mode: 'insensitive' },
      };
    }

    if (filters.gradYear) {
      whereClause.student = {
        ...whereClause.student,
        batch: filters.gradYear,
      };
    }

    if (filters.minCgpa) {
      whereClause.student = {
        ...whereClause.student,
        cgpa: { gte: parseFloat(filters.minCgpa) },
      };
    }

    if (filters.maxCgpa) {
      whereClause.student = {
        ...whereClause.student,
        cgpa: {
          ...(whereClause.student?.cgpa || {}),
          lte: parseFloat(filters.maxCgpa),
        },
      };
    }

    if (filters.minAts) {
      whereClause.atsScore = { gte: parseFloat(filters.minAts) };
    }

    if (filters.maxAts) {
      whereClause.atsScore = {
        ...(whereClause.atsScore || {}),
        lte: parseFloat(filters.maxAts),
      };
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true,
            requiredSkills: true,
            preferredSkills: true,
            minCgpa: true,
            eligibleDepartments: true,
            eligibleGradYears: true,
            requiredExperience: true,
          },
        },
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
            educations: true,
            projects: true,
            skills: true,
            certifications: true,
            resumes: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
            portfolios: {
              where: { isPublished: true },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        interviews: {
          orderBy: { date: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    // Ensure ATS score is computed if missing
    const enrichedApplications = await Promise.all(
      applications.map(async (app) => {
        if (app.atsScore === null || app.atsScore === undefined) {
          const atsBreakdown = AtsService.calculateMatch(app.student, app.job);
          await prisma.application.update({
            where: { id: app.id },
            data: {
              atsScore: atsBreakdown.score,
              atsBreakdown: atsBreakdown as any,
            },
          });
          return { ...app, atsScore: atsBreakdown.score, atsBreakdown };
        }
        return app;
      })
    );

    return enrichedApplications;
  }

  /**
   * Get single candidate profile and application details.
   */
  static async getCandidateDetails(userId: string, applicationId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
            educations: true,
            projects: true,
            skills: true,
            certifications: true,
            resumes: true,
            portfolios: true,
          },
        },
        interviews: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!application || application.job.companyId !== recruiter.companyId) {
      throw ApiError.forbidden('Access denied or application not found');
    }

    // Always compute/verify live ATS breakdown against current candidate data
    const atsBreakdown = AtsService.calculateMatch(application.student, application.job);

    return {
      ...application,
      atsScore: atsBreakdown.score,
      atsBreakdown,
    };
  }

  /**
   * Update Applicant Status & Record History.
   */
  static async updateApplicantStatus(
    userId: string,
    applicationId: string,
    data: z.infer<typeof updateApplicantStatusSchema>
  ) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        student: { select: { userId: true } },
      },
    });

    if (!application || application.job.companyId !== recruiter.companyId) {
      throw ApiError.forbidden('Access denied or application not found');
    }

    const previousStatus = application.status;
    const newStatus = data.status;

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        ...(newStatus === 'HIRED' && { hiredAt: new Date() }),
        ...(data.joiningDate && { joiningDate: new Date(data.joiningDate) }),
        ...(data.offerStatus && { offerStatus: data.offerStatus }),
        statusHistory: {
          create: {
            fromStatus: previousStatus,
            toStatus: newStatus,
            changedBy: userId,
            notes: data.notes || `Status updated from ${previousStatus} to ${newStatus}`,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Send notification to candidate
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: `Application Status Updated: ${newStatus}`,
        message: `Your application status for "${application.job.title}" is now "${newStatus.replace('_', ' ')}".`,
        type: newStatus === 'SELECTED' || newStatus === 'HIRED' ? 'SUCCESS' : newStatus === 'REJECTED' ? 'WARNING' : 'INFO',
        link: '/student/applications',
      },
    });

    return updatedApp;
  }

  /**
   * Search Candidates across student pool.
   */
  static async searchCandidates(userId: string, query: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const whereClause = query && query.trim()
      ? {
          OR: [
            { user: { name: { contains: query, mode: 'insensitive' } } },
            { user: { email: { contains: query, mode: 'insensitive' } } },
            { department: { contains: query, mode: 'insensitive' } },
            { skills: { some: { name: { contains: query, mode: 'insensitive' } } } },
          ],
        }
      : {};

    return await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        skills: true,
        educations: true,
        projects: true,
        certifications: true,
        resumes: { take: 1 },
        portfolios: { where: { isPublished: true }, take: 1 },
      },
      take: 50,
    });
  }


  /**
   * Schedule an interview.
   */
  static async scheduleInterview(userId: string, data: z.infer<typeof scheduleInterviewSchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        job: true,
        student: { select: { userId: true, user: { select: { name: true } } } },
      },
    });

    if (!application || application.job.companyId !== recruiter.companyId) {
      throw ApiError.forbidden('Access denied or application not found');
    }

    // Create interview record
    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        date: new Date(data.date),
        time: data.time || '10:00 AM',
        duration: data.duration || 45,
        interviewer: data.interviewer || 'Hiring Team',
        meetingLink: data.meetingLink || '',
        roundType: data.roundType || 'Technical',
        location: data.location || 'Online',
        notes: data.notes || '',
        status: 'SCHEDULED',
      },
    });

    // Move candidate application status to INTERVIEWING if not already
    if (application.status !== 'INTERVIEWING') {
      await prisma.application.update({
        where: { id: data.applicationId },
        data: {
          status: 'INTERVIEWING',
          statusHistory: {
            create: {
              fromStatus: application.status,
              toStatus: 'INTERVIEWING',
              changedBy: userId,
              notes: `Interview scheduled for ${data.date}`,
            },
          },
        },
      });
    }

    // Notify candidate
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: 'Interview Scheduled',
        message: `An interview for "${application.job.title}" has been scheduled on ${new Date(data.date).toLocaleDateString()}.`,
        type: 'ACTION',
        link: '/student/applications',
      },
    });

    return interview;
  }

  /**
   * Get all interviews for recruiter's company.
   */
  static async getInterviews(userId: string, status?: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const whereClause: any = {
      application: {
        job: {
          companyId: recruiter.companyId,
        },
      },
    };

    if (status) {
      whereClause.status = status;
    }

    return await prisma.interview.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true } },
            student: {
              include: {
                user: { select: { name: true, email: true, avatar: true } },
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Update Interview Status / Log Result (Pass/Fail).
   */
  static async updateInterview(userId: string, interviewId: string, data: z.infer<typeof updateInterviewSchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            job: true,
            student: { select: { userId: true } },
          },
        },
      },
    });

    if (!interview || interview.application.job.companyId !== recruiter.companyId) {
      throw ApiError.forbidden('Access denied or interview not found');
    }

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.time !== undefined && { time: data.time }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.interviewer !== undefined && { interviewer: data.interviewer }),
        ...(data.meetingLink !== undefined && { meetingLink: data.meetingLink }),
        ...(data.roundType !== undefined && { roundType: data.roundType }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.result !== undefined && { result: data.result }),
        ...(data.feedback !== undefined && { feedback: data.feedback }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    // If result was set to PASSED, option to move candidate to SELECTED
    if (data.result === 'PASSED') {
      await prisma.application.update({
        where: { id: interview.applicationId },
        data: {
          status: 'SELECTED',
          statusHistory: {
            create: {
              fromStatus: interview.application.status,
              toStatus: 'SELECTED',
              changedBy: userId,
              notes: `Interview passed: ${data.feedback || 'Recommended for hiring'}`,
            },
          },
        },
      });

      await prisma.notification.create({
        data: {
          userId: interview.application.student.userId,
          title: 'Congratulations! Selected for Role',
          message: `You passed your interview and have been selected for "${interview.application.job.title}".`,
          type: 'SUCCESS',
          link: '/student/applications',
        },
      });
    }

    return updated;
  }

  /**
   * Get Hiring History for company.
   */
  static async getHiringHistory(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    return await prisma.application.findMany({
      where: {
        job: { companyId: recruiter.companyId },
        status: { in: ['SELECTED', 'HIRED'] },
      },
      include: {
        job: { select: { id: true, title: true, type: true } },
        student: {
          include: {
            user: { select: { name: true, email: true, avatar: true } },
            educations: true,
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export default RecruiterService;
