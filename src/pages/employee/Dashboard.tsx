import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const dashboardCards: DashboardCard[] = [
  {
    title: 'My Profile',
    description: 'View and update your personal information',
    icon: User,
    href: '/profile',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Attendance',
    description: 'Track your daily attendance',
    icon: Clock,
    href: '/attendance',
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Leave Requests',
    description: 'Apply and track leave requests',
    icon: CalendarDays,
    href: '/leave',
    color: 'bg-accent/10 text-accent',
  },
  {
    title: 'Payroll',
    description: 'View your salary and payslips',
    icon: Wallet,
    href: '/payroll',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Documents',
    description: 'Access your uploaded documents',
    icon: FileText,
    href: '/documents',
    color: 'bg-blue-100 text-blue-600',
  },
];

interface LeaveRequest {
  id: string;
  leave_type: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
}

export default function EmployeeDashboard() {
  const { profile } = useAuth();
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchRecentData();
    }
  }, [profile?.id]);

  const fetchRecentData = async () => {
    if (!profile?.id) return;

    // Fetch recent leave requests
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (leaves) {
      setRecentLeaves(leaves as LeaveRequest[]);
    }

    // Fetch today's attendance
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('date', today)
      .maybeSingle();
    
    if (attendance) {
      setTodayAttendance(attendance as AttendanceRecord);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <DashboardLayout requiredRole="employee">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}! 👋
          </h1>
          <p className="page-subtitle">
            Here's an overview of your work dashboard
          </p>
        </div>

        {/* Today's Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="stat-card col-span-1 lg:col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Today's Attendance</h3>
            {todayAttendance ? (
              <div className="flex items-center gap-4">
                <div className={`status-badge ${todayAttendance.status === 'present' ? 'status-present' : 'status-absent'}`}>
                  {todayAttendance.status.replace('_', ' ')}
                </div>
                {todayAttendance.check_in && (
                  <p className="text-sm text-muted-foreground">
                    Check-in: <span className="text-foreground font-medium">{todayAttendance.check_in}</span>
                  </p>
                )}
                {todayAttendance.check_out && (
                  <p className="text-sm text-muted-foreground">
                    Check-out: <span className="text-foreground font-medium">{todayAttendance.check_out}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="status-badge status-absent">Not Checked In</div>
                <Link to="/attendance" className="text-sm text-primary hover:underline">
                  Mark attendance →
                </Link>
              </div>
            )}
          </div>

          <div className="stat-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Employee ID</h3>
            <p className="text-2xl font-bold text-foreground">{profile?.employee_id || 'N/A'}</p>
          </div>
        </div>

        {/* Quick Access Cards */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {dashboardCards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="dashboard-card group"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-foreground mt-4">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Leave Requests */}
        {recentLeaves.length > 0 && (
          <div className="form-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Leave Requests</h2>
              <Link to="/leave" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(leave.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">
                        {leave.leave_type} Leave
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className={`status-badge status-${leave.status}`}>
                    {leave.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
