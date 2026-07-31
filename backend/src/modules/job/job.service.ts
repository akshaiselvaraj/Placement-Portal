import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type { createJobSchema, updateJobSchema, jobQuerySchema } from './job.schema';

export class JobService {
  /**
   * Create a new job posting (Recruiter only).
   * Verifies the recruiter belongs to the specified company.
   */
  static async createJob(userId: string, data: z.infer<typeof createJobSchema>) {
    // Verify recruiter is part of the company
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    if (recruiter.companyId !== data.companyId) {
      throw ApiError.forbidden('You can only post jobs for your own company');
    }

    return await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        companyId: data.companyId,
        type: data.type,
        location: data.location,
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        deadline: new Date(data.deadline),
        status: data.status ?? 'DRAFT',
        eligibility: data.eligibility ?? null,
        requirements: data.requirements ?? null,
        postedBy: userId,
      },
      include: {
        company: {
          select: { id: true, name: true, logo: true },
        },
        _count: { select: { applications: true } },
      },
    });
  }

  /**
   * Update an existing job posting.
   * Recruiter must own the job (via their company).
   */
  static async updateJob(userId: string, jobId: string, data: z.infer<typeof updateJobSchema>) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Verify ownership
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter || recruiter.companyId !== job.companyId) {
      throw ApiError.forbidden('You can only edit jobs for your own company');
    }

    return await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
        ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
        ...(data.deadline !== undefined && { deadline: new Date(data.deadline) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.eligibility !== undefined && { eligibility: data.eligibility }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
      },
      include: {
        company: {
          select: { id: true, name: true, logo: true },
        },
        _count: { select: { applications: true } },
      },
    });
  }

  /**
   * Delete a job posting. Recruiter must own the job.
   */
  static async deleteJob(userId: string, jobId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter || recruiter.companyId !== job.companyId) {
      throw ApiError.forbidden('You can only delete jobs for your own company');
    }

    await prisma.job.delete({ where: { id: jobId } });
    return { deleted: true };
  }

  /**
   * Get all jobs posted by the recruiter's company.
   */
  static async getRecruiterJobs(userId: string, filters: z.infer<typeof jobQuerySchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const whereClause: any = {
      companyId: recruiter.companyId,
    };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.title = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    return await prisma.job.findMany({
      where: whereClause,
      include: {
        company: {
          select: { id: true, name: true, logo: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single job posting by ID, including applicant counts.
   */
  static async getJobById(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    return job;
  }

  /**
   * Public listing: Get all open jobs visible to students.
   * Supports search and type filtering.
   */
  static async getPublicJobs(filters: z.infer<typeof jobQuerySchema>) {
    const whereClause: any = {
      status: 'OPEN',
    };

    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { company: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    return await prisma.job.findMany({
      where: whereClause,
      include: {
        company: {
          select: { id: true, name: true, logo: true, location: true, industry: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get eligibility check: compare student's CGPA against job eligibility threshold.
   */
  static async checkEligibility(userId: string, jobId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, cgpa: true, profileStatus: true },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Parse CGPA threshold from eligibility text (e.g. "CGPA >= 7.0")
    let minCgpa = 0;
    if (job.eligibility) {
      const match = job.eligibility.match(/(\d+\.?\d*)/);
      if (match) {
        minCgpa = parseFloat(match[1]);
      }
    }

    const isEligible = (student.cgpa ?? 0) >= minCgpa;
    const isVerified = student.profileStatus === 'VERIFIED';

    return {
      eligible: isEligible && isVerified,
      studentCgpa: student.cgpa,
      requiredCgpa: minCgpa,
      profileVerified: isVerified,
    };
  }

  /**
   * Apply to a job posting.
   */
  static async applyToJob(userId: string, jobId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, cgpa: true, profileStatus: true },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    if (student.profileStatus !== 'VERIFIED') {
      throw ApiError.forbidden('Your profile must be verified before applying');
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (job.status !== 'OPEN') {
      throw ApiError.badRequest('This job is no longer accepting applications');
    }

    // Check deadline
    if (new Date(job.deadline) < new Date()) {
      throw ApiError.badRequest('The application deadline has passed');
    }

    // CGPA eligibility check
    if (job.eligibility) {
      const match = job.eligibility.match(/(\d+\.?\d*)/);
      if (match) {
        const minCgpa = parseFloat(match[1]);
        if ((student.cgpa ?? 0) < minCgpa) {
          throw ApiError.forbidden(`Your CGPA (${student.cgpa}) does not meet the minimum requirement (${minCgpa})`);
        }
      }
    }

    // Check for existing application
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: student.id,
          jobId: jobId,
        },
      },
    });

    if (existingApplication) {
      throw ApiError.conflict('You have already applied to this job');
    }

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobId: jobId,
        status: 'APPLIED',
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'Application Submitted',
        message: `Your application for "${job.title}" has been submitted successfully.`,
        type: 'SUCCESS',
        link: '/student/applications',
      },
    });

    return application;
  }

  /**
   * Get a student's applications.
   */
  static async getStudentApplications(userId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    return await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, name: true, logo: true },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  /**
   * Withdraw an application.
   */
  static async withdrawApplication(userId: string, applicationId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.studentId !== student.id) {
      throw ApiError.forbidden('Application not found or access denied');
    }

    if (application.status === 'SELECTED' || application.status === 'REJECTED') {
      throw ApiError.badRequest('Cannot withdraw a finalized application');
    }

    return await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
    });
  }
}

export default JobService;
