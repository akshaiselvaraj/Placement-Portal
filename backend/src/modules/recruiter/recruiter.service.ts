import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { APPLICATION_STATUS } from '../../config/constants';
import type { updateRecruiterProfileSchema, updateApplicantStatusSchema } from './recruiter.schema';
import { z } from 'zod';

export class RecruiterService {
  static async getProfile(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        company: true,
      },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    return recruiter;
  }

  static async updateProfile(userId: string, data: z.infer<typeof updateRecruiterProfileSchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const { name, ...profileData } = data;

    return await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      return await tx.recruiterProfile.update({
        where: { userId },
        data: profileData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
            },
          },
          company: true,
        },
      });
    });
  }

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

  static async getApplicants(userId: string, jobId?: string, status?: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    // Build filter query: only fetch applications for jobs belonging to recruiter's company
    const whereClause: any = {
      job: {
        companyId: recruiter.companyId,
      },
    };

    if (jobId) {
      whereClause.jobId = jobId;
    }

    if (status) {
      whereClause.status = status;
    }

    return await prisma.application.findMany({
      where: whereClause,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            educations: true,
            projects: true,
            skills: true,
            certifications: true,
            resumes: {
              where: { isApproved: true },
              take: 1,
            },
            portfolios: {
              where: { isPublished: true, isApproved: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

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

    // Verify application exists and belongs to recruiter's company
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        student: {
          select: { userId: true },
        },
      },
    });

    if (!application || application.job.companyId !== recruiter.companyId) {
      throw ApiError.forbidden('Access denied or application not found');
    }

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { status: data.status as any },
    });

    // Create In-App Notification for Student (Phase 13 Integration)
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: 'Application Status Updated',
        message: `Your application status for "${application.job.title}" has been updated to "${data.status}".`,
        type: data.status === APPLICATION_STATUS.SELECTED ? 'SUCCESS' : data.status === APPLICATION_STATUS.REJECTED ? 'WARNING' : 'INFO',
        link: '/student/applications',
      },
    });

    return updatedApp;
  }
}
export default RecruiterService;
