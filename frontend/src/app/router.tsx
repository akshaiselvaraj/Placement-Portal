import { createBrowserRouter } from 'react-router-dom';
import { RoleRedirect, ProtectedRoute } from '@/routes';
import { LoginPage, RegisterPage } from '@/features/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentDashboard, ProfilePage } from '@/features/student';
import {
  RecruiterDashboard,
  ApplicantsPage,
  CompanyProfilePage,
  CandidateDetailPage,
  InterviewsPage,
  HiringHistoryPage,
  CandidateSearchPage,
} from '@/features/recruiter';
import {
  PlacementDashboard,
  StudentsManagement,
  ApprovalsDesk,
  InterviewDesk,
} from '@/features/placement-officer';
import { AdminDashboard, UsersManagement, CompaniesManagement } from '@/features/admin';
import { ResumesPage, ResumeWorkspace } from '@/features/resume-builder';
import { PortfoliosPage, PortfolioWorkspace, PublicPortfolioView } from '@/features/portfolio-generator';
import { RecruiterJobsPage, BrowseJobsPage, MyApplicationsPage } from '@/features/jobs';
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
        path: '/admin/companies',
        element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CompaniesManagement />
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
        path: '/placement/results',
        element: (
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER']}>
            <InterviewDesk />
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
        path: '/recruiter/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/company',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <CompanyProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/applicants',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <ApplicantsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/applicants/:applicationId',
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
            <InterviewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/recruiter/hiring-history',
        element: (
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <HiringHistoryPage />
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
        path: '/student/dashboard',
        element: (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
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
        path: '/student/resumes/:id',
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
    ],
  },

  // Catch all
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
