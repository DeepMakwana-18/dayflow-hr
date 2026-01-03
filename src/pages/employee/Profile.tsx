import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, User, Briefcase, Calendar, Phone, MapPin, Mail } from 'lucide-react';
import { format } from 'date-fns';

interface SalaryStructure {
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowances: number;
}

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  useEffect(() => {
    if (profile?.id) {
      fetchSalary();
    }
  }, [profile?.id]);

  useEffect(() => {
    setFormData({
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
  }, [profile]);

  const fetchSalary = async () => {
    if (!profile?.id) return;
    
    const { data } = await supabase
      .from('salary_structure')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();
    
    if (data) {
      setSalary(data as SalaryStructure);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        phone: formData.phone,
        address: formData.address,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      await refreshProfile();
      setEditing(false);
    }
    setLoading(false);
  };

  const InfoCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) => (
    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || 'Not set'}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout requiredRole="employee">
      <div className="animate-fade-in max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and manage your personal information</p>
        </div>

        {/* Profile Header */}
        <div className="form-section mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.email}
              </h2>
              <p className="text-muted-foreground">{profile?.position || 'Employee'}</p>
              <p className="text-sm text-muted-foreground mt-1">ID: {profile?.employee_id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="form-section">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground">Personal Details</h3>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="input-group">
                  <Label className="input-label">Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="input-group">
                  <Label className="input-label">Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <InfoCard icon={Mail} label="Email" value={profile?.email || null} />
                <InfoCard icon={Phone} label="Phone" value={profile?.phone || null} />
                <InfoCard icon={MapPin} label="Address" value={profile?.address || null} />
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="form-section">
            <h3 className="font-semibold text-foreground mb-6">Job Details</h3>
            <div className="grid gap-3">
              <InfoCard icon={User} label="Employee ID" value={profile?.employee_id || null} />
              <InfoCard icon={Briefcase} label="Department" value={profile?.department || null} />
              <InfoCard icon={Briefcase} label="Position" value={profile?.position || null} />
              <InfoCard
                icon={Calendar}
                label="Hire Date"
                value={profile?.hire_date ? format(new Date(profile.hire_date), 'MMM d, yyyy') : null}
              />
            </div>
          </div>

          {/* Salary Structure */}
          {salary && (
            <div className="form-section lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-6">Salary Structure</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Basic Salary</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${Number(salary.basic_salary).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Housing Allowance</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${Number(salary.housing_allowance).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Transport Allowance</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${Number(salary.transport_allowance).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Other Allowances</p>
                  <p className="text-lg font-semibold text-foreground">
                    ${Number(salary.other_allowances).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
