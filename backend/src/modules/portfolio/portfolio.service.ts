import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type { createPortfolioSchema, updatePortfolioSchema } from './portfolio.schema';

export class PortfolioService {
  private static async getStudentProfileId(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Student profile not found. Please complete profile registration first.');
    }

    return profile.id;
  }

  static async getPortfolios(userId: string) {
    const studentId = await this.getStudentProfileId(userId);

    return await prisma.portfolio.findMany({
      where: { studentId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getPortfolioById(userId: string, userRole: string, id: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found');
    }

    if (userRole === 'RECRUITER') {
      if (!portfolio.isApproved || !portfolio.isPublished) {
        throw ApiError.forbidden('Access denied');
      }
    } else if (userRole === 'STUDENT') {
      const studentId = await this.getStudentProfileId(userId);
      if (portfolio.studentId !== studentId) {
        throw ApiError.forbidden('Access denied');
      }
    }

    return portfolio;
  }

  static async getPortfolioBySlug(slug: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
            educations: true,
            projects: true,
            skills: true,
            certifications: true,
          },
        },
      },
    });

    if (!portfolio) {
      throw ApiError.notFound('Portfolio page not found');
    }

    // Public links must be published
    if (!portfolio.isPublished) {
      throw ApiError.forbidden('This portfolio is not currently public');
    }

    return portfolio;
  }

  static async createPortfolio(userId: string, data: z.infer<typeof createPortfolioSchema>) {
    const studentId = await this.getStudentProfileId(userId);

    const existing = await prisma.portfolio.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw ApiError.badRequest('Portfolio URL Slug is already in use');
    }

    return await prisma.portfolio.create({
      data: {
        studentId,
        themeId: data.themeId,
        title: data.title,
        slug: data.slug,
        data: data.data as any,
        isPublished: data.isPublished || false,
        isApproved: false, // Officers must verify content
      },
    });
  }

  static async updatePortfolio(userId: string, id: string, data: z.infer<typeof updatePortfolioSchema>) {
    const studentId = await this.getStudentProfileId(userId);

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio || portfolio.studentId !== studentId) {
      throw ApiError.notFound('Portfolio not found or access denied');
    }

    if (data.slug && data.slug !== portfolio.slug) {
      const existing = await prisma.portfolio.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        throw ApiError.badRequest('Portfolio URL Slug is already in use');
      }
    }

    const { data: portfolioData, ...rest } = data;

    return await prisma.portfolio.update({
      where: { id },
      data: {
        ...rest,
        ...(portfolioData !== undefined ? { data: portfolioData as any } : {}),
        isApproved: false, // Reset approval status on modification
      },
    });
  }

  static async deletePortfolio(userId: string, id: string) {
    const studentId = await this.getStudentProfileId(userId);

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
    });

    if (!portfolio || portfolio.studentId !== studentId) {
      throw ApiError.notFound('Portfolio not found or access denied');
    }

    return await prisma.portfolio.delete({
      where: { id },
    });
  }
}
export default PortfolioService;
