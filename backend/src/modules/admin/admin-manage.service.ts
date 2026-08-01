import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { ApiError } from '../../utils/api-error';

export class AdminManageService {
  // Activity Logging Helper
  static async logActivity(adminId: string, action: string, details?: string, ipAddress?: string, userAgent?: string) {
    return await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        details,
        ipAddress,
        userAgent,
      },
    });
  }

  // Dashboard Stats
  static async getDashboardStats() {
    const total = await prisma.admin.count({
      where: { status: { not: 'DELETED' } },
    });
    const active = await prisma.admin.count({
      where: { status: 'ACTIVE' },
    });
    const superAdmins = await prisma.admin.count({
      where: { role: 'SUPER_ADMIN', status: { not: 'DELETED' } },
    });
    const disabled = await prisma.admin.count({
      where: { status: 'DISABLED' },
    });

    const lastLoginLog = await prisma.adminActivityLog.findFirst({
      where: { action: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // Simulated pending invitations count
    const pendingInvitations = await prisma.admin.count({
      where: { status: 'PENDING' },
    });

    return {
      total,
      active,
      superAdmins,
      disabled,
      lastLogin: lastLoginLog?.createdAt || null,
      pendingInvitations,
    };
  }

  // List Admins
  static async listAdmins(filters: {
    search?: string;
    role?: string;
    status?: string;
    department?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      role,
      status,
      department,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: { not: 'DELETED' },
    };

    if (role) {
      whereClause.role = role;
    }
    if (status) {
      whereClause.status = status;
    }
    if (department) {
      whereClause.department = department;
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [admins, totalCount] = await Promise.all([
      prisma.admin.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
              name: true,
              avatar: true,
              isActive: true,
            },
          },
          permissions: {
            select: {
              permission: true,
            },
          },
        },
        orderBy: sortBy === 'email' || sortBy === 'name' 
          ? { user: { [sortBy === 'email' ? 'email' : 'name']: sortOrder } }
          : { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.admin.count({ where: whereClause }),
    ]);

    // Fetch last login for each admin from activity logs
    const adminsWithLastLogin = await Promise.all(
      admins.map(async (admin) => {
        const lastLogin = await prisma.adminActivityLog.findFirst({
          where: { adminId: admin.id, action: 'LOGIN' },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        });

        return {
          ...admin,
          lastLogin: lastLogin?.createdAt || null,
        };
      })
    );

    return {
      admins: adminsWithLastLogin,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  // Get Admin by ID
  static async getAdminById(id: string) {
    const admin = await prisma.admin.findFirst({
      where: { id, status: { not: 'DELETED' } },
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
        permissions: {
          select: {
            permission: true,
          },
        },
        sessions: {
          orderBy: { lastActive: 'desc' },
          take: 5,
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }

    const lastLogin = await prisma.adminActivityLog.findFirst({
      where: { adminId: admin.id, action: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    return {
      ...admin,
      lastLogin: lastLogin?.createdAt || null,
    };
  }

  // Create Admin
  static async createAdmin(
    data: any,
    performerId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const {
      firstName,
      lastName,
      employeeId,
      email,
      phone,
      department,
      designation,
      role = 'ADMIN',
      status = 'ACTIVE',
      password,
      avatar,
      permissions = [],
      notes,
    } = data;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw ApiError.conflict('Email is already registered');
    }

    // Check if employeeId already registered
    const existingEmployee = await prisma.admin.findUnique({
      where: { employeeId },
    });
    if (existingEmployee) {
      throw ApiError.conflict('Employee ID is already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.$transaction(async (tx) => {
      // 1. Create base User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'ADMIN',
          avatar: avatar || null,
          isActive: status === 'ACTIVE',
        },
      });

      // 2. Create Admin profile
      const admin = await tx.admin.create({
        data: {
          userId: user.id,
          employeeId,
          firstName,
          lastName,
          department,
          designation,
          phone: phone || null,
          role,
          status,
          notes: notes || null,
        },
      });

      // 3. Create Admin permissions
      if (permissions && permissions.length > 0) {
        await tx.adminPermission.createMany({
          data: permissions.map((perm: string) => ({
            adminId: admin.id,
            permission: perm,
          })),
        });
      }

      return admin;
    });

    // Log the creation
    await this.logActivity(
      performerId,
      'CREATE_ADMIN',
      `Created admin account for ${firstName} ${lastName} (${employeeId})`,
      ipAddress,
      userAgent
    );

    return newAdmin;
  }

  // Update Admin
  static async updateAdmin(
    id: string,
    data: any,
    performerId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const admin = await prisma.admin.findFirst({
      where: { id, status: { not: 'DELETED' } },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }

    const {
      firstName,
      lastName,
      phone,
      department,
      designation,
      role,
      status,
      notes,
      avatar,
      permissions,
      password,
    } = data;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update user base details if modified
      const userUpdates: any = {};
      if (firstName || lastName) {
        userUpdates.name = `${firstName || admin.firstName} ${lastName || admin.lastName}`;
      }
      if (avatar !== undefined) {
        userUpdates.avatar = avatar;
      }
      if (status) {
        userUpdates.isActive = status === 'ACTIVE';
      }
      if (password) {
        userUpdates.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id: admin.userId },
          data: userUpdates,
        });
      }

      // 2. Update Admin details
      const adminUpdates: any = {
        firstName,
        lastName,
        phone,
        department,
        designation,
        role,
        status,
        notes,
      };

      const updatedAdmin = await tx.admin.update({
        where: { id },
        data: adminUpdates,
      });

      // 3. Update permissions if supplied
      if (permissions !== undefined) {
        // Delete existing
        await tx.adminPermission.deleteMany({
          where: { adminId: id },
        });

        // Insert new
        if (permissions.length > 0) {
          await tx.adminPermission.createMany({
            data: permissions.map((perm: string) => ({
              adminId: id,
              permission: perm,
            })),
          });
        }
      }

      return updatedAdmin;
    });

    // Log update
    await this.logActivity(
      performerId,
      'PROFILE_UPDATE',
      `Updated details for admin ID: ${id}`,
      ipAddress,
      userAgent
    );

    return updated;
  }

  // Soft Delete Admin
  static async deleteAdmin(id: string, performerId: string, ipAddress?: string, userAgent?: string) {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }

    await prisma.$transaction([
      prisma.admin.update({
        where: { id },
        data: { status: 'DELETED' },
      }),
      prisma.user.update({
        where: { id: admin.userId },
        data: { isActive: false },
      }),
    ]);

    await this.logActivity(
      performerId,
      'DELETION',
      `Soft deleted admin account with ID: ${id}`,
      ipAddress,
      userAgent
    );
  }

  // Restore Soft-Deleted Admin (Undo Option)
  static async restoreAdmin(id: string, performerId: string, ipAddress?: string, userAgent?: string) {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }

    await prisma.$transaction([
      prisma.admin.update({
        where: { id },
        data: { status: 'ACTIVE' },
      }),
      prisma.user.update({
        where: { id: admin.userId },
        data: { isActive: true },
      }),
    ]);

    await this.logActivity(
      performerId,
      'STATUS_CHANGE',
      `Restored/Activated soft-deleted admin account with ID: ${id}`,
      ipAddress,
      userAgent
    );
  }

  // Update Status
  static async updateStatus(
    id: string,
    status: string,
    performerId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedAdmin = await tx.admin.update({
        where: { id },
        data: { status },
      });

      await tx.user.update({
        where: { id: admin.userId },
        data: { isActive: status === 'ACTIVE' },
      });

      return updatedAdmin;
    });

    await this.logActivity(
      performerId,
      'STATUS_CHANGE',
      `Updated admin status to ${status} for ID: ${id}`,
      ipAddress,
      userAgent
    );

    return updated;
  }

  // Update Permissions
  static async updatePermissions(
    id: string,
    permissions: string[],
    performerId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const admin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      throw ApiError.notFound('Admin profile not found');
    }

    await prisma.$transaction([
      prisma.adminPermission.deleteMany({
        where: { adminId: id },
      }),
      prisma.adminPermission.createMany({
        data: permissions.map((perm) => ({
          adminId: id,
          permission: perm,
        })),
      }),
    ]);

    await this.logActivity(
      performerId,
      'PERMISSION_CHANGE',
      `Updated permissions for admin ID: ${id}`,
      ipAddress,
      userAgent
    );
  }

  // Get Activity Logs
  static async getActivityLogs(filters: {
    adminId?: string;
    action?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (filters.adminId) {
      where.adminId = filters.adminId;
    }
    if (filters.action) {
      where.action = filters.action;
    }

    return await prisma.adminActivityLog.findMany({
      where,
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
    });
  }
}
