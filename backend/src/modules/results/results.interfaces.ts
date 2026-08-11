import { SyncResultsPayload } from './results.types';

export interface IResultsRepository {
  findByStudentId(studentId: string): Promise<any[]>;
  findByStudentAndSemester(studentId: string, semester: number): Promise<any | null>;
  syncResults(studentId: string, data: SyncResultsPayload): Promise<void>;
}

export interface IResultsService {
  getStudentResults(userId: string): Promise<any[]>;
  getSemesterResult(userId: string, semester: number): Promise<any | null>;
  syncResults(userId: string, data: SyncResultsPayload): Promise<any>;
}
