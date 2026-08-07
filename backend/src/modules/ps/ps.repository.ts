import prisma from '../../config/database';
import { StudentProfile } from '@prisma/client';
import { IPSRepository } from './ps.interfaces';
import { ConnectPSDto } from './ps.dto';

export class PSRepository implements IPSRepository {
  async findByUserId(userId: string): Promise<StudentProfile | null> {
    return prisma.studentProfile.findUnique({
      where: { userId },
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
}

export const psRepository = new PSRepository();
