import prisma from '../../config/database';
import { Role } from '@prisma/client';
import { z } from 'zod';
import type { analyticsQuerySchema } from './analytics.schema';

export class AnalyticsService {
  static async getStudentAnalytics(userId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            applications: true,
            educations: true,
            projects: true,
            skills: true,
          },
        },
        applications: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!student) {
      return {
        totalApplications: 0,
        applicationsByStatus: {},
        interviewsCount: 0,
        profileCompleteness: 0,
      };
    }

    // Calculate status breakdown
    const applicationsByStatus: Record<string, number> = {};
    student.applications.forEach((app) => {
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;
    });

    // Count interviews
    const interviewsCount = await prisma.interview.count({
      where: {
        application: {
          studentId: student.id,
        },
      },
    });

    // Calculate profile completeness percentage
    let completenessScore = 0;
    if (student.cgpa !== null && student.cgpa !== undefined) completenessScore += 15;
    if (student.phone) completenessScore += 10;
    if (student.bio) completenessScore += 10;
    if (student.linkedin) completenessScore += 10;
    if (student.github) completenessScore += 10;
    if (student.website) completenessScore += 5;
    if (student._count.educations > 0) completenessScore += 15;
    if (student._count.projects > 0) completenessScore += 15;
    if (student._count.skills > 0) completenessScore += 10;

    return {
      totalApplications: student._count.applications,
      applicationsByStatus,
      interviewsCount,
      profileCompleteness: completenessScore,
    };
  }

  static async getRecruiterAnalytics(userId: string) {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!recruiter) {
      return {
        totalJobs: 0,
        totalApplicants: 0,
        statusBreakdown: {},
        placedCount: 0,
      };
    }

    const totalJobs = await prisma.job.count({
      where: { companyId: recruiter.companyId },
    });

    const applications = await prisma.application.findMany({
      where: {
        job: {
          companyId: recruiter.companyId,
        },
      },
      select: {
        status: true,
      },
    });

    const statusBreakdown: Record<string, number> = {};
    let placedCount = 0;

    applications.forEach((app) => {
      statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
      if (app.status === 'SELECTED') {
        placedCount++;
      }
    });

    return {
      totalJobs,
      totalApplicants: applications.length,
      statusBreakdown,
      placedCount,
    };
  }

  static async getOfficerAnalytics(filters: z.infer<typeof analyticsQuerySchema>) {
    const { batch, department } = filters;

    // Filter student profile query clause
    const studentWhereClause: any = {};
    if (batch) studentWhereClause.batch = batch;
    if (department) studentWhereClause.department = department;

    // Get totals
    const totalStudents = await prisma.studentProfile.count({
      where: studentWhereClause,
    });

    // Placed students: students matching criteria who have at least one application with status "SELECTED"
    const placedStudents = await prisma.studentProfile.findMany({
      where: {
        ...studentWhereClause,
        applications: {
          some: {
            status: 'SELECTED',
          },
        },
      },
      select: {
        id: true,
      },
    });

    const placedStudentsCount = placedStudents.length;
    const placementRate = totalStudents > 0 ? parseFloat(((placedStudentsCount / totalStudents) * 100).toFixed(1)) : 0;

    const totalRecruiters = await prisma.recruiterProfile.count();
    const totalCompanies = await prisma.company.count();
    const totalJobs = await prisma.job.count();
    const totalDrives = await prisma.placementDrive.count();

    // Department Breakdown
    const studentProfiles = await prisma.studentProfile.findMany({
      where: batch ? { batch } : undefined,
      select: {
        department: true,
        applications: {
          select: {
            status: true,
          },
        },
      },
    });

    const departmentBreakdown: Record<string, { total: number; placed: number; rate: number }> = {};
    studentProfiles.forEach((profile) => {
      const dep = profile.department;
      if (!departmentBreakdown[dep]) {
        departmentBreakdown[dep] = { total: 0, placed: 0, rate: 0 };
      }
      departmentBreakdown[dep].total += 1;
      const isPlaced = profile.applications.some((app) => app.status === 'SELECTED');
      if (isPlaced) {
        departmentBreakdown[dep].placed += 1;
      }
    });

    // Calculate rates for each department
    Object.keys(departmentBreakdown).forEach((dep) => {
      const { total, placed } = departmentBreakdown[dep];
      departmentBreakdown[dep].rate = total > 0 ? parseFloat(((placed / total) * 100).toFixed(1)) : 0;
    });

    // Average salary package offered to selected/placed candidates
    const selectedApplications = await prisma.application.findMany({
      where: {
        status: 'SELECTED',
        student: studentWhereClause,
      },
      include: {
        job: {
          select: {
            salaryMin: true,
            salaryMax: true,
          },
        },
      },
    });

    let totalSalaryVal = 0;
    let salaryCount = 0;
    selectedApplications.forEach((app) => {
      if (app.job.salaryMax) {
        totalSalaryVal += app.job.salaryMax;
        salaryCount++;
      } else if (app.job.salaryMin) {
        totalSalaryVal += app.job.salaryMin;
        salaryCount++;
      }
    });

    const averageSalary = salaryCount > 0 ? Math.round(totalSalaryVal / salaryCount) : 0;

    return {
      totalStudents,
      placedStudentsCount,
      placementRate,
      totalRecruiters,
      totalCompanies,
      totalJobs,
      totalDrives,
      departmentBreakdown,
      averageSalary,
    };
  }

  static async getAdminAnalytics() {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });

    const rolesBreakdown = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const roles: Record<string, number> = {};
    rolesBreakdown.forEach((r) => {
      roles[r.role] = r._count.id;
    });

    const totalCompanies = await prisma.company.count();
    const totalDrives = await prisma.placementDrive.count();
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();

    return {
      totalUsers,
      activeUsers,
      roles,
      totalCompanies,
      totalDrives,
      totalJobs,
      totalApplications,
    };
  }
}
