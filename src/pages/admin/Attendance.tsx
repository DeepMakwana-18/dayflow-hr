import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    employee_id: string;
    department: string | null;
  };
}

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const fetchAttendance = async () => {
    setLoading(true);
    
    let startDate: string;
    let endDate: string;
    const today = new Date();

    switch (dateFilter) {
      case 'today':
        startDate = format(today, 'yyyy-MM-dd');
        endDate = startDate;
        break;
      case 'week':
        startDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        endDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      default:
        startDate = format(today, 'yyyy-MM-dd');
        endDate = startDate;
    }

    const { data } = await supabase
      .from('attendance')
      .select('*, profile:profiles(first_name, last_name, employee_id, department)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (data) {
      setAttendance(data as unknown as AttendanceRecord[]);
    }
    setLoading(false);
  };

  const filteredAttendance = attendance.filter((record) => {
    const query = searchQuery.toLowerCase();
    const profile = record.profile;
    return (
      profile?.employee_id?.toLowerCase().includes(query) ||
      profile?.first_name?.toLowerCase().includes(query) ||
      profile?.last_name?.toLowerCase().includes(query) ||
      profile?.department?.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'status-present';
      case 'absent':
        return 'status-absent';
      case 'half_day':
        return 'status-half-day';
      case 'leave':
        return 'status-leave';
      default:
        return '';
    }
  };

  const presentCount = filteredAttendance.filter((r) => r.status === 'present').length;
  const absentCount = filteredAttendance.filter((r) => r.status === 'absent').length;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track and manage employee attendance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Records</p>
            <p className="text-3xl font-bold text-foreground mt-1">{filteredAttendance.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Present</p>
            <p className="text-3xl font-bold text-success mt-1">{presentCount}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Absent</p>
            <p className="text-3xl font-bold text-destructive mt-1">{absentCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="form-section mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="form-section">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">
                        {record.profile?.first_name && record.profile?.last_name
                          ? `${record.profile.first_name} ${record.profile.last_name}`
                          : 'N/A'}
                      </td>
                      <td className="font-mono text-sm">{record.profile?.employee_id}</td>
                      <td>{record.profile?.department || '-'}</td>
                      <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                      <td>{record.check_in || '-'}</td>
                      <td>{record.check_out || '-'}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No attendance records found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
