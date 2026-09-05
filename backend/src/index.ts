import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import prisma from './config/database';
import { errorHandler, notFoundHandler } from './middleware';
import { authRoutes } from './modules/auth';
import { studentRoutes } from './modules/student';
import { recruiterRoutes } from './modules/recruiter';
import { placementRoutes } from './modules/placement-officer';
import { adminRoutes, adminManageRoutes } from './modules/admin';
import { resumeRoutes } from './modules/resume';
import { portfolioRoutes } from './modules/portfolio';
import { notificationRoutes } from './modules/notification';
import { jobRoutes } from './modules/job';
import { analyticsRoutes } from './modules/analytics';
import { psRoutes } from './modules/ps';
import { studentInterviewRouter, placementInterviewRouter } from './modules/interview-round';
import { extensionUserRoutes, ExtensionUserController } from './modules/extension-user';
import { activityRoutes } from './modules/activities';
import { resultsRoutes } from './modules/results';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like extension background/popup, curl, etc.)
      if (!origin || origin.startsWith('chrome-extension://') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Placement Portal API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes (will be added in subsequent phases)
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/students', studentInterviewRouter);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/placement', placementInterviewRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/admins', adminManageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ps', psRoutes);
app.use('/api/users', extensionUserRoutes);
app.get('/api/dashboard/stats', ExtensionUserController.getDashboardStats);
app.post('/api/activity', ExtensionUserController.logActivity);
app.get('/api/activity', ExtensionUserController.getActivityLogs);
app.use('/api/activities', activityRoutes);
app.use('/api/results', resultsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

import { createServer } from 'http';
import { initSocket } from './config/socket';

// Start server
const PORT = env.PORT;
const server = createServer(app);
initSocket(server);

app.listen(PORT, async () => {
  console.log(`🚀 Placement Portal Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);

  try {
    const studentsWithNoneClearance = await prisma.studentProfile.findMany({
      where: {
        OR: [
          { levelClearance: 'None' },
          { levelClearance: '' },
          { levelClearance: '0' },
          { levelClearance: null }
        ],
        psConnected: true
      },
      include: {
        psCourses: true
      }
    });

    for (const student of studentsWithNoneClearance) {
      const totalLevelsCompleted = student.psCourses.reduce((sum: number, c: any) => sum + c.completedLevels, 0);
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { levelClearance: String(totalLevelsCompleted) }
      });
      console.log(`🔧 Startup: Migrated levelClearance for student ${student.rollNumber} to ${totalLevelsCompleted}`);
    }
  } catch (err: any) {
    console.error('❌ Startup: Failed to run levelClearance migration:', err.message || err);
  }
});

export default app;
