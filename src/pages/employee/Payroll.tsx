import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Wallet, Calendar, Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface PayrollRecord {
  id: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: string;
}

interface SalaryStructure {
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowances: number;
}

export default function Payroll() {
  const { profile } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [salary, setSalary] = useState<SalaryStructure | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile?.id) return;

    // Fetch payroll records
    const { data: payrollData } = await supabase
      .from('payroll')
      .select('*')
      .eq('profile_id', profile.id)
      .order('month', { ascending: false });

    if (payrollData) {
      setPayrolls(payrollData as PayrollRecord[]);
    }

    // Fetch salary structure
    const { data: salaryData } = await supabase
      .from('salary_structure')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (salaryData) {
      setSalary(salaryData as SalaryStructure);
    }
  };

  const totalAllowances = salary
    ? Number(salary.housing_allowance) +
      Number(salary.transport_allowance) +
      Number(salary.other_allowances)
    : 0;

  const grossSalary = salary ? Number(salary.basic_salary) + totalAllowances : 0;

  return (
    <DashboardLayout requiredRole="employee">
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Payroll</h1>
          <p className="page-subtitle">View your salary details and payslips</p>
        </div>

        {/* Salary Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Basic Salary</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${salary ? Number(salary.basic_salary).toLocaleString() : '0'}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-sm text-muted-foreground">Total Allowances</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${totalAllowances.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-accent" />
              <p className="text-sm text-muted-foreground">Gross Salary</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${grossSalary.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Payslips</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{payrolls.length}</p>
          </div>
        </div>

        {/* Salary Breakdown */}
        {salary && (
          <div className="form-section mb-8">
            <h3 className="font-semibold text-foreground mb-4">Salary Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-muted-foreground">Basic Salary</span>
                <span className="font-medium text-foreground">
                  ${Number(salary.basic_salary).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-muted-foreground">Housing Allowance</span>
                <span className="font-medium text-foreground">
                  ${Number(salary.housing_allowance).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-muted-foreground">Transport Allowance</span>
                <span className="font-medium text-foreground">
                  ${Number(salary.transport_allowance).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-muted-foreground">Other Allowances</span>
                <span className="font-medium text-foreground">
                  ${Number(salary.other_allowances).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 bg-primary/5 px-4 rounded-lg">
                <span className="font-semibold text-foreground">Gross Monthly Salary</span>
                <span className="font-bold text-primary text-lg">
                  ${grossSalary.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payslips History */}
        <div className="form-section">
          <h3 className="font-semibold text-foreground mb-4">Payslip History</h3>
          {payrolls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td className="font-medium">
                        {format(new Date(payroll.month), 'MMMM yyyy')}
                      </td>
                      <td>${Number(payroll.basic_salary).toLocaleString()}</td>
                      <td className="text-success">
                        +${Number(payroll.allowances).toLocaleString()}
                      </td>
                      <td className="text-destructive">
                        -${Number(payroll.deductions).toLocaleString()}
                      </td>
                      <td className="font-semibold">
                        ${Number(payroll.net_salary).toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            payroll.status === 'paid' ? 'status-approved' : 'status-pending'
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                      <td>
                        <button className="text-primary hover:underline text-sm flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No payslips available yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
