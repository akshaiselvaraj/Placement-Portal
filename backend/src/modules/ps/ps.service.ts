import { StudentProfile } from '@prisma/client';
import { IPSRepository, IPSService } from './ps.interfaces';
import { psRepository } from './ps.repository';
import { connectPSSchema } from './ps.validation';
import { PSValidationError, PSNotConnectedError, SyncFailedError } from './ps.errors';
import { ApiError } from '../../utils/api-error';

export class PSService implements IPSService {
  private repository: IPSRepository;

  constructor(repository: IPSRepository = psRepository) {
    this.repository = repository;
  }

  async connectPS(userId: string, cookie: string): Promise<any> {
    if (!cookie) {
      throw ApiError.badRequest('PS session cookie is required');
    }

    // 1. Fetch summary and courses in parallel (or sequential with error handling)
    let summaryData: any;
    let coursesData: any;

    try {
      const [summaryRes, coursesRes] = await Promise.all([
        fetch('https://ps.bitsathy.ac.in/api/ps_v2/dashboard/v2/summary', {
          headers: {
            'Cookie': `PS=${cookie}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
        fetch('https://ps.bitsathy.ac.in/api/ps_v2/courses', {
          headers: {
            'Cookie': `PS=${cookie}`,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        })
      ]);

      if (!summaryRes.ok) {
        if (summaryRes.status === 401 || summaryRes.status === 403) {
          throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
        }
        throw new SyncFailedError('Failed to fetch summary from PS Portal.');
      }

      if (!coursesRes.ok) {
        if (coursesRes.status === 401 || coursesRes.status === 403) {
          throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
        }
        throw new SyncFailedError('Failed to fetch courses from PS Portal.');
      }

      const summaryContentType = summaryRes.headers.get('content-type') || '';
      const coursesContentType = coursesRes.headers.get('content-type') || '';

      if (!summaryContentType.includes('application/json') || !coursesContentType.includes('application/json')) {
        throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
      }

      summaryData = await summaryRes.json();
      coursesData = await coursesRes.json();
    } catch (err: any) {
      if (err instanceof ApiError || err instanceof SyncFailedError) {
        throw err;
      }
      throw new SyncFailedError(`PS API connection failed: ${err.message || 'Network error'}`);
    }

    // 2. Parse out Activity Points, Opportunity Points, Responsive Score from summary response
    const points = summaryData?.data?.points || [];
    let activityPoints = 0;
    let opportunityPoints = 0;
    let responsiveScore = 0;
    let levelClearance = 'None';

    points.forEach((p: any) => {
      if (p.point_type === 'Activity Points') {
        activityPoints = p.total_points || 0;
      } else if (p.point_type === 'Opportunity Points') {
        opportunityPoints = p.total_points || 0;
      } else if (p.point_type === 'Responsive Score') {
        responsiveScore = p.total_points || 0;
      }
    });

    // 3. Parse courses data
    if (!Array.isArray(coursesData)) {
      coursesData = [];
    }

    const coursesToSync = coursesData.map((course: any) => {
      const totalLevels = Number(course.levels) || 0;
      const completedLevels = Number(course.cleared) || 0;
      const progressPercentage = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100 * 100) / 100 : 0;
      const status = (completedLevels === totalLevels && totalLevels > 0) ? 'COMPLETED' : 'IN_PROGRESS';
      const imageUrl = course.img ? `https://ps.bitsathy.ac.in/images/courses/${course.img}` : null;

      return {
        courseId: String(course.id),
        courseName: String(course.name || ''),
        category: String(course.category || ''),
        imageUrl,
        completedLevels,
        totalLevels,
        progressPercentage,
        status,
      };
    });

    // Extract PS level clearance safely
    if (summaryData?.data?.profile?.level) {
      levelClearance = String(summaryData.data.profile.level);
    } else if (summaryData?.data?.level) {
      levelClearance = String(summaryData.data.level);
    } else if (summaryData?.data?.levelClearance) {
      levelClearance = String(summaryData.data.levelClearance);
    }

    // Fallback to total levels completed if levelClearance is 'None'
    const totalLevelsCompleted = coursesToSync.reduce((sum: number, c: any) => sum + c.completedLevels, 0);
    if (levelClearance === 'None' || levelClearance === '' || levelClearance === '0') {
      levelClearance = String(totalLevelsCompleted);
    }

    // Validate using Zod schema
    const validationResult = connectPSSchema.safeParse({
      activityPoints,
      opportunityPoints,
      responsiveScore,
      levelClearance,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      });
      throw new PSValidationError(undefined, fieldErrors);
    }

    // 4. Ensure Student profile exists
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    // 5. Save updated profile points and bulk upsert courses within PostgreSQL transaction
    await this.repository.updatePSData(userId, validationResult.data);
    await this.repository.syncPSCourses(student.id, coursesToSync);

    // 6. Return student profile along with the synced courses
    return this.repository.findByUserId(userId);
  }

  async getPSData(userId: string): Promise<any> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }
    if (student.psConnected && (!student.levelClearance || student.levelClearance === 'None' || student.levelClearance === '' || student.levelClearance === '0')) {
      const courses = student.psCourses || [];
      const totalLevelsCompleted = courses.reduce((sum: number, c: any) => sum + c.completedLevels, 0);
      student.levelClearance = String(totalLevelsCompleted);
    }
    return student;
  }

  async pushToPO(userId: string): Promise<any> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }
    if (!student.psConnected) {
      throw ApiError.badRequest('Please connect your Personalized Skill (PS) account before sharing with Placement Officer');
    }
    await this.repository.sharePSData(userId, true);
    return this.repository.findByUserId(userId);
  }

  async disconnectPS(userId: string): Promise<any> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }

    // Ensure account is connected before attempting disconnect
    if (!student.psConnected) {
      throw new PSNotConnectedError();
    }

    return this.repository.disconnectPS(userId);
  }

  async getLevelQuestions(userId: string, levelId: string, cookie: string): Promise<any> {
    const student = await this.repository.findByUserId(userId);
    if (!student) {
      throw ApiError.notFound('Student profile not found');
    }
    if (!student.psConnected) {
      throw ApiError.forbidden('Connect your PS account to access practice questions.');
    }

    if (!cookie) {
      throw ApiError.badRequest('PS session cookie is required');
    }

    // Mock session handler for testing scenarios
    if (cookie.startsWith('mock-')) {
      if (cookie === 'mock-expired') {
        throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
      }
      if (cookie === 'mock-unregistered') {
        return { available: false, reason: 'REGISTRATION_REQUIRED' };
      }
      if (cookie === 'mock-empty') {
        return { available: true, levelId, levelName: `Level ${levelId}`, questions: [] };
      }
      if (cookie === 'mock-unavailable') {
        throw ApiError.internal('Unable to load practice questions right now. Please try again later.');
      }
      // mock-active / default mock fallback
      const qList = mockQuestionsDb[levelId] || [];
      return {
        available: true,
        levelId,
        levelName: `Level ${levelId}`,
        questions: qList,
      };
    }

    // Real PS Portal HTTP Request
    try {
      const res = await fetch(`https://ps.bitsathy.ac.in/api/ps_v2/levels/${levelId}/questions`, {
        headers: {
          'Cookie': `PS=${cookie}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw ApiError.unauthorized('PS session expired or invalid. Please re-login to PS portal.');
        }
        if (res.status === 403) {
          return { available: false, reason: 'REGISTRATION_REQUIRED' };
        }
        throw new Error(`Server returned status code ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        // Non-JSON typically means redirection/access error on auth walls
        return { available: false, reason: 'REGISTRATION_REQUIRED' };
      }

      const rawData = (await res.json()) as any;
      
      // If the response body has an explicit error or unregistered flags
      if (rawData.success === false || rawData.unregistered || rawData.message?.toLowerCase().includes('register')) {
        return { available: false, reason: 'REGISTRATION_REQUIRED' };
      }

      // Normalize questions from the response
      const rawQuestions = Array.isArray(rawData.questions) ? rawData.questions : (Array.isArray(rawData.data) ? rawData.data : []);
      const questions = rawQuestions.map((q: any, index: number) => {
        // Map actual API response properties safely to the expected normalized structure
        const optionsList = Array.isArray(q.options)
          ? q.options.map((opt: any, idx: number) => ({
              key: String(opt.key || String.fromCharCode(65 + idx)),
              text: String(opt.text || opt),
            }))
          : [
              { key: 'A', text: q.optionA || q.option_a || '' },
              { key: 'B', text: q.optionB || q.option_b || '' },
              { key: 'C', text: q.optionC || q.option_c || '' },
              { key: 'D', text: q.optionD || q.option_d || '' },
            ].filter((o) => o.text !== '');

        return {
          id: String(q.id || q.questionId || `q_${index}`),
          question: String(q.question || q.text || ''),
          type: String(q.type || 'MCQ'),
          options: optionsList,
          correctAnswer: String(q.correctAnswer || q.answer || q.correct_answer || 'A'),
          explanation: q.explanation || null,
        };
      });

      return {
        available: true,
        levelId,
        levelName: `Level ${levelId}`,
        questions,
      };
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      // Fallback/log
      console.warn(`PS questions fetch failed, falling back to static questions: ${err.message}`);
      throw ApiError.internal('Unable to load practice questions right now. Please try again later.');
    }
  }
}

// In-memory mock questions database for verification and development fallbacks
const mockQuestionsDb: Record<string, any[]> = {
  '1': [
    {
      id: 'q1_1',
      question: 'Which of the following is a valid variable name in C?',
      type: 'MCQ',
      options: [
        { key: 'A', text: '123total' },
        { key: 'B', text: 'total_sum' },
        { key: 'C', text: 'double' },
        { key: 'D', text: 'total-sum' },
      ],
      correctAnswer: 'B',
      explanation: 'Variable names in C cannot start with numbers, cannot contain dashes, and cannot be keywords (double).'
    },
    {
      id: 'q1_2',
      question: 'What is the output of the expression 5 / 2 in C when variables are integers?',
      type: 'MCQ',
      options: [
        { key: 'A', text: '2.5' },
        { key: 'B', text: '2' },
        { key: 'C', text: '3' },
        { key: 'D', text: '0' },
      ],
      correctAnswer: 'B',
      explanation: 'Integer division in C truncates the decimal part, so 5 / 2 equals 2.'
    }
  ],
  '2': [
    {
      id: 'q2_1',
      question: 'What does the strcmp(s1, s2) function return if string s1 is lexicographically smaller than s2?',
      type: 'MCQ',
      options: [
        { key: 'A', text: 'A positive value' },
        { key: 'B', text: 'A negative value' },
        { key: 'C', text: '0' },
        { key: 'D', text: '1' },
      ],
      correctAnswer: 'B',
      explanation: 'strcmp returns a negative value if s1 < s2, a positive value if s1 > s2, and 0 if they are identical.'
    }
  ],
  '3': [
    {
      id: 'q3_1',
      question: 'What is the time complexity of searching in a Balanced Binary Search Tree?',
      type: 'MCQ',
      options: [
        { key: 'A', text: 'O(1)' },
        { key: 'B', text: 'O(log n)' },
        { key: 'C', text: 'O(n)' },
        { key: 'D', text: 'O(n log n)' },
      ],
      correctAnswer: 'B',
      explanation: 'A balanced BST has a height of log n. Searching takes time proportional to the height, which is O(log n).'
    },
    {
      id: 'q3_2',
      question: 'Which data structure is typically used to implement recursion in computer programs?',
      type: 'MCQ',
      options: [
        { key: 'A', text: 'Queue' },
        { key: 'B', text: 'Stack' },
        { key: 'C', text: 'Linked List' },
        { key: 'D', text: 'Tree' },
      ],
      correctAnswer: 'B',
      explanation: 'The Stack data structure operates on a Last-In, First-Out (LIFO) model which mirrors functional push/pop activation records in recursion.'
    }
  ],
  '4': [
    {
      id: 'q4_1',
      question: 'Which of the following algorithms is used to find the shortest path in a weighted graph with negative edge weights but no negative cycles?',
      type: 'MCQ',
      options: [
        { key: 'A', text: 'Dijkstra\'s Algorithm' },
        { key: 'B', text: 'Bellman-Ford Algorithm' },
        { key: 'C', text: 'Prim\'s Algorithm' },
        { key: 'D', text: 'Kruskal\'s Algorithm' },
      ],
      correctAnswer: 'B',
      explanation: 'Dijkstra\'s algorithm fails with negative edge weights. Bellman-Ford correctly resolves it and detects negative cycles.'
    }
  ],
  '5': [
    {
      id: 'q5_1',
      question: 'In a microservices architecture, which pattern is used to aggregate data from multiple services to resolve complex read queries?',
      type: 'MCQ',
      options: [
        { key: 'A', text: 'Saga Pattern' },
        { key: 'B', text: 'CQRS / API Composition' },
        { key: 'C', text: 'Circuit Breaker' },
        { key: 'D', text: 'Event Sourcing' },
      ],
      correctAnswer: 'B',
      explanation: 'CQRS (Command Query Responsibility Segregation) or API Composition gathers data across independent databases of various services to serve read queries.'
    }
  ]
};

export const psService = new PSService();
