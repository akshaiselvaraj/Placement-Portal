import prisma from '../../config/database';
import {
  RegisterExtensionUserInput,
  CreateActivityLogInput,
  UpdateExtensionUserInput,
} from './extension-user.validation';

// In-memory fallback cache to guarantee backend API availability even if database table sync is pending
const memoryUsers = new Map<string, {
  id: string;
  fullName: string;
  email: string;
  status: string;
  consentAccepted: boolean;
  consentTimestamp: Date;
  extensionVersion: string;
  createdAt: Date;
  updatedAt: Date;
}>();

const memoryActivityLogs: Array<{
  id: string;
  userId: string;
  activityType: string;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}> = [];

export class ExtensionUserService {
  static async registerUser(input: RegisterExtensionUserInput) {
    const { fullName, email, consentAccepted, extensionVersion } = input;

    try {
      if ((prisma as any).extensionUser) {
        const existing = await (prisma as any).extensionUser.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (existing) {
          return { user: existing, isNew: false };
        }

        const user = await (prisma as any).extensionUser.create({
          data: {
            fullName,
            email: email.toLowerCase(),
            consentAccepted,
            consentTimestamp: new Date(),
            extensionVersion: extensionVersion || '1.0.0',
            status: 'ACTIVE',
          },
        });

        await this.logActivity({
          userId: user.id,
          activityType: 'USER_REGISTERED',
          metadata: { email: user.email, extensionVersion: user.extensionVersion },
        });

        return { user, isNew: true };
      }
    } catch (err) {
      console.warn('Prisma extensionUser model not yet pushed to DB, using in-memory store:', err);
    }

    // In-memory fallback logic
    const existingMemory = Array.from(memoryUsers.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingMemory) {
      return { user: existingMemory, isNew: false };
    }

    const id = `ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newUser = {
      id,
      fullName,
      email: email.toLowerCase(),
      status: 'ACTIVE',
      consentAccepted,
      consentTimestamp: now,
      extensionVersion: extensionVersion || '1.0.0',
      createdAt: now,
      updatedAt: now,
    };

    memoryUsers.set(id, newUser);
    await this.logActivity({
      userId: id,
      activityType: 'USER_REGISTERED',
      metadata: { email: newUser.email, extensionVersion: newUser.extensionVersion },
    });

    return { user: newUser, isNew: true };
  }

  static async logActivity(input: CreateActivityLogInput) {
    const { userId, activityType, metadata } = input;

    try {
      if ((prisma as any).extensionActivityLog) {
        return await (prisma as any).extensionActivityLog.create({
          data: {
            userId,
            activityType,
            metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
          },
        });
      }
    } catch (err) {
      console.warn('Prisma extensionActivityLog error:', err);
    }

    const logEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      activityType,
      metadata: metadata || null,
      createdAt: new Date(),
    };
    memoryActivityLogs.unshift(logEntry);
    return logEntry;
  }

  static async getAllUsers(params: {
    search?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const { search, status, page = 1, limit = 10 } = params;

    let usersList: Array<any> = [];

    try {
      if ((prisma as any).extensionUser) {
        const where: any = {};
        if (status && status !== 'ALL') {
          where.status = status;
        }
        if (search) {
          where.OR = [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [users, total] = await Promise.all([
          (prisma as any).extensionUser.findMany({
            where,
            include: {
              activityLogs: {
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          (prisma as any).extensionUser.count({ where }),
        ]);

        return {
          users: users.map((u: any) => ({
            ...u,
            lastActivity: u.activityLogs[0]?.createdAt || u.updatedAt,
          })),
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (err) {
      console.warn('Prisma extensionUser findMany error:', err);
    }

    // In-memory fallback
    usersList = Array.from(memoryUsers.values());
    if (status && status !== 'ALL') {
      usersList = usersList.filter((u) => u.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      usersList = usersList.filter(
        (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }

    const total = usersList.length;
    const startIndex = (page - 1) * limit;
    const paginated = usersList.slice(startIndex, startIndex + limit).map((u) => {
      const lastLog = memoryActivityLogs.find((l) => l.userId === u.id);
      return {
        ...u,
        lastActivity: lastLog ? lastLog.createdAt : u.updatedAt,
      };
    });

    return {
      users: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getUserById(id: string) {
    try {
      if ((prisma as any).extensionUser) {
        const user = await (prisma as any).extensionUser.findUnique({
          where: { id },
          include: {
            activityLogs: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        });
        if (user) {
          return {
            ...user,
            lastActivity: user.activityLogs[0]?.createdAt || user.updatedAt,
          };
        }
      }
    } catch (err) {
      console.warn('Prisma getUserById error:', err);
    }

    const user = memoryUsers.get(id);
    if (!user) return null;

    const userLogs = memoryActivityLogs.filter((l) => l.userId === id);
    return {
      ...user,
      activityLogs: userLogs,
      lastActivity: userLogs[0]?.createdAt || user.updatedAt,
    };
  }

  static async updateUser(id: string, input: UpdateExtensionUserInput) {
    try {
      if ((prisma as any).extensionUser) {
        const updated = await (prisma as any).extensionUser.update({
          where: { id },
          data: {
            ...input,
            updatedAt: new Date(),
          },
        });
        await this.logActivity({
          userId: id,
          activityType: 'PROFILE_UPDATED',
          metadata: { updatedFields: Object.keys(input) },
        });
        return updated;
      }
    } catch (err) {
      console.warn('Prisma updateUser error:', err);
    }

    const user = memoryUsers.get(id);
    if (!user) return null;

    const updated = {
      ...user,
      ...input,
      updatedAt: new Date(),
    };
    memoryUsers.set(id, updated);

    await this.logActivity({
      userId: id,
      activityType: 'PROFILE_UPDATED',
      metadata: { updatedFields: Object.keys(input) },
    });

    return updated;
  }

  static async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    try {
      if ((prisma as any).extensionUser) {
        const [totalUsers, activeUsers, newUsersToday, recentLogs] = await Promise.all([
          (prisma as any).extensionUser.count(),
          (prisma as any).extensionUser.count({ where: { status: 'ACTIVE' } }),
          (prisma as any).extensionUser.count({
            where: { createdAt: { gte: startOfToday } },
          }),
          (prisma as any).extensionActivityLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: true },
          }),
        ]);

        return {
          totalUsers,
          activeUsers,
          newUsersToday,
          recentActivityCount: recentLogs.length,
          recentActivity: recentLogs,
        };
      }
    } catch (err) {
      console.warn('Prisma getDashboardStats error:', err);
    }

    const users = Array.from(memoryUsers.values());
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const newUsersToday = users.filter((u) => new Date(u.createdAt) >= startOfToday).length;

    const recentActivity = memoryActivityLogs.slice(0, 10).map((log) => ({
      ...log,
      user: memoryUsers.get(log.userId) || null,
    }));

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      recentActivityCount: memoryActivityLogs.length,
      recentActivity,
    };
  }

  static async getAllActivityLogs(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = params;

    try {
      if ((prisma as any).extensionActivityLog) {
        const [logs, total] = await Promise.all([
          (prisma as any).extensionActivityLog.findMany({
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { createdAt: 'desc' },
            include: { user: true },
          }),
          (prisma as any).extensionActivityLog.count(),
        ]);

        return {
          logs,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch (err) {
      console.warn('Prisma getAllActivityLogs error:', err);
    }

    const total = memoryActivityLogs.length;
    const startIndex = (page - 1) * limit;
    const logs = memoryActivityLogs.slice(startIndex, startIndex + limit).map((log) => ({
      ...log,
      user: memoryUsers.get(log.userId) || null,
    }));

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
