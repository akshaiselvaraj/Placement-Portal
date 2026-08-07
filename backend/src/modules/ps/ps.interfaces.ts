import { StudentProfile } from '@prisma/client';
import { ConnectPSDto } from './ps.dto';

export interface IPSRepository {
  findByUserId(userId: string): Promise<any>;
  updatePSData(userId: string, data: ConnectPSDto): Promise<StudentProfile>;
  disconnectPS(userId: string): Promise<StudentProfile>;
  syncPSCourses(studentId: string, courses: any[]): Promise<void>;
  sharePSData(userId: string, shared: boolean): Promise<StudentProfile>;
}

export interface IPSService {
  connectPS(userId: string, cookie: string): Promise<any>;
  getPSData(userId: string): Promise<any>;
  pushToPO(userId: string): Promise<any>;
  disconnectPS(userId: string): Promise<any>;
}
