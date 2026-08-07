import prisma from '../../config/database';
import { StudentProfile } from '@prisma/client';
import { IPSRepository } from './ps.interfaces';
import { ConnectPSDto } from './ps.dto';

export class PSRepository implements IPSRepository {
  async findByUserId(userId: string): Promise<any> {
    return prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        psCourses: {
          orderBy: {
            progressPercentage: 'desc',
          },
        },
      },
    });
  }

  async updatePSData(userId: string, data: ConnectPSDto): Promise<StudentProfile> {
    return prisma.studentProfile.update({
      where: { userId },
      data: {
        activityPoints: data.activityPoints,
        opportunityPoints: data.opportunityPoints,
        responsiveScore: data.responsiveScore,
        levelClearance: data.levelClearance,
        psConnected: true,
        lastSynced: new Date(),
      },
    });
  }

  async disconnectPS(userId: string): Promise<StudentProfile> {
    return prisma.studentProfile.update({
      where: { userId },
      data: {
        psConnected: false,
      },
    });
  }

  async syncPSCourses(studentId: string, courses: any[]): Promise<void> {
    const courseIdsToKeep = courses.map(c => String(c.courseId));

    await prisma.$transaction(
      async (tx) => {
        // 1. Delete orphaned courses
        await tx.studentPSCourse.deleteMany({
          where: {
            studentId,
            courseId: {
              notIn: courseIdsToKeep,
            },
          },
        });

        // 2. Upsert courses in parallel
        await Promise.all(
          courses.map((course) =>
            tx.studentPSCourse.upsert({
              where: {
                studentId_courseId: {
                  studentId,
                  courseId: String(course.courseId),
                },
              },
              update: {
                courseName: course.courseName,
                category: course.category,
                imageUrl: course.imageUrl,
                completedLevels: course.completedLevels,
                totalLevels: course.totalLevels,
                progressPercentage: course.progressPercentage,
                status: course.status,
                lastSynced: new Date(),
              },
              create: {
                studentId,
                courseId: String(course.courseId),
                courseName: course.courseName,
                category: course.category,
                imageUrl: course.imageUrl,
                completedLevels: course.completedLevels,
                totalLevels: course.totalLevels,
                progressPercentage: course.progressPercentage,
                status: course.status,
              },
            })
          )
        );
      },
      {
        timeout: 30000, // 30 seconds timeout for bulk operations
      }
    );
  }
}

export const psRepository = new PSRepository();
