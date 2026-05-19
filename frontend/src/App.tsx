import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { StudentDashboard } from '@/pages/StudentDashboard';
import { LecturerDashboard } from '@/pages/LecturerDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { ResourceRepository } from '@/pages/ResourceRepository';
import { UploadPage } from '@/pages/UploadPage';
import { SearchPage } from '@/pages/SearchPage';
import { CoursesPage } from '@/pages/CoursesPage';
import { UsersPage } from '@/pages/UsersPage';
import { Toaster } from '@/components/ui/sonner';
import { LLAssistant } from '@/components/LLAssistant';
import './App.css';

// Simple router component
function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Make navigate available globally
  useEffect(() => {
    (window as any).navigate = navigate;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0158fe]"></div>
      </div>
    );
  }

  // Public routes
  if (!isAuthenticated) {
    switch (currentPath) {
      case '/login':
        return <LoginPage />;
      case '/register':
        return <RegisterPage />;
      default:
        return <LandingPage />;
    }
  }

  // Protected routes based on role
  const role = user?.role;

  switch (currentPath) {
    case '/':
      if (role === 'student') return <StudentDashboard />;
      if (role === 'lecturer') return <LecturerDashboard />;
      if (role === 'admin') return <AdminDashboard />;
      return <StudentDashboard />;
    case '/dashboard':
      if (role === 'student') return <StudentDashboard />;
      if (role === 'lecturer') return <LecturerDashboard />;
      if (role === 'admin') return <AdminDashboard />;
      return <StudentDashboard />;
    case '/resources':
      return <ResourceRepository />;
    case '/upload':
      if (role === 'lecturer' || role === 'admin') return <UploadPage />;
      return <ResourceRepository />;
    case '/search':
      return <SearchPage />;
    case '/courses':
      if (role === 'admin' || role === 'lecturer') return <CoursesPage />;
      return <StudentDashboard />;
    case '/users':
      if (role === 'admin') return <UsersPage />;
      return <StudentDashboard />;
    default:
      // Redirect to appropriate dashboard
      if (role === 'student') return <StudentDashboard />;
      if (role === 'lecturer') return <LecturerDashboard />;
      if (role === 'admin') return <AdminDashboard />;
      return <StudentDashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster position="top-right" />
      <LLAssistant />
    </AuthProvider>
  );
}

export default App;
