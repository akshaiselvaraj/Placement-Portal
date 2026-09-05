import './load-env';

import prisma from '../../config/database';
import { ActivityService } from './activity.service';
import { ActivityRepository } from './activity.repository';
import { ActivityStatus, ParticipationStatus, ActivityOtpType, Role } from '@prisma/client';
import { decrypt } from '../../utils/crypto';

// Setup mock data for test run
async function runTests() {
  console.log('🧪 Starting Activity System Test Suite...');
  
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Get or create test users/students
  let studentUser = await prisma.user.findFirst({ where: { role: Role.STUDENT } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: 'teststudent@bit.edu.in',
        password: 'hashedpassword',
        role: Role.STUDENT,
        name: 'Test Student',
        studentProfile: {
          create: {
            rollNumber: '2024UCB9999',
            department: 'Computer Science',
            batch: '2024',
          },
        },
      },
      include: { studentProfile: true },
    });
  }

  let poUser = await prisma.user.findFirst({ where: { role: Role.PLACEMENT_OFFICER } });
  if (!poUser) {
    poUser = await prisma.user.create({
      data: {
        email: 'testpo@bit.edu.in',
        password: 'hashedpassword',
        role: Role.PLACEMENT_OFFICER,
        name: 'Test PO',
        placementOfficerProfile: {
          create: {
            department: 'Placement Cell',
          },
        },
      },
    });
  }

  const studentProfile = await prisma.studentProfile.findFirst({ where: { userId: studentUser.id } });
  if (!studentProfile) {
    console.error('Failed to resolve student profile');
    process.exit(1);
  }

  // 2. Clean up previous test activities
  await prisma.activityParticipant.deleteMany({
    where: { studentId: studentProfile.id },
  });
  await prisma.activity.deleteMany({
    where: { title: { startsWith: 'TEST_' } },
  });

  // Test Case 1: Create activity and generate 3 OTPs
  try {
    const startTime = new Date(Date.now() + 60 * 1000); // starts in 1 minute
    const endTime = new Date(Date.now() + 60 * 60 * 1000); // ends in 1 hour
    const activity = await ActivityService.createActivity({
      title: 'TEST_DSA_HACKATHON',
      description: 'A mock DSA challenge for testing purposes',
      category: 'HACKATHON',
      startTime,
      endTime,
      points: 50,
      maxParticipants: 10,
      venue: 'Lab A',
      gracePeriodMinutes: 10,
    }, poUser.id);

    assert(activity.id !== undefined, 'Activity created successfully with ID');
    
    // Check if 3 independent OTPs exist
    const otps = await prisma.activityOtp.findMany({ where: { activityId: activity.id } });
    assert(otps.length === 3, 'Exactly three OTP records created');

    const addOtp = otps.find(o => o.type === ActivityOtpType.ADD_PARTICIPANT);
    const startOtp = otps.find(o => o.type === ActivityOtpType.START_ACTIVITY);
    const endOtp = otps.find(o => o.type === ActivityOtpType.END_ACTIVITY);

    assert(addOtp !== undefined && startOtp !== undefined && endOtp !== undefined, 'All three OTP types exist');

    // Test Case 2: Join Activity using valid ADD OTP
    const decryptedAddOtp = decrypt(addOtp!.otpHash);
    const joined = await ActivityService.joinActivity(activity.id, studentUser.id, decryptedAddOtp);
    assert(joined.status === ParticipationStatus.ASSIGNED, 'Student joined and status set to ASSIGNED');

    // Test Case 3: Re-joining should fail
    try {
      await ActivityService.joinActivity(activity.id, studentUser.id, decryptedAddOtp);
      assert(false, 'Duplicate join did not throw error');
    } catch (err: any) {
      assert(err.statusCode === 409, 'Duplicate join correctly rejected with 409 Conflict');
    }

    // Test Case 4: Start activity before scheduled startTime should fail
    const decryptedStartOtp = decrypt(startOtp!.otpHash);
    try {
      await ActivityService.startActivity(activity.id, studentUser.id, decryptedStartOtp);
      assert(false, 'Starting before scheduled startTime did not throw error');
    } catch (err: any) {
      assert(err.message.includes('has not started yet'), 'Starting too early correctly rejected');
    }

    // Modify activity times so it is LIVE for starting
    await prisma.activity.update({
      where: { id: activity.id },
      data: { startTime: new Date(Date.now() - 5 * 60 * 1000) }, // started 5 mins ago
    });

    // Test Case 5: Start activity with valid START OTP
    const started = await ActivityService.startActivity(activity.id, studentUser.id, decryptedStartOtp);
    assert(started.status === ParticipationStatus.STARTED, 'Student status transitioned to STARTED');

    // Test Case 6: End activity before grace period expired
    const decryptedEndOtp = decrypt(endOtp!.otpHash);
    const initialPoints = studentProfile.activityPoints || 0;
    
    const completed = await ActivityService.endActivity(activity.id, studentUser.id, decryptedEndOtp);
    assert(completed.status === ParticipationStatus.COMPLETED, 'Student status transitioned to COMPLETED');
    assert(completed.pointsAwarded === 50, 'Activity points awarded matches configured points');

    // Verify points updated in StudentProfile
    const updatedProfile = await prisma.studentProfile.findUnique({ where: { id: studentProfile.id } });
    assert(updatedProfile!.activityPoints === initialPoints + 50, 'Student Profile activity points incremented correctly');

    // Test Case 7: Ending completed activity again should fail (prevent double points award)
    try {
      await ActivityService.endActivity(activity.id, studentUser.id, decryptedEndOtp);
      assert(false, 'Ending completed activity again did not throw error');
    } catch (err: any) {
      assert(err.message.includes('already completed'), 'Replay of END OTP correctly rejected');
    }

    // Test Case 8: OTP rate limit lockout check
    // Create another activity
    const activity2 = await ActivityService.createActivity({
      title: 'TEST_RATE_LIMIT',
      description: 'Activity to test brute force lockout',
      category: 'WORKSHOP',
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      points: 10,
    }, poUser.id);

    // Fail OTP entry 5 times
    let gotLockout = false;
    for (let i = 0; i < 6; i++) {
      try {
        await ActivityService.joinActivity(activity2.id, studentUser.id, '000000');
      } catch (err: any) {
        if (err.message.includes('Locked out') || err.message.includes('Too many attempts')) {
          gotLockout = true;
          break;
        }
      }
    }
    assert(gotLockout, 'Brute force lockout triggered after multiple failed OTP attempts');

  } catch (error) {
    console.error('Unexpected test crash:', error);
    failed++;
  }

  // Final count
  console.log(`\n📊 Tests complete. Passed: ${passed}, Failed: ${failed}`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
