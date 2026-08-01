import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type { createJobSchema, updateJobSchema, jobQuerySchema } from './job.schema';
import { AtsService } from '../recruiter/ats.service';

export class JobService {
  /**
   * Create a new job posting (Recruiter only).
   * Verifies the recruiter belongs to the specified company.
   */
  static async createJob(userId: string, data: z.infer<typeof createJobSchema>) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      throw ApiError.notFound('Recruiter profile not found');
    }

    const companyId = data.companyId || recruiter.companyId;

    if (recruiter.companyId !== companyId) {
      throw ApiError.forbidden('You can only post jobs for your own company');
    }

    return await prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        companyId: companyId,
        type: data.type,
        location: data.location,
        workMode: data.workMode || 'On-site',
        employmentType: data.employmentType || 'Full-time',
        salaryMin: data.salaryMin ?? null,
        salaryMax: data.salaryMax ?? null,
        deadline: new Date(data.deadline),
        status: data.status ?? 'OPEN',
        eligibility: data.eligibility ?? null,
        requirements: data.requirements ?? null,
        requiredSkills: data.requiredSkills || [],
        preferredSkills: data.preferredSkills || [],
        minCgpa: data.minCgpa ?? null,
        eligibleDepartments: data.eligibleDepartments || [],
        eligibleGradYears: data.eligibleGradYears || [],
        requiredExperience: data.requiredExperience ?? 0,
        openings: data.openings ?? 1,
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
        ...(data.workMode !== undefined && { workMode: data.workMode }),
        ...(data.employmentType !== undefined && { employmentType: data.employmentType }),
        ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
        ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
        ...(data.deadline !== undefined && { deadline: new Date(data.deadline) }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.eligibility !== undefined && { eligibility: data.eligibility }),
        ...(data.requirements !== undefined && { requirements: data.requirements }),
        ...(data.requiredSkills !== undefined && { requiredSkills: data.requiredSkills }),
        ...(data.preferredSkills !== undefined && { preferredSkills: data.preferredSkills }),
        ...(data.minCgpa !== undefined && { minCgpa: data.minCgpa }),
        ...(data.eligibleDepartments !== undefined && { eligibleDepartments: data.eligibleDepartments }),
        ...(data.eligibleGradYears !== undefined && { eligibleGradYears: data.eligibleGradYears }),
        ...(data.requiredExperience !== undefined && { requiredExperience: data.requiredExperience }),
        ...(data.openings !== undefined && { openings: data.openings }),
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
   * Get all jobs posted by the recruiter's company with applicant status breakdown.
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

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        company: {
          select: { id: true, name: true, logo: true },
        },
        applications: {
          select: { status: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => {
      const { applications, ...rest } = job;
      const totalApplicants = applications.length;
      const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'UNDER_REVIEW').length;
      const interviews = applications.filter((a) => a.status === 'INTERVIEWING').length;
      const selected = applications.filter((a) => a.status === 'SELECTED' || a.status === 'HIRED').length;

      return {
        ...rest,
        stats: {
          totalApplicants,
          shortlisted,
          interviews,
          selected,
        },
      };
    });
  }

  /**
   * Get a single job posting by ID.
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
   * Get eligibility check for student against a job posting.
   */
  static async checkEligibility(userId: string, jobId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        educations: true,
        projects: true,
        certifications: true,
      },
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

    const atsBreakdown = AtsService.calculateMatch(student, job);
    const minCgpa = job.minCgpa ?? 0;
    const isEligible = atsBreakdown.eligibility.departmentEligible &&
                       atsBreakdown.eligibility.gradYearEligible &&
                       (student.cgpa ?? 0) >= minCgpa;
    const isVerified = student.profileStatus === 'VERIFIED';

    return {
      eligible: isEligible && isVerified,
      studentCgpa: student.cgpa,
      requiredCgpa: minCgpa,
      profileVerified: isVerified,
      atsScore: atsBreakdown.score,
      atsBreakdown,
    };
  }

  /**
   * Apply to a job posting and calculate rule-based ATS match score.
   */
  static async applyToJob(userId: string, jobId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        educations: true,
        projects: true,
        certifications: true,
      },
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

    if (new Date(job.deadline) < new Date()) {
      throw ApiError.badRequest('The application deadline has passed');
    }

    // Check existing application
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

    // Calculate Rule-Based ATS score & breakdown
    const atsBreakdown = AtsService.calculateMatch(student, job);

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobId: jobId,
        status: 'APPLIED',
        atsScore: atsBreakdown.score,
        atsBreakdown: atsBreakdown as any,
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'APPLIED',
            changedBy: userId,
            notes: 'Application submitted by candidate',
          },
        },
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: userId,
        title: 'Application Submitted',
        message: `Your application for "${job.title}" has been submitted successfully (ATS Match: ${atsBreakdown.score}%).`,
        type: 'SUCCESS',
        link: '/student/applications',
      },
    });

    // Notify recruiters of company
    const recruiters = await prisma.recruiterProfile.findMany({
      where: { companyId: job.companyId },
      select: { userId: true },
    });

    for (const r of recruiters) {
      await prisma.notification.create({
        data: {
          userId: r.userId,
          title: 'New Application Received',
          message: `A candidate applied for "${job.title}" (ATS Match Score: ${atsBreakdown.score}%).`,
          type: 'INFO',
          link: '/recruiter/applicants',
        },
      });
    }

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
        statusHistory: {
          orderBy: { createdAt: 'asc' },
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

    if (application.status === 'SELECTED' || application.status === 'HIRED' || application.status === 'REJECTED') {
      throw ApiError.badRequest('Cannot withdraw a finalized application');
    }

    return await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'WITHDRAWN',
        statusHistory: {
          create: {
            fromStatus: application.status,
            toStatus: 'WITHDRAWN',
            changedBy: userId,
            notes: 'Application withdrawn by candidate',
          },
        },
      },
    });
  }
}

export default JobService;
