import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../utils/api-error';
import { ROLES } from '../../config/constants';
import type { registerSchema, loginSchema, changePasswordSchema } from './auth.schema';
import { z } from 'zod';

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    return await prisma.$transaction(async (tx) => {
      // Create base User
      const user = await tx.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role,
        },
      });

      // Create role-specific profiles
      if (input.role === ROLES.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            rollNumber: input.rollNumber!,
            department: input.department!,
            batch: input.batch!,
          },
        });
      } else if (input.role === ROLES.RECRUITER) {
        let companyId = input.companyId;

        // If no companyId but companyName is provided, create/find company
        if (!companyId && input.companyName) {
          const company = await tx.company.upsert({
            where: { name: input.companyName },
            update: {},
            create: { name: input.companyName },
          });
          companyId = company.id;
        }

        if (!companyId) {
          throw ApiError.badRequest('Company ID or Company Name is required for Recruiter');
        }

        await tx.recruiterProfile.create({
          data: {
            userId: user.id,
            companyId: companyId,
            designation: input.designation,
            phone: input.phone,
          },
        });
      } else if (input.role === ROLES.PLACEMENT_OFFICER) {
        await tx.placementOfficerProfile.create({
          data: {
            userId: user.id,
            department: input.department!,
            designation: input.designation,
          },
        });
      }

      // Generate JWT Token
      const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      } as SignOptions);

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    });
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        studentProfile: {
          include: {
            educations: true,
            projects: true,
            skills: true,
            certifications: true,
          },
        },
        recruiterProfile: {
          include: {
            company: true,
          },
        },
        placementOfficerProfile: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await bcrypt.compare(input.oldPassword, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
