export interface SyncPSDataPayload {
  activityPoints: number;
  opportunityPoints: number;
  responsiveScore: number;
  levelClearance: string | null;
}

export interface PSCourse {
  id: string;
  courseId: string;
  courseName: string;
  category: string;
  imageUrl: string | null;
  completedLevels: number;
  totalLevels: number;
  progressPercentage: number;
  status: string;
  lastSynced: string;
}

export interface PSStatusData {
  activityPoints: number;
  opportunityPoints: number;
  responsiveScore: number;
  levelClearance: string | null;
  lastSynced: string | null;
  psConnected: boolean;
  psPushed: boolean;
  courses: PSCourse[];
}
