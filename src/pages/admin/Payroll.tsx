import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, Wallet, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    employee_id: string;
    department: string | null;
  };
}

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payroll')
      .select('*, profile:profiles(first_name, last_name, employee_id, department)')
      .order('month', { ascending: false });

    if (data) {
      setPayrolls(data as unknown as PayrollRecord[]);
    }
    setLoading(false);
  };

  const filteredPayrolls = payrolls.filter((record) => {
    const query = searchQuery.toLowerCase();
    const profile = record.profile;
    return (
      profile?.employee_id?.toLowerCase().includes(query) ||
      profile?.first_name?.toLowerCase().includes(query) ||
      profile?.last_name?.toLowerCase().includes(query) ||
      profile?.department?.toLowerCase().includes(query)
    );
  });

  const totalPayroll = filteredPayrolls.reduce((sum, p) => sum + Number(p.net_salary), 0);

  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Manage and view employee payroll records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{filteredPayrolls.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-sm text-muted-foreground">Total Disbursement</p>
            </div>
            <p className="text-3xl font-bold text-foreground">${totalPayroll.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-accent" />
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {filteredPayrolls.filter((p) => p.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="form-section mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Payroll Table */}
        <div className="form-section">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPayrolls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <p className="font-medium">
                          {record.profile?.first_name && record.profile?.last_name
                            ? `${record.profile.first_name} ${record.profile.last_name}`
                            : record.profile?.employee_id}
                        </p>
                        <p className="text-xs text-muted-foreground">{record.profile?.department}</p>
                      </td>
                      <td>{format(new Date(record.month), 'MMMM yyyy')}</td>
                      <td>${Number(record.basic_salary).toLocaleString()}</td>
                      <td className="text-success">+${Number(record.allowances).toLocaleString()}</td>
                      <td className="text-destructive">-${Number(record.deductions).toLocaleString()}</td>
                      <td className="font-semibold">${Number(record.net_salary).toLocaleString()}</td>
                      <td>
                        <span
                          className={`status-badge ${
                            record.status === 'paid' ? 'status-approved' : 'status-pending'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No payroll records found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
