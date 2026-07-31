import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type {
  updateProfileSchema,
  educationSchema,
  projectSchema,
  skillSchema,
  certificationSchema,
} from './student.schema';

export class StudentService {
  // Get student profile by user ID
  static async getProfileByUserId(userId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            isActive: true,
          },
        },
        educations: true,
        projects: true,
        skills: true,
        certifications: true,
        resumes: true,
        portfolios: true,
        applications: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    return student;
  }

  // Update profile
  static async updateProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    const { name, ...profileData } = data;

    return await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      return await tx.studentProfile.update({
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
        },
      });
    });
  }

  // --- Education CRUD ---
  static async addEducation(userId: string, data: z.infer<typeof educationSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    return await prisma.education.create({
      data: {
        studentId: student.id,
        ...data,
      },
    });
  }

  static async updateEducation(userId: string, id: string, data: z.infer<typeof educationSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const edu = await prisma.education.findUnique({ where: { id } });
    if (!edu || edu.studentId !== student.id) throw ApiError.forbidden('Education record not found or access denied');

    return await prisma.education.update({
      where: { id },
      data,
    });
  }

  static async deleteEducation(userId: string, id: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const edu = await prisma.education.findUnique({ where: { id } });
    if (!edu || edu.studentId !== student.id) throw ApiError.forbidden('Education record not found or access denied');

    await prisma.education.delete({ where: { id } });
  }

  // --- Projects CRUD ---
  static async addProject(userId: string, data: z.infer<typeof projectSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    return await prisma.project.create({
      data: {
        studentId: student.id,
        ...data,
      },
    });
  }

  static async updateProject(userId: string, id: string, data: z.infer<typeof projectSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const proj = await prisma.project.findUnique({ where: { id } });
    if (!proj || proj.studentId !== student.id) throw ApiError.forbidden('Project record not found or access denied');

    return await prisma.project.update({
      where: { id },
      data,
    });
  }

  static async deleteProject(userId: string, id: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const proj = await prisma.project.findUnique({ where: { id } });
    if (!proj || proj.studentId !== student.id) throw ApiError.forbidden('Project record not found or access denied');

    await prisma.project.delete({ where: { id } });
  }

  // --- Skills CRUD ---
  static async addSkill(userId: string, data: z.infer<typeof skillSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const existingSkill = await prisma.skill.findFirst({
      where: { studentId: student.id, name: { equals: data.name, mode: 'insensitive' } },
    });

    if (existingSkill) {
      throw ApiError.conflict('Skill already exists');
    }

    return await prisma.skill.create({
      data: {
        studentId: student.id,
        name: data.name,
        level: data.level || null,
      },
    });
  }

  static async deleteSkill(userId: string, id: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill || skill.studentId !== student.id) throw ApiError.forbidden('Skill not found or access denied');

    await prisma.skill.delete({ where: { id } });
  }

  // --- Certifications CRUD ---
  static async addCertification(userId: string, data: z.infer<typeof certificationSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    return await prisma.certification.create({
      data: {
        studentId: student.id,
        name: data.name,
        issuer: data.issuer,
        date: data.date ? new Date(data.date) : null,
        url: data.url || null,
      },
    });
  }

  static async updateCertification(userId: string, id: string, data: z.infer<typeof certificationSchema>) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const cert = await prisma.certification.findUnique({ where: { id } });
    if (!cert || cert.studentId !== student.id) throw ApiError.forbidden('Certification record not found or access denied');

    return await prisma.certification.update({
      where: { id },
      data: {
        name: data.name,
        issuer: data.issuer,
        date: data.date ? new Date(data.date) : null,
        url: data.url || null,
      },
    });
  }

  static async deleteCertification(userId: string, id: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw ApiError.notFound('Student profile not found');

    const cert = await prisma.certification.findUnique({ where: { id } });
    if (!cert || cert.studentId !== student.id) throw ApiError.forbidden('Certification record not found or access denied');

    await prisma.certification.delete({ where: { id } });
  }
}
