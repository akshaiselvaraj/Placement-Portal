import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';
import { z } from 'zod';
import type { createResumeSchema, updateResumeSchema } from './resume.schema';

export class ResumeService {
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

  static async getResumes(userId: string) {
    const studentId = await this.getStudentProfileId(userId);

    return await prisma.resume.findMany({
      where: { studentId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getResumeById(userId: string, userRole: string, id: string) {
    const resume = await prisma.resume.findUnique({
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

    if (!resume) {
      throw ApiError.notFound('Resume not found');
    }

    if (userRole === 'RECRUITER') {
      if (!resume.isApproved) {
        throw ApiError.forbidden('Access denied');
      }
    } else if (userRole === 'STUDENT') {
      const studentId = await this.getStudentProfileId(userId);
      if (resume.studentId !== studentId) {
        throw ApiError.forbidden('Access denied');
      }
    }

    return resume;
  }

  static async createResume(userId: string, data: z.infer<typeof createResumeSchema>) {
    const studentId = await this.getStudentProfileId(userId);

    return await prisma.resume.create({
      data: {
        studentId,
        templateId: data.templateId,
        title: data.title,
        data: data.data as any,
        isApproved: false, // Must be approved by Placement Officer
      },
    });
  }

  static async updateResume(userId: string, id: string, data: z.infer<typeof updateResumeSchema>) {
    const studentId = await this.getStudentProfileId(userId);

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.studentId !== studentId) {
      throw ApiError.notFound('Resume not found or access denied');
    }

    const { data: resumeData, ...rest } = data;

    return await prisma.resume.update({
      where: { id },
      data: {
        ...rest,
        ...(resumeData !== undefined ? { data: resumeData as any } : {}),
        isApproved: false, // Reset approval status on modification
      },
    });
  }

  static async deleteResume(userId: string, id: string) {
    const studentId = await this.getStudentProfileId(userId);

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume || resume.studentId !== studentId) {
      throw ApiError.notFound('Resume not found or access denied');
    }

    return await prisma.resume.delete({
      where: { id },
    });
  }
}
export default ResumeService;
