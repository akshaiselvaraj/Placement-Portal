import { StudentProfile } from '@prisma/client';
import { IPSRepository, IPSService } from './ps.interfaces';
import { psRepository } from './ps.repository';
import { connectPSSchema } from './ps.validation';
import { PSValidationError, PSNotConnectedError, SyncFailedError } from './ps.errors';
import { ApiError } from '../../utils/api-error';

export class PSService implements IPSService {
  private repository: IPSRepository;

  constructor(repository: IPSRepository = psRepository) {
    this.repository = repository;
  }

  async connectPS(userId: string, cookie: string): Promise<any> {
    if (!cookie) {
      throw ApiError.badRequest('PS session cookie is required');
    }

    // 1. Fetch summary and courses in parallel (or sequential with error handling)
    let summaryData: any;
    let coursesData: any;

    try {
      const [summaryRes, coursesRes] = await Promise.all([
        fetch('https://ps.bitsathy.ac.in/api/ps_v2/dashboard/v2/summary', {
          headers: {
            'Cookie': `PS=${cookie}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
        fetch('https://ps.bitsathy.ac.in/api/ps_v2/courses', {
          headers: {
            'Cookie': `PS=${cookie}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        })
      ]);

      if (!summaryRes.ok) {
        if (summaryRes.status === 401 || summaryRes.status === 403) {
          throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
        }
        throw new SyncFailedError('Failed to fetch summary from PS Portal.');
      }

      if (!coursesRes.ok) {
        if (coursesRes.status === 401 || coursesRes.status === 403) {
          throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
        }
        throw new SyncFailedError('Failed to fetch courses from PS Portal.');
      }

      const summaryContentType = summaryRes.headers.get('content-type') || '';
      const coursesContentType = coursesRes.headers.get('content-type') || '';

      if (!summaryContentType.includes('application/json') || !coursesContentType.includes('application/json')) {
        throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
      }

      summaryData = await summaryRes.json();
      coursesData = await coursesRes.json();
    } catch (err: any) {
      if (err instanceof ApiError || err instanceof SyncFailedError) {
        throw err;
      }
      throw new SyncFailedError(`PS API connection failed: ${err.message || 'Network error'}`);
    }

    // 2. Parse out Activity Points, Opportunity Points, Responsive Score from summary response
    const points = summaryData?.data?.points || [];
    let activityPoints = 0;
    let opportunityPoints = 0;
    let responsiveScore = 0;
    let levelClearance = 'None';

    points.forEach((p: any) => {
      if (p.point_type === 'Activity Points') {
        activityPoints = p.total_points || 0;
      } else if (p.point_type === 'Opportunity Points') {
        opportunityPoints = p.total_points || 0;
      } else if (p.point_type === 'Responsive Score') {
        responsiveScore = p.total_points || 0;
      }
    });

    // Extract PS level clearance safely
    if (summaryData?.data?.profile?.level) {
      levelClearance = String(summaryData.data.profile.level);
    } else if (summaryData?.data?.level) {
      levelClearance = String(summaryData.data.level);
    } else if (summaryData?.data?.levelClearance) {
      levelClearance = String(summaryData.data.levelClearance);
    }

    // Validate using Zod schema
    const validationResult = connectPSSchema.safeParse({
      activityPoints,
      opportunityPoints,
      responsiveScore,
      levelClearance,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      });
      throw new PSValidationError(undefined, fieldErrors);
    }

    // 3. Parse courses data
    if (!Array.isArray(coursesData)) {
      coursesData = [];
    }

    const coursesToSync = coursesData.map((course: any) => {
      const totalLevels = Number(course.levels) || 0;
      const completedLevels = Number(course.cleared) || 0;
      const progressPercentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100 * 100) / 100 : 0;
      const status = (completedLevels === totalLevels && totalLevels > 0) ? 'COMPLETED' : 'IN_PROGRESS';
      const imageUrl = course.img ? `https://ps.bitsathy.ac.in/images/courses/${course.img}` : null;

      return {
        courseId: String(course.id),
        courseName: String(course.name || ''),
        category: String(course.category || ''),
        imageUrl,
        completedLevels,
        totalLevels,
        progressPercentage,
        status,
      };
    });

    // 4. Ensure Student profile exists
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    // 5. Save updated profile points and bulk upsert courses within PostgreSQL transaction
    await this.repository.updatePSData(userId, validationResult.data);
    await this.repository.syncPSCourses(student.id, coursesToSync);

    // 6. Return student profile along with the synced courses
    return this.repository.findByUserId(userId);
  }

  async getPSData(userId: string): Promise<any> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }
    return student;
  }

  async disconnectPS(userId: string): Promise<any> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    // Ensure account is connected before attempting disconnect
    if (!student.psConnected) {
      throw new PSNotConnectedError();
    }

    return this.repository.disconnectPS(userId);
  }
}

export const psService = new PSService();
