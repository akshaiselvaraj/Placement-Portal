export interface SyncPSPayload {
  activityPoints: number;
  opportunityPoints: number;
  responsiveScore: number;
  levelClearance?: string | null;
}

export interface PSStatusResponse {
  activityPoints: number | null;
  opportunityPoints: number | null;
  responsiveScore: number | null;
  levelClearance: string | null;
  lastSynced: Date | null;
  psConnected: boolean;
}
