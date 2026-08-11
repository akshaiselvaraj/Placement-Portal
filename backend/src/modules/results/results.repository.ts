import prisma from '../../config/database';
import { IResultsRepository } from './results.interfaces';
import { SyncResultsPayload } from './results.types';

export class ResultsRepository implements IResultsRepository {
  async findByStudentId(studentId: string): Promise<any[]> {
    return prisma.academicResult.findMany({
      where: { studentId },
      orderBy: { semester: 'asc' },
      include: {
        subjects: true,
      },
    });
  }

  async findByStudentAndSemester(studentId: string, semester: number): Promise<any | null> {
    return prisma.academicResult.findFirst({
      where: { studentId, semester },
      include: {
        subjects: true,
      },
    });
  }

  async syncResults(studentId: string, data: SyncResultsPayload): Promise<void> {
    // Execute all updates inside a single database transaction
    await prisma.$transaction(async (tx) => {
      for (const sem of data.semesters) {
        // 1. Upsert the semester header record
        const existingResult = await tx.academicResult.findFirst({
          where: { studentId, semester: sem.semester },
        });

        let resultId = '';

        if (existingResult) {
          resultId = existingResult.id;
          await tx.academicResult.update({
            where: { id: resultId },
            data: {
              sgpa: sem.sgpa,
              cgpa: sem.cgpa,
              status: sem.status || 'PUBLISHED',
              lastSynced: new Date(),
            },
          });
        } else {
          const newResult = await tx.academicResult.create({
            data: {
              studentId,
              semester: sem.semester,
              sgpa: sem.sgpa,
              cgpa: sem.cgpa,
              status: sem.status || 'PUBLISHED',
              lastSynced: new Date(),
            },
          });
          resultId = newResult.id;
        }

        // 2. Delete existing subjects to avoid duplicates
        await tx.academicResultSubject.deleteMany({
          where: { resultId },
        });

        // 3. Create fresh subjects list
        await tx.academicResultSubject.createMany({
          data: sem.subjects.map((sub) => ({
            resultId,
            courseCode: sub.courseCode,
            courseName: sub.courseName,
            credits: sub.credits,
            grade: sub.grade,
            gradePoint: sub.gradePoint,
            marks: sub.marks !== undefined ? sub.marks : null,
            resultStatus: sub.resultStatus || 'PASS',
          })),
        });
      }
    });
  }
}

export const resultsRepository = new ResultsRepository();
