import { MESSAGE_TYPES } from './constants';

export type MessageType = keyof typeof MESSAGE_TYPES;

export interface ExtensionMessage<T = any> {
  type: MessageType;
  data?: T;
  source?: 'placement-portal' | 'ps-extension';
}

export interface ExtensionResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PSDataPayload {
  activityPoints: number;
  opportunityPoints: number;
  responsiveScore: number;
  levelClearance: string | null;
}

export interface PSStatusDetails {
  psConnected: boolean;
  loggedInToPS: boolean;
  lastSynced?: string | null;
}
