import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64 min-h-screen transition-all duration-300">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
