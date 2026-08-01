import { Router } from 'express';
import { AdminManageController } from './admin-manage.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { checkAdminPermission } from './admin-manage.middleware';
import { z } from 'zod';

const router = Router();

// Zod schemas for input validation
const createAdminSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
  status: z.enum(['ACTIVE', 'DISABLED', 'SUSPENDED']).default('ACTIVE'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  avatar: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

const updateAdminSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  department: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED', 'SUSPENDED']).optional(),
  password: z.string().min(6).optional(),
  avatar: z.string().optional().nullable(),
  permissions: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

const updateStatusSchema = z.object({
  id: z.string().min(1, 'Admin ID is required'),
  status: z.enum(['ACTIVE', 'DISABLED', 'SUSPENDED']),
});

const updatePermissionsSchema = z.object({
  id: z.string().min(1, 'Admin ID is required'),
  permissions: z.array(z.string()),
});

// Protect all routes with authentication and baseline ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Stats endpoint (place before dynamic parameter route)
router.get('/stats', AdminManageController.getStats);

// REST CRUD APIs
router.get('/', AdminManageController.listAdmins);
router.get('/activity', AdminManageController.getActivities);
router.get('/:id', AdminManageController.getAdmin);

// Write actions require "Manage Admins" permission
router.post('/', checkAdminPermission('Manage Admins'), validate(createAdminSchema), AdminManageController.createAdmin);
router.put('/:id', checkAdminPermission('Manage Admins'), validate(updateAdminSchema), AdminManageController.updateAdmin);
router.delete('/:id', checkAdminPermission('Manage Admins'), AdminManageController.deleteAdmin);
router.post('/:id/restore', checkAdminPermission('Manage Admins'), AdminManageController.restoreAdmin);

router.patch('/status', checkAdminPermission('Manage Admins'), validate(updateStatusSchema), AdminManageController.updateStatus);
router.patch('/permissions', checkAdminPermission('Manage Admins'), validate(updatePermissionsSchema), AdminManageController.updatePermissions);

export default router;
