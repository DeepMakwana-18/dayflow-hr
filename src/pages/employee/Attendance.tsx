import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
}

export default function Attendance() {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentWeek] = useState(new Date());

  useEffect(() => {
    if (profile?.id) {
      fetchAttendance();
    }
  }, [profile?.id]);

  const fetchAttendance = async () => {
    if (!profile?.id) return;

    const weekStart = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', profile.id)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date', { ascending: false });

    if (data) {
      setAttendance(data as AttendanceRecord[]);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayAtt = data.find((r) => r.date === today);
      setTodayRecord(todayAtt as AttendanceRecord || null);
    }
  };

  const handleCheckIn = async () => {
    if (!profile?.id) return;
    setLoading(true);

    const today = format(new Date(), 'yyyy-MM-dd');
    const checkInTime = format(new Date(), 'HH:mm:ss');

    const { error } = await supabase.from('attendance').insert({
      profile_id: profile.id,
      date: today,
      check_in: checkInTime,
      status: 'present',
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already checked in today');
      } else {
        toast.error('Failed to check in');
      }
    } else {
      toast.success('Checked in successfully!');
      fetchAttendance();
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    if (!profile?.id || !todayRecord) return;
    setLoading(true);

    const checkOutTime = format(new Date(), 'HH:mm:ss');

    const { error } = await supabase
      .from('attendance')
      .update({ check_out: checkOutTime })
      .eq('id', todayRecord.id);

    if (error) {
      toast.error('Failed to check out');
    } else {
      toast.success('Checked out successfully!');
      fetchAttendance();
    }
    setLoading(false);
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
  });

  const getAttendanceForDay = (day: Date) => {
    return attendance.find((r) => isSameDay(new Date(r.date), day));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground';
      case 'absent':
        return 'bg-destructive text-destructive-foreground';
      case 'half_day':
        return 'bg-warning text-warning-foreground';
      case 'leave':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout requiredRole="employee">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track your daily attendance and work hours</p>
        </div>

        {/* Today's Actions */}
        <div className="form-section mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Today - {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </h2>
              {todayRecord ? (
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-muted-foreground">
                    Check-in: <span className="font-medium text-foreground">{todayRecord.check_in || '-'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check-out: <span className="font-medium text-foreground">{todayRecord.check_out || '-'}</span>
                  </p>
                  <div className={`status-badge status-${todayRecord.status.replace('_', '-')}`}>
                    {todayRecord.status.replace('_', ' ')}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">You haven't checked in today</p>
              )}
            </div>
            <div className="flex gap-3">
              {!todayRecord ? (
                <Button onClick={handleCheckIn} disabled={loading} className="bg-gradient-primary">
                  <LogIn className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              ) : !todayRecord.check_out ? (
                <Button onClick={handleCheckOut} disabled={loading} variant="outline">
                  <LogOut className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-success">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Day Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly View */}
        <div className="form-section">
          <h3 className="font-semibold text-foreground mb-4">This Week</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAttendance = getAttendanceForDay(day);
              const isToday = isSameDay(day, new Date());
              const isPast = day < new Date() && !isToday;

              return (
                <div
                  key={day.toISOString()}
                  className={`p-4 rounded-lg text-center transition-all ${
                    isToday ? 'ring-2 ring-primary bg-primary/5' : 'bg-muted/50'
                  }`}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {format(day, 'EEE')}
                  </p>
                  <p className={`text-lg font-bold mt-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="mt-2">
                    {dayAttendance ? (
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(dayAttendance.status)}`}>
                        {dayAttendance.status.replace('_', ' ')}
                      </div>
                    ) : isPast ? (
                      <div className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                        absent
                      </div>
                    ) : (
                      <div className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        -
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance History */}
        <div className="form-section mt-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Attendance</h3>
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                      <td>{record.check_in || '-'}</td>
                      <td>{record.check_out || '-'}</td>
                      <td>
                        <span className={`status-badge status-${record.status.replace('_', '-')}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No attendance records this week</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
