import prisma from '../../config/database';
import { IResultsRepository, IResultsService } from './results.interfaces';
import { resultsRepository } from './results.repository';
import { SyncResultsPayload } from './results.types';
import { ApiError } from '../../utils/api-error';

export class ResultsService implements IResultsService {
  private repository: IResultsRepository;

  constructor(repository: IResultsRepository = resultsRepository) {
    this.repository = repository;
  }

  async getStudentResults(userId: string): Promise<any[]> {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    return this.repository.findByStudentId(student.id);
  }

  async getSemesterResult(userId: string, semester: number): Promise<any | null> {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    return this.repository.findByStudentAndSemester(student.id, semester);
  }

  async syncResults(userId: string, data: SyncResultsPayload): Promise<any> {
    const startTime = Date.now();

    const student = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    try {
      await this.repository.syncResults(student.id, data);
      
      const duration = Date.now() - startTime;
      const semestersCount = data.semesters.length;
      const subjectsCount = data.semesters.reduce((sum, s) => sum + s.subjects.length, 0);

      // Safe metadata logging - Phase 14 Observability
      console.log(
        `[RESULT_SYNC] student=${student.id} status=success semesters=${semestersCount} subjects=${subjectsCount} duration=${duration}ms`
      );

      // Find the latest semester's result to update the student profile CGPA
      const latestAcademicResult = await prisma.academicResult.findFirst({
        where: { studentId: student.id },
        orderBy: { semester: 'desc' },
      });

      // Update student profile lastSynced timestamp and cgpa
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { 
          lastSynced: new Date(),
          ...(latestAcademicResult ? { cgpa: latestAcademicResult.cgpa } : {}),
        },
      });

      return {
        success: true,
        message: 'Academic results synchronized successfully',
        semestersCount,
        subjectsCount,
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error(
        `[RESULT_SYNC] student=${student.id} status=failure error=${err.message || 'Database error'} duration=${duration}ms`
      );
      throw ApiError.internal(`Synchronization failed: ${err.message || 'Database transaction error'}`);
    }
  }
}

export const resultsService = new ResultsService();
