import { ActivityRepository } from './activity.repository';
import { ApiError } from '../../utils/api-error';
import { encrypt, decrypt, generateNumericOtp } from '../../utils/crypto';
import { ActivityStatus, ParticipationStatus, ActivityOtpType, Role, Prisma } from '@prisma/client';
import { getIO } from '../../config/socket';
import prisma from '../../config/database';

// In-memory OTP rate limiter
interface RateLimitEntry {
  attempts: number;
  lockoutUntil: Date;
}
const otpRateLimiter = new Map<string, RateLimitEntry>();

export class ActivityService {
  // Helper to check and increment OTP attempts
  private static checkOtpRateLimit(studentId: string, activityId: string, type: ActivityOtpType) {
    const key = `${studentId}:${activityId}:${type}`;
    const limit = otpRateLimiter.get(key);

    if (limit && limit.lockoutUntil > new Date()) {
      const waitTime = Math.ceil((limit.lockoutUntil.getTime() - Date.now()) / 1000 / 60);
      throw ApiError.badRequest(`Too many attempts. Locked out. Please try again in ${waitTime} minutes.`);
    }
  }

  private static recordFailedOtpAttempt(studentId: string, activityId: string, type: ActivityOtpType) {
    const key = `${studentId}:${activityId}:${type}`;
    const limit = otpRateLimiter.get(key) || { attempts: 0, lockoutUntil: new Date() };

    limit.attempts += 1;
    if (limit.attempts >= 5) {
      limit.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
    }
    otpRateLimiter.set(key, limit);
  }

  private static clearOtpAttempts(studentId: string, activityId: string, type: ActivityOtpType) {
    const key = `${studentId}:${activityId}:${type}`;
    otpRateLimiter.delete(key);
  }

  // Socket broadcast helper
  private static emitSocket(event: string, room: string | null, payload: any) {
    try {
      const io = getIO();
      if (room) {
        io.to(room).emit(event, payload);
      } else {
        io.emit(event, payload);
      }
    } catch (err) {
      // Socket.io might not be running in test environments, ignore silently
    }
  }

  // Derived state function
  public static deriveStatus(activity: { startTime: Date; endTime: Date; status: ActivityStatus }): ActivityStatus {
    if (activity.status === ActivityStatus.CANCELLED) {
      return ActivityStatus.CANCELLED;
    }
    const now = new Date();
    if (now > activity.endTime) {
      return ActivityStatus.COMPLETED;
    }
    if (now >= activity.startTime && now <= activity.endTime) {
      return ActivityStatus.LIVE;
    }
    return ActivityStatus.SCHEDULED;
  }

  // CRUD Business Logic
  static async createActivity(data: any, createdById: string) {
    const activity = await ActivityRepository.create({
      title: data.title,
      description: data.description,
      category: data.category,
      startTime: data.startTime,
      endTime: data.endTime,
      points: data.points,
      maxParticipants: data.maxParticipants || null,
      venue: data.venue || null,
      instructions: data.instructions || null,
      gracePeriodMinutes: data.gracePeriodMinutes || 0,
      status: ActivityStatus.SCHEDULED,
      createdById,
    });

    // Auto-generate the three independent OTPs
    await this.generateAllOtps(activity.id, createdById);

    // Audit log
    await ActivityRepository.createAuditLog({
      actorId: createdById,
      actorRole: Role.PLACEMENT_OFFICER, // can be admin as well, router will check
      action: 'ACTIVITY_CREATED',
      activityId: activity.id,
      metadata: { title: activity.title },
    });

    this.emitSocket('activity_created', null, activity);

    return activity;
  }

  static async getActivities(role: Role, userId: string) {
    const now = new Date();

    if (role === Role.STUDENT) {
      const student = await ActivityRepository.findStudentProfileByUserId(userId);
      if (!student) throw ApiError.notFound('Student profile not found');

      // Students should see all non-cancelled activities, but with derived status
      const activities = await ActivityRepository.findAll({
        status: { not: ActivityStatus.CANCELLED },
      });

      const mapped = activities.map((act) => {
        const derived = this.deriveStatus(act);
        return {
          ...act,
          status: derived,
        };
      });

      return mapped;
    }

    // Admins and POs see all activities
    const activities = await ActivityRepository.findAll();
    return activities.map((act) => ({
      ...act,
      status: this.deriveStatus(act),
    }));
  }

  static async getStudentActivities(userId: string) {
    const student = await ActivityRepository.findStudentProfileByUserId(userId);
    if (!student) throw ApiError.notFound('Student profile not found');

    const participations = await ActivityRepository.findStudentActivities(student.id);
    return participations.map((p) => ({
      ...p,
      activity: {
        ...p.activity,
        status: this.deriveStatus(p.activity),
      },
    }));
  }

  static async getActivityDetails(id: string, role: Role, userId: string) {
    const activity = await ActivityRepository.findById(id);
    if (!activity) throw ApiError.notFound('Activity not found');

    const status = this.deriveStatus(activity);
    const result: any = {
      ...activity,
      status,
    };

    // Include decrypted OTPs only for Admins & POs
    if (role === Role.ADMIN || role === Role.PLACEMENT_OFFICER) {
      const otps = await Promise.all([
        ActivityRepository.findOtp(id, ActivityOtpType.ADD_PARTICIPANT),
        ActivityRepository.findOtp(id, ActivityOtpType.START_ACTIVITY),
        ActivityRepository.findOtp(id, ActivityOtpType.END_ACTIVITY),
      ]);

      result.otps = otps.map((otp) => {
        if (!otp) return null;
        return {
          type: otp.type,
          otp: decrypt(otp.otpHash),
          expiresAt: otp.expiresAt,
        };
      }).filter(Boolean);
    }

    return result;
  }

  static async updateActivity(id: string, data: any, userId: string, role: Role) {
    const activity = await ActivityRepository.findById(id);
    if (!activity) throw ApiError.notFound('Activity not found');

    const currentStatus = this.deriveStatus(activity);
    if (currentStatus !== ActivityStatus.SCHEDULED) {
      throw ApiError.badRequest('Activities can only be edited before they start.');
    }

    const updated = await ActivityRepository.update(id, data);

    await ActivityRepository.createAuditLog({
      actorId: userId,
      actorRole: role,
      action: 'ACTIVITY_UPDATED',
      activityId: id,
      metadata: { changes: data },
    });

    this.emitSocket('activity_updated', `activity:${id}`, updated);

    return updated;
  }

  static async cancelActivity(id: string, userId: string, role: Role) {
    const activity = await ActivityRepository.findById(id);
    if (!activity) throw ApiError.notFound('Activity not found');

    const cancelled = await ActivityRepository.update(id, {
      status: ActivityStatus.CANCELLED,
    });

    await ActivityRepository.createAuditLog({
      actorId: userId,
      actorRole: role,
      action: 'ACTIVITY_CANCELLED',
      activityId: id,
    });

    this.emitSocket('activity_cancelled', `activity:${id}`, { id });
    this.emitSocket('activity_update', null, { id, status: ActivityStatus.CANCELLED });

    return cancelled;
  }

  // OTP Generation
  static async generateAllOtps(activityId: string, generatedById: string) {
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default validity
    await Promise.all([
      this.generateOtp(activityId, ActivityOtpType.ADD_PARTICIPANT, generatedById, expiry),
      this.generateOtp(activityId, ActivityOtpType.START_ACTIVITY, generatedById, expiry),
      this.generateOtp(activityId, ActivityOtpType.END_ACTIVITY, generatedById, expiry),
    ]);
  }

  static async generateOtp(
    activityId: string,
    type: ActivityOtpType,
    generatedById: string,
    expiresAt?: Date
  ) {
    const rawOtp = generateNumericOtp(6);
    const otpHash = encrypt(rawOtp);
    const expiry = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);

    const saved = await ActivityRepository.upsertOtp(
      activityId,
      type,
      otpHash,
      expiry,
      generatedById
    );

    // Audit log
    await ActivityRepository.createAuditLog({
      actorId: generatedById,
      actorRole: Role.PLACEMENT_OFFICER,
      action: `OTP_GENERATED_${type}`,
      activityId,
    });

    return { type, otp: rawOtp, expiresAt: expiry };
  }

  // Student Flow: JOIN Activity
  static async joinActivity(activityId: string, userId: string, otp: string) {
    const activity = await ActivityRepository.findById(activityId);
    if (!activity) throw ApiError.notFound('Activity not found');

    const status = this.deriveStatus(activity);
    if (status === ActivityStatus.CANCELLED) {
      throw ApiError.badRequest('This activity has been cancelled.');
    }
    if (status === ActivityStatus.COMPLETED) {
      throw ApiError.badRequest('This activity has already ended.');
    }

    const student = await ActivityRepository.findStudentProfileByUserId(userId);
    if (!student) throw ApiError.notFound('Student profile not found');

    // 1. Rate Limit check
    this.checkOtpRateLimit(student.id, activityId, ActivityOtpType.ADD_PARTICIPANT);

    // 2. Validate student is not already assigned
    const participant = await ActivityRepository.findParticipant(activityId, student.id);
    if (participant) {
      throw ApiError.conflict('You are already registered/assigned to this activity.');
    }

    // 3. Check capacity limit
    if (activity.maxParticipants) {
      const count = await ActivityRepository.countParticipants(activityId);
      if (count >= activity.maxParticipants) {
        throw ApiError.badRequest('Activity registration is full.');
      }
    }

    // 4. Verify OTP
    const storedOtp = await ActivityRepository.findOtp(activityId, ActivityOtpType.ADD_PARTICIPANT);
    if (!storedOtp || storedOtp.expiresAt < new Date()) {
      throw ApiError.badRequest('ADD PARTICIPANT OTP has expired or does not exist.');
    }

    const decryptedOtp = decrypt(storedOtp.otpHash);
    if (decryptedOtp !== otp) {
      this.recordFailedOtpAttempt(student.id, activityId, ActivityOtpType.ADD_PARTICIPANT);
      throw ApiError.badRequest('Invalid OTP.');
    }

    // Success: clear rate limit, create record, write log
    this.clearOtpAttempts(student.id, activityId, ActivityOtpType.ADD_PARTICIPANT);

    const newParticipant = await ActivityRepository.createParticipantRecord(activityId, student.id);

    await ActivityRepository.createAuditLog({
      actorId: userId,
      actorRole: Role.STUDENT,
      action: 'STUDENT_JOINED',
      activityId,
      studentId: student.id,
    });

    // Notify rooms
    this.emitSocket('student_joined', `activity:${activityId}`, { activityId, count: await ActivityRepository.countParticipants(activityId) });

    return newParticipant;
  }

  // Student Flow: START Activity
  static async startActivity(activityId: string, userId: string, otp: string) {
    const activity = await ActivityRepository.findById(activityId);
    if (!activity) throw ApiError.notFound('Activity not found');

    const status = this.deriveStatus(activity);
    if (status === ActivityStatus.CANCELLED) {
      throw ApiError.badRequest('This activity has been cancelled.');
    }
    if (status === ActivityStatus.SCHEDULED) {
      throw ApiError.badRequest('Activity has not started yet.');
    }
    if (status === ActivityStatus.COMPLETED) {
      throw ApiError.badRequest('Activity start window has ended.');
    }

    const student = await ActivityRepository.findStudentProfileByUserId(userId);
    if (!student) throw ApiError.notFound('Student profile not found');

    // 1. Rate limit check
    this.checkOtpRateLimit(student.id, activityId, ActivityOtpType.START_ACTIVITY);

    // 2. Validate participation existence
    const participant = await ActivityRepository.findParticipant(activityId, student.id);
    if (!participant) {
      throw ApiError.forbidden('Student is not assigned to this activity.');
    }

    // 3. State check
    if (participant.status !== ParticipationStatus.ASSIGNED) {
      throw ApiError.badRequest(`Cannot start activity. Current state is ${participant.status}.`);
    }

    // 4. Verify OTP
    const storedOtp = await ActivityRepository.findOtp(activityId, ActivityOtpType.START_ACTIVITY);
    if (!storedOtp || storedOtp.expiresAt < new Date()) {
      throw ApiError.badRequest('START OTP has expired or does not exist.');
    }

    const decryptedOtp = decrypt(storedOtp.otpHash);
    if (decryptedOtp !== otp) {
      this.recordFailedOtpAttempt(student.id, activityId, ActivityOtpType.START_ACTIVITY);
      throw ApiError.badRequest('Invalid OTP.');
    }

    // Success: clear rate limit, update state, write log in transaction
    this.clearOtpAttempts(student.id, activityId, ActivityOtpType.START_ACTIVITY);

    const updated = await ActivityRepository.runTransaction(async (tx) => {
      // Double check state inside transaction for race conditions
      const doubleCheck = await tx.activityParticipant.findUnique({
        where: { id: participant.id },
      });
      if (!doubleCheck || doubleCheck.status !== ParticipationStatus.ASSIGNED) {
        throw ApiError.badRequest('Invalid participation status.');
      }

      const p = await tx.activityParticipant.update({
        where: { id: participant.id },
        data: {
          status: ParticipationStatus.STARTED,
          startedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorRole: Role.STUDENT,
          action: 'STUDENT_STARTED',
          activityId,
          studentId: student.id,
        },
      });

      return p;
    });

    this.emitSocket('student_started', `activity:${activityId}`, { studentId: student.id, status: ParticipationStatus.STARTED });

    return updated;
  }

  // Student Flow: END Activity
  static async endActivity(activityId: string, userId: string, otp: string) {
    const activity = await ActivityRepository.findById(activityId);
    if (!activity) throw ApiError.notFound('Activity not found');

    const now = new Date();
    // Validate timing window including grace period
    const graceExpiry = new Date(activity.endTime.getTime() + activity.gracePeriodMinutes * 60 * 1000);
    if (now > graceExpiry) {
      throw ApiError.badRequest('Activity end window (including grace period) has expired.');
    }

    const student = await ActivityRepository.findStudentProfileByUserId(userId);
    if (!student) throw ApiError.notFound('Student profile not found');

    // 1. Rate limit check
    this.checkOtpRateLimit(student.id, activityId, ActivityOtpType.END_ACTIVITY);

    // 2. Validate participation existence
    const participant = await ActivityRepository.findParticipant(activityId, student.id);
    if (!participant) {
      throw ApiError.forbidden('Student is not assigned to this activity.');
    }

    // 3. State check
    if (participant.status === ParticipationStatus.COMPLETED) {
      throw ApiError.badRequest('Activity participation is already completed.');
    }
    if (participant.status !== ParticipationStatus.STARTED) {
      throw ApiError.badRequest('Start the activity before ending it.');
    }

    // 4. Verify OTP
    const storedOtp = await ActivityRepository.findOtp(activityId, ActivityOtpType.END_ACTIVITY);
    if (!storedOtp || storedOtp.expiresAt < new Date()) {
      throw ApiError.badRequest('END OTP has expired or does not exist.');
    }

    const decryptedOtp = decrypt(storedOtp.otpHash);
    if (decryptedOtp !== otp) {
      this.recordFailedOtpAttempt(student.id, activityId, ActivityOtpType.END_ACTIVITY);
      throw ApiError.badRequest('Invalid OTP.');
    }

    // Success: clear rate limit, transition status and award points atomically
    this.clearOtpAttempts(student.id, activityId, ActivityOtpType.END_ACTIVITY);

    const updated = await ActivityRepository.runTransaction(async (tx) => {
      // Double check state inside transaction
      const doubleCheck = await tx.activityParticipant.findUnique({
        where: { id: participant.id },
      });
      if (!doubleCheck || doubleCheck.status !== ParticipationStatus.STARTED) {
        throw ApiError.badRequest('Invalid participation status.');
      }

      // Update participant record
      const p = await tx.activityParticipant.update({
        where: { id: participant.id },
        data: {
          status: ParticipationStatus.COMPLETED,
          completedAt: new Date(),
          pointsAwarded: activity.points,
        },
      });

      // Update student activity points
      await tx.studentProfile.update({
        where: { id: student.id },
        data: {
          activityPoints: {
            increment: activity.points,
          },
        },
      });

      // Write audit log
      await tx.auditLog.create({
        data: {
          actorId: userId,
          actorRole: Role.STUDENT,
          action: 'STUDENT_COMPLETED',
          activityId,
          studentId: student.id,
          metadata: { pointsAwarded: activity.points },
        },
      });

      return p;
    });

    this.emitSocket('student_completed', `activity:${activityId}`, { studentId: student.id, status: ParticipationStatus.COMPLETED, points: activity.points });

    return updated;
  }

  // Participants & Audit Logs
  static async getParticipants(activityId: string) {
    return ActivityRepository.findParticipantsByActivity(activityId);
  }

  static async getAuditLogs(activityId: string) {
    return ActivityRepository.findAuditLogsByActivity(activityId);
  }

  // Dashboard Analytics
  static async getAnalytics() {
    const activities = await ActivityRepository.findAll();
    const now = new Date();

    let total = activities.length;
    let upcoming = 0;
    let live = 0;
    let completed = 0;
    let cancelled = 0;

    activities.forEach((act) => {
      const status = this.deriveStatus(act);
      if (status === ActivityStatus.CANCELLED) cancelled++;
      else if (status === ActivityStatus.SCHEDULED) upcoming++;
      else if (status === ActivityStatus.LIVE) live++;
      else if (status === ActivityStatus.COMPLETED) completed++;
    });

    // Counts of completions
    const participants = await prisma.activityParticipant.findMany();
    const totalParticipants = participants.length;
    const completedParticipants = participants.filter((p: any) => p.status === ParticipationStatus.COMPLETED).length;

    const completionRate = totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;

    return {
      totalActivities: total,
      upcoming,
      live,
      completed,
      cancelled,
      totalParticipants,
      completionRate: parseFloat(completionRate.toFixed(1)),
    };
  }
}
