import { Activity, ActivityParticipant, StudentProfile, User } from '@prisma/client';

export interface ActivityWithStats extends Activity {
  _count?: {
    participants: number;
  };
}

export interface ActivityParticipantWithStudent extends ActivityParticipant {
  student: StudentProfile & {
    user: {
      name: string;
      email: string;
    };
  };
}
