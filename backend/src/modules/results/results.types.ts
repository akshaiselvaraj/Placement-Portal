export interface SubjectSyncPayload {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoint: number;
  marks?: number | null;
  resultStatus?: string;
}

export interface SemesterSyncPayload {
  semester: number;
  sgpa: number;
  cgpa: number;
  status?: string;
  subjects: SubjectSyncPayload[];
}

export interface SyncResultsPayload {
  semesters: SemesterSyncPayload[];
}
