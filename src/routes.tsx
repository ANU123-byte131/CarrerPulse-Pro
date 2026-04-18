import { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import IndexPage from './pages/index';

const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const ResumePage = lazy(() => import('./pages/resume'));
const JobMatchPage = lazy(() => import('./pages/job-match'));
const SkillGapPage = lazy(() => import('./pages/skill-gap'));
const RoadmapPage = lazy(() => import('./pages/roadmap'));
const InterviewPage = lazy(() => import('./pages/interview'));
const ApplicationsPage = lazy(() => import('./pages/applications'));
const CoachPage = lazy(() => import('./pages/coach'));
const ProfilePage = lazy(() => import('./pages/profile'));

const NotFoundPage = lazy(() => import('./pages/_404'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  { path: '/', element: <IndexPage /> },
  { path: '/login', element: withSuspense(LoginPage) },
  { path: '/register', element: withSuspense(RegisterPage) },
  { path: '/dashboard', element: withSuspense(DashboardPage) },
  { path: '/resume', element: withSuspense(ResumePage) },
  { path: '/job-match', element: withSuspense(JobMatchPage) },
  { path: '/skill-gap', element: withSuspense(SkillGapPage) },
  { path: '/roadmap', element: withSuspense(RoadmapPage) },
  { path: '/interview', element: withSuspense(InterviewPage) },
  { path: '/applications', element: withSuspense(ApplicationsPage) },
  { path: '/coach', element: withSuspense(CoachPage) },
  { path: '/profile', element: withSuspense(ProfilePage) },
  { path: '*', element: withSuspense(NotFoundPage) },
];

export type Path = '/' | '/login' | '/register' | '/dashboard' | '/resume' | '/job-match' | '/skill-gap' | '/roadmap' | '/interview' | '/applications' | '/coach' | '/profile';
