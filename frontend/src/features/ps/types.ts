export interface SyncPSDataPayload {
  activityPoints: number;
  opportunityPoints: number;
  responsiveScore: number;
  levelClearance: string | null;
}

export interface PSStatusData {
  activityPoints: number;
  opportunityPoints: number;
  responsiveScore: number;
  levelClearance: string | null;
  lastSynced: string | null;
  psConnected: boolean;
}
