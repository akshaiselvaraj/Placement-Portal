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

  async connectPS(userId: string, cookie: string): Promise<StudentProfile> {
    if (!cookie) {
      throw ApiError.badRequest('PS session cookie is required');
    }

    // 1. Fetch data from BITSathy PS Summary endpoint
    let responseData: any;
    try {
      const psResponse = await fetch('https://ps.bitsathy.ac.in/api/ps_v2/dashboard/v2/summary', {
        headers: {
          'Cookie': `PS=${cookie}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      if (!psResponse.ok) {
        if (psResponse.status === 401 || psResponse.status === 403) {
          throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
        }
        throw new SyncFailedError('Failed to fetch summary from PS Portal.');
      }

      responseData = await psResponse.json();
    } catch (err: any) {
      if (err instanceof ApiError || err instanceof SyncFailedError) {
        throw err;
      }
      throw new SyncFailedError(`PS API connection failed: ${err.message || 'Network error'}`);
    }

    // 2. Parse out Activity Points, Opportunity Points, Responsive Score
    const points = responseData?.data?.points || [];
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

    // Extract PS level clearance
    if (responseData?.data?.level) {
      levelClearance = String(responseData.data.level);
    } else if (responseData?.data?.levelClearance) {
      levelClearance = String(responseData.data.levelClearance);
    } else if (responseData?.data?.profile?.level) {
      levelClearance = String(responseData.data.profile.level);
    }

    // 3. Validate extracted values with Zod connectPSSchema
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

    // 4. Ensure Student profile exists
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    // 5. Update student PS details
    return this.repository.updatePSData(userId, validationResult.data);
  }

  async getPSData(userId: string): Promise<StudentProfile> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }
    return student;
  }

  async disconnectPS(userId: string): Promise<StudentProfile> {
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
