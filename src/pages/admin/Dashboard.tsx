import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Clock,
  CalendarDays,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface Stats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  totalPayroll: number;
}

interface PendingLeave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    employee_id: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    presentToday: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
  });
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch total employees
    const { count: employeeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Fetch today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { count: presentCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'present');

    // Fetch pending leaves
    const { count: pendingCount, data: pendingData } = await supabase
      .from('leave_requests')
      .select('*, profile:profiles(first_name, last_name, employee_id)', { count: 'exact' })
      .eq('status', 'pending')
      .limit(5);

    // Fetch total payroll (latest month)
    const { data: payrollData } = await supabase
      .from('payroll')
      .select('net_salary')
      .order('month', { ascending: false })
      .limit(100);

    const totalPayroll = payrollData?.reduce((sum, p) => sum + Number(p.net_salary), 0) || 0;

    setStats({
      totalEmployees: employeeCount || 0,
      presentToday: presentCount || 0,
      pendingLeaves: pendingCount || 0,
      totalPayroll,
    });

    if (pendingData) {
      setPendingLeaves(pendingData as unknown as PendingLeave[]);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'text-primary bg-primary/10',
      href: '/admin/employees',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: CheckCircle,
      color: 'text-success bg-success/10',
      href: '/admin/attendance',
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: AlertCircle,
      color: 'text-warning bg-warning/10',
      href: '/admin/leave',
    },
    {
      title: 'Total Payroll',
      value: `$${stats.totalPayroll.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-accent bg-accent/10',
      href: '/admin/payroll',
    },
  ];

  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of your HR operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              to={stat.href}
              className="stat-card group hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">{stat.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Leave Requests */}
          <div className="form-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Pending Leave Requests
              </h3>
              <Link to="/admin/leave" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {pendingLeaves.length > 0 ? (
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {leave.profile?.first_name && leave.profile?.last_name
                          ? `${leave.profile.first_name} ${leave.profile.last_name}`
                          : leave.profile?.employee_id}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {leave.leave_type} leave • {leave.start_date} to {leave.end_date}
                      </p>
                    </div>
                    <div className="status-badge status-pending">Pending</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No pending leave requests
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="form-section">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/employees"
                className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
              >
                <Users className="w-6 h-6 mx-auto text-primary mb-2" />
                <p className="text-sm font-medium">Manage Employees</p>
              </Link>
              <Link
                to="/admin/attendance"
                className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
              >
                <Clock className="w-6 h-6 mx-auto text-success mb-2" />
                <p className="text-sm font-medium">View Attendance</p>
              </Link>
              <Link
                to="/admin/leave"
                className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
              >
                <CalendarDays className="w-6 h-6 mx-auto text-warning mb-2" />
                <p className="text-sm font-medium">Approve Leaves</p>
              </Link>
              <Link
                to="/admin/payroll"
                className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
              >
                <Wallet className="w-6 h-6 mx-auto text-accent mb-2" />
                <p className="text-sm font-medium">Manage Payroll</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
