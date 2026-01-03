import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequest {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  remarks: string | null;
  status: string;
  admin_comments: string | null;
  created_at: string;
}

export default function Leave() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leave_type: 'paid',
    start_date: '',
    end_date: '',
    remarks: '',
  });

  useEffect(() => {
    if (profile?.id) {
      fetchLeaves();
    }
  }, [profile?.id]);

  const fetchLeaves = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setLeaves(data as LeaveRequest[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('leave_requests').insert({
      profile_id: profile.id,
      leave_type: formData.leave_type as 'paid' | 'sick' | 'unpaid',
      start_date: formData.start_date,
      end_date: formData.end_date,
      remarks: formData.remarks || null,
    });

    if (error) {
      toast.error('Failed to submit leave request');
    } else {
      toast.success('Leave request submitted successfully!');
      setDialogOpen(false);
      setFormData({ leave_type: 'paid', start_date: '', end_date: '', remarks: '' });
      fetchLeaves();
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;

  return (
    <DashboardLayout requiredRole="employee">
      <div className="animate-fade-in">
        <div className="page-header flex items-start justify-between">
          <div>
            <h1 className="page-title">Leave Requests</h1>
            <p className="page-subtitle">Apply for and track your leave requests</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="input-group">
                  <Label className="input-label">Leave Type</Label>
                  <Select
                    value={formData.leave_type}
                    onValueChange={(v) => setFormData({ ...formData, leave_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="input-group">
                    <Label className="input-label">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <Label className="input-label">End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <Label className="input-label">Remarks (Optional)</Label>
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Reason for leave..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    Submit Request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-3xl font-bold text-foreground mt-1">{leaves.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-3xl font-bold text-warning mt-1">{pendingCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-3xl font-bold text-success mt-1">{approvedCount}</p>
          </div>
        </div>

        {/* Leave List */}
        <div className="form-section">
          <h3 className="font-semibold text-foreground mb-4">All Leave Requests</h3>
          {leaves.length > 0 ? (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 bg-muted/30 rounded-lg border border-border/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(leave.status)}
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {leave.leave_type} Leave
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(leave.start_date), 'MMM d')} -{' '}
                          {format(new Date(leave.end_date), 'MMM d, yyyy')}
                        </div>
                        {leave.remarks && (
                          <p className="text-sm text-muted-foreground mt-2">
                            "{leave.remarks}"
                          </p>
                        )}
                        {leave.admin_comments && (
                          <p className="text-sm text-primary mt-2 italic">
                            Admin: {leave.admin_comments}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`status-badge status-${leave.status}`}>
                      {leave.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                Create your first request
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
