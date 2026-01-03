import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const employeeNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'Attendance', href: '/attendance', icon: Clock },
  { label: 'Leave Requests', href: '/leave', icon: CalendarDays },
  { label: 'Payroll', href: '/payroll', icon: Wallet },
  { label: 'Documents', href: '/documents', icon: FileText },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Employees', href: '/admin/employees', icon: Users },
  { label: 'Attendance', href: '/admin/attendance', icon: Clock },
  { label: 'Leave Requests', href: '/admin/leave', icon: CalendarDays },
  { label: 'Payroll', href: '/admin/payroll', icon: Wallet },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === 'admin' ? adminNavItems : employeeNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-sidebar-accent-foreground font-semibold text-lg">Dayflow</h1>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* User Info */}
      {!collapsed && profile && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-sidebar-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {profile.first_name && profile.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.email}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate capitalize">
                {role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'sidebar-item',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleSignOut}
          className={cn(
            'sidebar-item w-full text-left hover:bg-destructive/10 hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
