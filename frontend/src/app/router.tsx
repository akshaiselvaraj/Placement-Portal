import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RoleRedirect, ProtectedRoute } from '@/routes';
import { LoginPage, RegisterPage } from '@/features/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentDashboard, ProfilePage, AtsCheckPage, AttendedCompaniesPage, ExamPreparationPage } from '@/features/student';
import {
  PlacementDashboard,
  StudentsManagement,
  ApprovalsDesk,
  InterviewDesk,
  PlacementDrivesPage,
  CompaniesPage,
  ApplicationsPage,
  InterviewsPage as PlacementInterviewsPage,
  ResultsManagementPage,
  InterviewRoundManagementPage,
  InterviewQuestionReviewPage,
} from '@/features/placement-officer';
import { AdminDashboard, UsersManagement, CompaniesManagement, AdminsManagement, SystemSettings, SystemLogs } from '@/features/admin';
import { ResumesPage, ResumeWorkspace, ResumePreviewPage } from '@/features/resume-builder';
import { PortfoliosPage, PortfolioWorkspace, PublicPortfolioView } from '@/features/portfolio-generator';
import { BrowseJobsPage, MyApplicationsPage, RecruiterJobsPage } from '@/features/jobs';
import {
  RecruiterDashboard,
  ApplicantsPage as RecruiterApplicantsPage,
  CompanyProfilePage,
  CandidateDetailPage,
  InterviewsPage as RecruiterInterviewsPage,
  HiringHistoryPage,
  CandidateSearchPage,
} from '@/features/recruiter';
import { PlacementAnalyticsPage } from '@/features/analytics';

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--danger))' }}>403</h1>
      <p className="text-lg" style={{ color: 'hsl(var(--text-secondary))' }}>You don&apos;t have permission to access this page.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--text-muted))' }}>404</h1>
      <p className="text-lg" style={{ color: 'hsl(var(--text-secondary))' }}>Page not found.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RoleRedirect />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/portfolio/public/:slug',
    element: <PublicPortfolioView />,
  },
  {
    path: '/portfolio/:slug',
    element: <PublicPortfolioView />,
  },

  // Protected Dashboard Shell
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/admin/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/admins',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminsManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/companies',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CompaniesManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/settings',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SystemSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/logs',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SystemLogs />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <PlacementDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/students',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <StudentsManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/companies',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <CompaniesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/drives',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <PlacementDrivesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/applications',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <ApplicationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/interviews',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <PlacementInterviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/approvals',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <ApprovalsDesk />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/scheduler',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <InterviewDesk />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/interview-rounds',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <InterviewRoundManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement-officer/interview-rounds',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <InterviewRoundManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/interview-questions',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <InterviewQuestionReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement-officer/interview-questions',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <InterviewQuestionReviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/results',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <ResultsManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/placement/analytics',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <PlacementAnalyticsPage />
          </ProtectedRoute>
        ),
      },

      {
        path: '/student/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/attended-companies',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AttendedCompaniesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/exam-preparation',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ExamPreparationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/ats-check',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AtsCheckPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/profile',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/resumes',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <ResumesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/resume',
        element: <Navigate to="/student/resumes" replace />,
      },
      {
        path: '/student/resume/preview/:id',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER']}>
            <ResumePreviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/resumes/:id',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER']}>
            <ResumeWorkspace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/resume/preview/:id',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER']}>
            <ResumeWorkspace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/portfolio',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <PortfoliosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/portfolio/:id',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT', 'RECRUITER', 'PLACEMENT_OFFICER']}>
            <PortfolioWorkspace />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/jobs',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <BrowseJobsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/student/applications',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <MyApplicationsPage />
          </ProtectedRoute>
        ),
      },
      // Recruiter routes
      {
        path: '/recruiter/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/jobs',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterJobsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/applicants',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterApplicantsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/applicants/:id',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <CandidateDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/candidates',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <CandidateSearchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/interviews',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterInterviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/history',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <HiringHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/profile',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <CompanyProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Catch all
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
