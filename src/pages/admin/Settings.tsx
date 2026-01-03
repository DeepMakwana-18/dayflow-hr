import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure system settings</p>
        </div>

        <div className="form-section">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">System settings coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              Configure notifications, company details, and more
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
