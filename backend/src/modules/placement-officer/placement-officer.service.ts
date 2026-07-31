import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type {
  studentQuerySchema,
  verifyStudentSchema,
  approveAssetSchema,
  scheduleInterviewSchema,
  publishResultSchema,
} from './placement-officer.schema';

export class PlacementOfficerService {
  static async getStudents(filters: z.infer<typeof studentQuerySchema>) {
    const { department, batch, profileStatus, cgpaMin } = filters;

    const whereClause: any = {};

    if (department) {
      whereClause.department = department;
    }
    if (batch) {
      whereClause.batch = batch;
    }
    if (profileStatus) {
      whereClause.profileStatus = profileStatus;
    }
    if (cgpaMin) {
      const minVal = parseFloat(cgpaMin);
      if (!isNaN(minVal)) {
        whereClause.cgpa = { gte: minVal };
      }
    }

    return await prisma.studentProfile.findMany({
      where: whereClause,
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
      },
      orderBy: {
        rollNumber: 'asc',
      },
    });
  }

  static async verifyStudent(studentId: string, data: z.infer<typeof verifyStudentSchema>) {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    const updated = await prisma.studentProfile.update({
      where: { id: studentId },
      data: { profileStatus: data.status as any },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: student.userId,
        title: `Profile Verification: ${data.status}`,
        message: data.status === 'VERIFIED'
          ? 'Your profile verification is successful. You are now eligible to apply for jobs.'
          : 'Your profile verification has been rejected. Please review your credentials.',
        type: data.status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
        link: '/student/profile',
      },
    });

    return updated;
  }

  static async getResumes() {
    return await prisma.resume.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        isApproved: 'asc',
      },
    });
  }

  static async approveResume(resumeId: string, data: z.infer<typeof approveAssetSchema>) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { student: true },
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: { isApproved: data.isApproved },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: resume.student.userId,
        title: `Resume ${data.isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your resume template submission has been ${data.isApproved ? 'approved' : 'rejected'} by the Placement Officer.`,
        type: data.isApproved ? 'SUCCESS' : 'WARNING',
        link: '/student/profile',
      },
    });

    return updated;
  }

  static async getPortfolios() {
    return await prisma.portfolio.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        isApproved: 'asc',
      },
    });
  }

  static async approvePortfolio(portfolioId: string, data: z.infer<typeof approveAssetSchema>) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { student: true },
    });

    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found');
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { isApproved: data.isApproved },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: portfolio.student.userId,
        title: `Portfolio ${data.isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your custom portfolio page has been ${data.isApproved ? 'approved' : 'rejected'} by the Placement Officer.`,
        type: data.isApproved ? 'SUCCESS' : 'WARNING',
        link: '/student/profile',
      },
    });

    return updated;
  }

  static async getApplications() {
    return await prisma.application.findMany({
      include: {
        job: {
          include: {
            company: {
              select: { name: true },
            },
          },
        },
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });
  }

  static async scheduleInterview(data: z.infer<typeof scheduleInterviewSchema>) {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        job: true,
        student: true,
      },
    });

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        driveId: data.driveId,
        date: new Date(data.date),
        type: data.type,
        location: data.location,
        status: 'SCHEDULED',
      },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: 'New Interview Scheduled',
        message: `You have been scheduled for a "${data.type}" interview for "${application.job.title}" on ${new Date(data.date).toLocaleString()}. Link/Location: ${data.location}`,
        type: 'ACTION',
        link: '/student/dashboard',
      },
    });

    return interview;
  }

  static async publishResult(data: z.infer<typeof publishResultSchema>) {
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: {
        job: true,
        student: true,
      },
    });

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    const updatedApp = await prisma.application.update({
      where: { id: data.applicationId },
      data: { status: data.status as any },
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: data.status === 'SELECTED' ? '🎉 Congratulations! Offer Received' : 'Application Status Update',
        message: data.status === 'SELECTED'
          ? `You have been selected for the position of "${application.job.title}" at "${application.job.companyId}"!`
          : `We regret to inform you that your application for "${application.job.title}" was not selected. Keep trying!`,
        type: data.status === 'SELECTED' ? 'SUCCESS' : 'WARNING',
        link: '/student/dashboard',
      },
    });

    return updatedApp;
  }
}
export default PlacementOfficerService;
