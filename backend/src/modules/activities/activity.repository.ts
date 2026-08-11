import prisma from '../../config/database';
import { Prisma, ActivityStatus, ParticipationStatus, ActivityOtpType, Role } from '@prisma/client';

export class ActivityRepository {
  // Activity CRUD
  static async create(data: Prisma.ActivityUncheckedCreateInput) {
    return prisma.activity.create({ data });
  }

  static async findById(id: string) {
    return prisma.activity.findUnique({
      where: { id },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });
  }

  static async findAll(where: Prisma.ActivityWhereInput = {}) {
    return prisma.activity.findMany({
      where,
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  static async update(id: string, data: Prisma.ActivityUpdateInput) {
    return prisma.activity.update({
      where: { id },
      data,
    });
  }

  // Activity OTP Management
  static async upsertOtp(
    activityId: string,
    type: ActivityOtpType,
    otpHash: string,
    expiresAt: Date,
    generatedById: string
  ) {
    // Find if it exists to update, or create a new one
    const existing = await prisma.activityOtp.findFirst({
      where: { activityId, type },
    });

    if (existing) {
      return prisma.activityOtp.update({
        where: { id: existing.id },
        data: { otpHash, expiresAt, generatedById, usedAt: null },
      });
    }

    return prisma.activityOtp.create({
      data: {
        activityId,
        type,
        otpHash,
        expiresAt,
        generatedById,
      },
    });
  }

  static async findOtp(activityId: string, type: ActivityOtpType) {
    return prisma.activityOtp.findFirst({
      where: { activityId, type },
    });
  }

  static async updateOtpUsed(id: string) {
    return prisma.activityOtp.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  // Participants
  static async findParticipant(activityId: string, studentId: string) {
    return prisma.activityParticipant.findUnique({
      where: {
        activityId_studentId: {
          activityId,
          studentId,
        },
      },
    });
  }

  static async findParticipantsByActivity(activityId: string) {
    return prisma.activityParticipant.findMany({
      where: { activityId },
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
      orderBy: { assignedAt: 'desc' },
    });
  }

  static async countParticipants(activityId: string) {
    return prisma.activityParticipant.count({
      where: { activityId },
    });
  }

  static async findStudentProfileByUserId(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
    });
  }

  static async findStudentProfileById(id: string) {
    return prisma.studentProfile.findUnique({
      where: { id },
    });
  }

  static async findStudentActivities(studentId: string) {
    return prisma.activityParticipant.findMany({
      where: { studentId },
      include: {
        activity: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
  }

  // Audit Logs
  static async createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({ data });
  }

  static async findAuditLogsByActivity(activityId: string) {
    return prisma.auditLog.findMany({
      where: { activityId },
      orderBy: { timestamp: 'desc' },
    });
  }

  static async createParticipantRecord(activityId: string, studentId: string) {
    return prisma.activityParticipant.create({
      data: {
        activityId,
        studentId,
        status: ParticipationStatus.ASSIGNED,
      },
    });
  }

  // Transactions Wrapper
  static async runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
