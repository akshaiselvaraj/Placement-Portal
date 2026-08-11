import '../activities/load-env';

import prisma from '../../config/database';
import { psService } from './ps.service';
import { ApiError } from '../../utils/api-error';

async function runTests() {
  console.log('🧪 Starting PS Level Questions Test Suite...');

  // Retrieve a student profile for testing
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

  // Ensure student has connected PS account for testing
  const initialConnectionState = studentProfile.psConnected;
  await prisma.studentProfile.update({
    where: { id: studentProfile.id },
    data: { psConnected: true },
  });

  try {
    // Test 1: Connect your PS account check when psConnected is false
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: { psConnected: false },
    });
    try {
      await psService.getLevelQuestions(studentUser.id, '3', 'mock-active');
      console.log('❌ [FAIL] Allowed fetching questions with disconnected PS account');
      process.exit(1);
    } catch (err: any) {
      if (err.statusCode === 403 && err.message.includes('Connect your PS account')) {
        console.log('✅ [PASS] Disconnected PS account access rejected with 403');
      } else {
        console.log('❌ [FAIL] Disconnected PS error mismatch:', err.message);
        process.exit(1);
      }
    }

    // Re-enable connection for subsequent tests
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: { psConnected: true },
    });

    // Test 2: Expired Session Cookie
    try {
      await psService.getLevelQuestions(studentUser.id, '3', 'mock-expired');
      console.log('❌ [FAIL] Allowed fetching questions with expired PS session');
      process.exit(1);
    } catch (err: any) {
      if (err.statusCode === 401 && err.message.includes('expired or invalid')) {
        console.log('✅ [PASS] Expired session rejected with 401');
      } else {
        console.log('❌ [FAIL] Expired session error mismatch:', err.message);
        process.exit(1);
      }
    }

    // Test 3: Unregistered Level
    const unregisteredRes = await psService.getLevelQuestions(studentUser.id, '3', 'mock-unregistered');
    if (unregisteredRes && unregisteredRes.available === false && unregisteredRes.reason === 'REGISTRATION_REQUIRED') {
      console.log('✅ [PASS] Unregistered level correctly returned REGISTRATION_REQUIRED status');
    } else {
      console.log('❌ [FAIL] Unregistered level response mismatch:', unregisteredRes);
      process.exit(1);
    }

    // Test 4: PS Server Unavailable
    try {
      await psService.getLevelQuestions(studentUser.id, '3', 'mock-unavailable');
      console.log('❌ [FAIL] PS server down didn\'t throw error');
      process.exit(1);
    } catch (err: any) {
      if (err.statusCode === 500 && err.message.includes('Unable to load practice questions')) {
        console.log('✅ [PASS] PS server failure throws 500');
      } else {
        console.log('❌ [FAIL] Server failure error mismatch:', err.message);
        process.exit(1);
      }
    }

    // Test 5: Empty Question Response
    const emptyRes = await psService.getLevelQuestions(studentUser.id, '3', 'mock-empty');
    if (emptyRes && emptyRes.available === true && Array.isArray(emptyRes.questions) && emptyRes.questions.length === 0) {
      console.log('✅ [PASS] Empty question response handles correctly');
    } else {
      console.log('❌ [FAIL] Empty question response mismatch:', emptyRes);
      process.exit(1);
    }

    // Test 6: Valid Active Session Questions Fetching
    const validRes = await psService.getLevelQuestions(studentUser.id, '3', 'mock-active');
    if (validRes && validRes.available === true && validRes.levelId === '3' && Array.isArray(validRes.questions) && validRes.questions.length > 0) {
      const q = validRes.questions[0];
      if (q.id && q.question && q.type === 'MCQ' && Array.isArray(q.options) && q.correctAnswer && q.explanation) {
        console.log('✅ [PASS] Questions list mapped and normalized correctly');
      } else {
        console.log('❌ [FAIL] Questions structures format invalid:', q);
        process.exit(1);
      }
    } else {
      console.log('❌ [FAIL] Valid active session questions list mismatch:', validRes);
      process.exit(1);
    }

    // Restore initial DB state
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: { psConnected: initialConnectionState },
    });

    console.log('\n📊 PS Questions Tests complete. All passed successfully.\n');
  } catch (err: any) {
    console.error('❌ Unexpected test runner crash:', err.message || err);
    process.exit(1);
  }
}

runTests();
