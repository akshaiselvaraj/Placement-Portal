import api from '@/lib/axios';

export interface StudentRound {
  id: string;
  interviewRoundId: string;
  roundName: string;
  roundOrder: number;
  description?: string;
  status: 'NOT_STARTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PASSED' | 'FAILED';
  completedAt?: string;
  isUnlocked: boolean;
  accessGrantedAt?: string;
  questionsAddedCount: number;
  questions: InterviewQuestion[];
}

export interface AttendedCompany {
  applicationId: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    industry?: string;
  };
  jobRole: string;
  jobType?: string;
  applicationStatus: string;
  appliedAt: string;
  totalRounds: number;
  completedRoundsCount: number;
  unlockedRoundsCount: number;
  rounds: StudentRound[];
}

export interface InterviewQuestion {
  id: string;
  question: string;
  questionType: 'TECHNICAL' | 'PROGRAMMING' | 'APTITUDE' | 'LOGICAL_REASONING' | 'SCENARIO_BASED' | 'HR' | 'BEHAVIORAL' | 'OTHER';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic?: string;
  answer?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    rollNumber: string;
    department: string;
  };
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  jobRole?: string;
  roundName?: string;
  contributor?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface OfficerStudentRoundItem {
  studentRoundId: string;
  student: {
    id: string;
    name: string;
    email: string;
    rollNumber: string;
    department: string;
  };
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  jobRole: string;
  applicationId: string;
  applicationStatus: string;
  round: {
    id: string;
    name: string;
    order: number;
  };
  roundStatus: string;
  completedAt?: string;
  isUnlocked: boolean;
  grantedBy?: string;
  grantedAt?: string;
  expiresAt?: string;
  questionsCount: number;
}

export const interviewService = {
  // Student - Attended Companies
  getAttendedCompanies: async (): Promise<AttendedCompany[]> => {
    const res = await api.get('/students/attended-companies');
    return res.data.data;
  },

  getAttendedCompanyDetails: async (applicationId: string): Promise<AttendedCompany> => {
    const res = await api.get(`/students/attended-companies/${applicationId}`);
    return res.data.data;
  },

  getStudentRoundQuestions: async (studentRoundId: string) => {
    const res = await api.get(`/students/rounds/${studentRoundId}/questions`);
    return res.data.data;
  },

  addQuestionsToRound: async (studentRoundId: string, questions: Partial<InterviewQuestion>[]) => {
    const res = await api.post(`/students/rounds/${studentRoundId}/questions`, { questions });
    return res.data.data;
  },

  updateQuestion: async (questionId: string, data: Partial<InterviewQuestion>) => {
    const res = await api.patch(`/students/questions/${questionId}`, data);
    return res.data.data;
  },

  deleteQuestion: async (questionId: string) => {
    const res = await api.delete(`/students/questions/${questionId}`);
    return res.data.data;
  },

  submitQuestion: async (questionId: string) => {
    const res = await api.post(`/students/questions/${questionId}/submit`);
    return res.data.data;
  },

  // Student - Exam Preparation
  getExamPreparation: async (params?: {
    search?: string;
    companyId?: string;
    jobRole?: string;
    roundName?: string;
    questionType?: string;
    difficulty?: string;
    topic?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get('/students/exam-preparation', { params });
    return res.data.data;
  },

  // Placement Officer - Interview Round Management
  getPlacementOfficerRounds: async (params?: { search?: string; status?: string }): Promise<OfficerStudentRoundItem[]> => {
    const res = await api.get('/placement/interview-rounds', { params });
    return res.data.data;
  },

  unlockStudentRound: async (studentRoundId: string, expiresAt?: string) => {
    const res = await api.post(`/placement/student-rounds/${studentRoundId}/unlock`, { expiresAt });
    return res.data.data;
  },

  revokeStudentRound: async (studentRoundId: string) => {
    const res = await api.post(`/placement/student-rounds/${studentRoundId}/revoke`);
    return res.data.data;
  },

  updateStudentRoundStatus: async (studentRoundId: string, status: string) => {
    const res = await api.post(`/placement/student-rounds/${studentRoundId}/status`, { status });
    return res.data.data;
  },

  // Placement Officer - Question Review
  getQuestionsForReview: async (params?: { status?: string; companyId?: string; search?: string }): Promise<InterviewQuestion[]> => {
    const res = await api.get('/placement/interview-questions', { params });
    return res.data.data;
  },

  approveQuestion: async (questionId: string) => {
    const res = await api.post(`/placement/interview-questions/${questionId}/approve`);
    return res.data.data;
  },

  rejectQuestion: async (questionId: string, rejectionReason?: string) => {
    const res = await api.post(`/placement/interview-questions/${questionId}/reject`, { rejectionReason });
    return res.data.data;
  },
};
