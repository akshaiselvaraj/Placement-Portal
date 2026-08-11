import '../activities/load-env';

import prisma from '../../config/database';
import { resultsService } from './results.service';
import { syncResultsSchema } from './results.validation';
import { ApiError } from '../../utils/api-error';

async function runTests() {
  console.log('🧪 Starting BIP Results Mirror Test Suite...');

  // 1. Retrieve test student profile
  const studentUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
  });
  if (!studentUser) {
    console.error('❌ Aborting: No student user found in database.');
    process.exit(1);
  }

  const studentProfile = await prisma.studentProfile.findFirst({
    where: { userId: studentUser.id },
  });
  if (!studentProfile) {
    console.error('❌ Aborting: No student profile found in database.');
    process.exit(1);
  }

  // 2. Sample valid sync payload matching semesters 1 & 2
  const samplePayload = {
    semesters: [
      {
        semester: 1,
        sgpa: 7.29,
        cgpa: 7.29,
        status: 'PUBLISHED',
        subjects: [
          { courseCode: 'BS101', courseName: 'Mathematics I', credits: 4, grade: 'A', gradePoint: 8.0, resultStatus: 'PASS' },
          { courseCode: 'HS101', courseName: 'Professional English', credits: 3, grade: 'O', gradePoint: 10.0, resultStatus: 'PASS' },
        ],
      },
      {
        semester: 2,
        sgpa: 7.79,
        cgpa: 7.54,
        status: 'PUBLISHED',
        subjects: [
          { courseCode: 'BS201', courseName: 'Mathematics II', credits: 4, grade: 'A+', gradePoint: 9.0, resultStatus: 'PASS' },
        ],
      },
    ],
  };

  try {
    // Clear out any old results for test runner accuracy
    await prisma.academicResult.deleteMany({
      where: { studentId: studentProfile.id },
    });

    // Test 1: Payload Validation Check
    const parseResult = syncResultsSchema.safeParse(samplePayload);
    if (parseResult.success) {
      console.log('✅ [PASS] Valid payload parsed correctly by Zod');
    } else {
      console.log('❌ [FAIL] Zod rejected valid results payload:', parseResult.error);
      process.exit(1);
    }

    // Test 2: Synchronize Results
    const syncStatus = await resultsService.syncResults(studentUser.id, samplePayload);
    if (syncStatus && syncStatus.success && syncStatus.semestersCount === 2) {
      console.log('✅ [PASS] Semesters sync transaction successfully executed');
    } else {
      console.log('❌ [FAIL] Semester sync failed:', syncStatus);
      process.exit(1);
    }

    // Test 3: Query stored semesters and check subjects
    const storedResults = await resultsService.getStudentResults(studentUser.id);
    if (storedResults.length === 2 && storedResults[0].subjects.length === 2) {
      console.log('✅ [PASS] Stored results count and subrelation mapping matches input');
    } else {
      console.log('❌ [FAIL] Database results count query mismatch:', storedResults);
      process.exit(1);
    }

    // Test 4: Prevent subject and semester duplication on consecutive syncs
    await resultsService.syncResults(studentUser.id, samplePayload);
    const postReSyncResults = await resultsService.getStudentResults(studentUser.id);
    if (postReSyncResults.length === 2 && postReSyncResults[0].subjects.length === 2) {
      console.log('✅ [PASS] Duplication checks pass (upsert works cleanly)');
    } else {
      console.log('❌ [FAIL] Duplication validation failed. Semesters count:', postReSyncResults.length);
      process.exit(1);
    }

    // Test 5: Rejection of invalid payload validation
    const invalidPayload = {
      semesters: [
        {
          semester: -1, // invalid negative number
          sgpa: 11.0,  // invalid out of range
          cgpa: 7.54,
          subjects: [], // empty list
        },
      ],
    };
    const invalidParse = syncResultsSchema.safeParse(invalidPayload);
    if (!invalidParse.success) {
      console.log('✅ [PASS] Out of range negative semester values correctly rejected by Zod');
    } else {
      console.log('❌ [FAIL] Allowed parsing of invalid Zod schema parameters');
      process.exit(1);
    }

    // Test 6: Semester detail lookup
    const sem1Result = await resultsService.getSemesterResult(studentUser.id, 1);
    if (sem1Result && sem1Result.semester === 1 && sem1Result.sgpa === 7.29) {
      console.log('✅ [PASS] Lookup of specific semester detail resolves successfully');
    } else {
      console.log('❌ [FAIL] Specific semester lookup failed:', sem1Result);
      process.exit(1);
    }

    console.log('\n📊 BIP Results Tests complete. All passed successfully.\n');
  } catch (err: any) {
    console.error('❌ Unexpected Results test runner crash:', err.message || err);
    process.exit(1);
  }
}

runTests();
