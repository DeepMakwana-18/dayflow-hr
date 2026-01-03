import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Clock, CalendarDays, Wallet, Shield, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, role, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Complete employee profiles with personal and job details',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Daily check-in/out with weekly attendance views',
    },
    {
      icon: CalendarDays,
      title: 'Leave Management',
      description: 'Apply and approve leave requests seamlessly',
    },
    {
      icon: Wallet,
      title: 'Payroll System',
      description: 'Salary structures, deductions, and payslips',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access for admins and employees',
    },
    {
      icon: CheckCircle,
      title: 'Real-time Updates',
      description: 'Instant notifications and status updates',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center mb-6 shadow-lg">
              <span className="text-primary-foreground font-bold text-3xl">D</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Dayflow
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 animate-fade-in">
              Every workday, perfectly aligned
            </p>
            <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto animate-fade-in">
              A comprehensive HR management system designed to streamline employee management, 
              attendance tracking, leave approvals, and payroll processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground h-12 px-8 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-12 px-8 text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything you need to manage your workforce
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Dayflow provides all the tools HR teams and employees need for efficient 
            workforce management in one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="dashboard-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to streamline your HR operations?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join Dayflow today and experience seamless workforce management.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:opacity-90"
          >
            Create an Account
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 Dayflow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
