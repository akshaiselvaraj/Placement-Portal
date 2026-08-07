import { StudentProfile } from '@prisma/client';
import { ConnectPSDto } from './ps.dto';

export interface IPSRepository {
  findByUserId(userId: string): Promise<StudentProfile | null>;
  updatePSData(userId: string, data: ConnectPSDto): Promise<StudentProfile>;
  disconnectPS(userId: string): Promise<StudentProfile>;
}

export interface IPSService {
  connectPS(userId: string, cookie: string): Promise<StudentProfile>;
  getPSData(userId: string): Promise<StudentProfile>;
  disconnectPS(userId: string): Promise<StudentProfile>;
}
