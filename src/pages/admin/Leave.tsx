import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CalendarDays, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
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
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    employee_id: string;
    department: string | null;
  };
}

export default function AdminLeave() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leave_requests')
      .select('*, profile:profiles(id, first_name, last_name, employee_id, department)')
      .order('created_at', { ascending: false });

    if (data) {
      setLeaves(data as unknown as LeaveRequest[]);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!selectedLeave || !profile) return;
    setProcessing(true);

    const { error } = await supabase
      .from('leave_requests')
      .update({
        status,
        admin_comments: adminComment || null,
        reviewed_by: profile.id,
      })
      .eq('id', selectedLeave.id);

    if (error) {
      toast.error('Failed to update leave request');
    } else {
      toast.success(`Leave request ${status} successfully`);
      setSelectedLeave(null);
      setAdminComment('');
      fetchLeaves();
    }
    setProcessing(false);
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const processedLeaves = leaves.filter((l) => l.status !== 'pending');

  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Review and approve leave requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-3xl font-bold text-warning mt-1">{pendingLeaves.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-3xl font-bold text-success mt-1">
              {leaves.filter((l) => l.status === 'approved').length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="text-3xl font-bold text-destructive mt-1">
              {leaves.filter((l) => l.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingLeaves.length > 0 && (
          <div className="form-section mb-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Pending Approval ({pendingLeaves.length})
            </h3>
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 bg-warning/5 rounded-lg border border-warning/20"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {leave.profile?.first_name && leave.profile?.last_name
                          ? `${leave.profile.first_name} ${leave.profile.last_name}`
                          : leave.profile?.employee_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {leave.profile?.department || 'No department'} • {leave.profile?.employee_id}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="capitalize">{leave.leave_type} leave</span>
                        <span className="text-muted-foreground">•</span>
                        <span>
                          {format(new Date(leave.start_date), 'MMM d')} -{' '}
                          {format(new Date(leave.end_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {leave.remarks && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{leave.remarks}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedLeave(leave)}
                        className="bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedLeave(leave);
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Requests */}
        <div className="form-section">
          <h3 className="font-semibold text-foreground mb-4">All Leave Requests</h3>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Leave Type</th>
                    <th>Duration</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <p className="font-medium">
                          {leave.profile?.first_name && leave.profile?.last_name
                            ? `${leave.profile.first_name} ${leave.profile.last_name}`
                            : leave.profile?.employee_id}
                        </p>
                        <p className="text-xs text-muted-foreground">{leave.profile?.department}</p>
                      </td>
                      <td className="capitalize">{leave.leave_type}</td>
                      <td>
                        {format(new Date(leave.start_date), 'MMM d')} -{' '}
                        {format(new Date(leave.end_date), 'MMM d')}
                      </td>
                      <td>{format(new Date(leave.created_at), 'MMM d, yyyy')}</td>
                      <td>
                        <span className={`status-badge status-${leave.status}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td>
                        {leave.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLeave(leave)}
                          >
                            Review
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests found</p>
            </div>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Leave Request</DialogTitle>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">
                    {selectedLeave.profile?.first_name} {selectedLeave.profile?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leave Details</p>
                  <p className="font-medium capitalize">
                    {selectedLeave.leave_type} leave •{' '}
                    {format(new Date(selectedLeave.start_date), 'MMM d')} -{' '}
                    {format(new Date(selectedLeave.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
                {selectedLeave.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Remarks</p>
                    <p className="italic">"{selectedLeave.remarks}"</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Add Comment (Optional)
                  </p>
                  <Textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Add a comment for the employee..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={processing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={processing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
