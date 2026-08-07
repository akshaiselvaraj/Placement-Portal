import { SyncPSPayload, PSStatusResponse } from './ps.types';

export class ConnectPSDto implements SyncPSPayload {
  activityPoints!: number;
  opportunityPoints!: number;
  responsiveScore!: number;
  levelClearance?: string | null;
}

export class PSResponseDto implements PSStatusResponse {
  activityPoints!: number | null;
  opportunityPoints!: number | null;
  responsiveScore!: number | null;
  levelClearance!: string | null;
  lastSynced!: Date | null;
  psConnected!: boolean;
}
