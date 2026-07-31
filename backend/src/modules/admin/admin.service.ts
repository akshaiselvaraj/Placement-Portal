import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type {
  userQuerySchema,
  toggleUserStatusSchema,
  createCompanySchema,
  updateCompanySchema,
} from './admin.schema';

export class AdminService {
  static async getUsers(filters: z.infer<typeof userQuerySchema>) {
    const { role, isActive, search } = filters;

    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }
    if (isActive) {
      whereClause.isActive = isActive === 'true';
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async toggleUserStatus(userId: string, data: z.infer<typeof toggleUserStatusSchema>) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: data.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

  static async getCompanies() {
    return await prisma.company.findMany({
      include: {
        recruiters: {
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async createCompany(data: z.infer<typeof createCompanySchema>) {
    const existing = await prisma.company.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });

    if (existing) {
      throw ApiError.badRequest('Company with this name already exists');
    }

    return await prisma.company.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        website: data.website || null,
        industry: data.industry || null,
        description: data.description || null,
        location: data.location || null,
      },
    });
  }

  static async updateCompany(id: string, data: z.infer<typeof updateCompanySchema>) {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw ApiError.notFound('Company not found');
    }

    return await prisma.company.update({
      where: { id },
      data,
    });
  }
}
export default AdminService;
