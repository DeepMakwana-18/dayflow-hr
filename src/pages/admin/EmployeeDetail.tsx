import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, User, Loader2 } from 'lucide-react';

interface Employee {
  id: string;
  employee_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  department: string | null;
  position: string | null;
  hire_date: string | null;
  profile_picture: string | null;
}

interface SalaryStructure {
  id?: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowances: number;
}

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salary, setSalary] = useState<SalaryStructure>({
    basic_salary: 0,
    housing_allowance: 0,
    transport_allowance: 0,
    other_allowances: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    if (!id) return;

    const { data: empData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (empData) {
      setEmployee(empData as Employee);

      // Fetch salary
      const { data: salData } = await supabase
        .from('salary_structure')
        .select('*')
        .eq('profile_id', id)
        .maybeSingle();

      if (salData) {
        setSalary(salData as SalaryStructure);
      }
    }
    setLoading(false);
  };

  const handleSaveEmployee = async () => {
    if (!employee) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone,
        address: employee.address,
        department: employee.department,
        position: employee.position,
        hire_date: employee.hire_date,
      })
      .eq('id', employee.id);

    if (error) {
      toast.error('Failed to update employee');
    } else {
      toast.success('Employee updated successfully');
    }
    setSaving(false);
  };

  const handleSaveSalary = async () => {
    if (!employee) return;
    setSaving(true);

    const salaryData = {
      profile_id: employee.id,
      basic_salary: salary.basic_salary,
      housing_allowance: salary.housing_allowance,
      transport_allowance: salary.transport_allowance,
      other_allowances: salary.other_allowances,
    };

    const { error } = await supabase
      .from('salary_structure')
      .upsert(salaryData, { onConflict: 'profile_id' });

    if (error) {
      toast.error('Failed to update salary');
    } else {
      toast.success('Salary updated successfully');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Employee not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/employees')}>
            Go back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/employees')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>

        {/* Employee Header */}
        <div className="form-section mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              {employee.profile_picture ? (
                <img
                  src={employee.profile_picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {employee.first_name && employee.last_name
                  ? `${employee.first_name} ${employee.last_name}`
                  : employee.email}
              </h1>
              <p className="text-muted-foreground">ID: {employee.employee_id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="form-section">
            <h3 className="font-semibold text-foreground mb-4">Personal Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <Label className="input-label">First Name</Label>
                  <Input
                    value={employee.first_name || ''}
                    onChange={(e) => setEmployee({ ...employee, first_name: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <Label className="input-label">Last Name</Label>
                  <Input
                    value={employee.last_name || ''}
                    onChange={(e) => setEmployee({ ...employee, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="input-group">
                <Label className="input-label">Phone</Label>
                <Input
                  value={employee.phone || ''}
                  onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
                />
              </div>
              <div className="input-group">
                <Label className="input-label">Address</Label>
                <Input
                  value={employee.address || ''}
                  onChange={(e) => setEmployee({ ...employee, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="form-section">
            <h3 className="font-semibold text-foreground mb-4">Job Details</h3>
            <div className="space-y-4">
              <div className="input-group">
                <Label className="input-label">Department</Label>
                <Input
                  value={employee.department || ''}
                  onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                />
              </div>
              <div className="input-group">
                <Label className="input-label">Position</Label>
                <Input
                  value={employee.position || ''}
                  onChange={(e) => setEmployee({ ...employee, position: e.target.value })}
                />
              </div>
              <div className="input-group">
                <Label className="input-label">Hire Date</Label>
                <Input
                  type="date"
                  value={employee.hire_date || ''}
                  onChange={(e) => setEmployee({ ...employee, hire_date: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveEmployee} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Employee Details
              </Button>
            </div>
          </div>

          {/* Salary Structure */}
          <div className="form-section lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Salary Structure</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="input-group">
                <Label className="input-label">Basic Salary ($)</Label>
                <Input
                  type="number"
                  value={salary.basic_salary}
                  onChange={(e) => setSalary({ ...salary, basic_salary: Number(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <Label className="input-label">Housing Allowance ($)</Label>
                <Input
                  type="number"
                  value={salary.housing_allowance}
                  onChange={(e) => setSalary({ ...salary, housing_allowance: Number(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <Label className="input-label">Transport Allowance ($)</Label>
                <Input
                  type="number"
                  value={salary.transport_allowance}
                  onChange={(e) => setSalary({ ...salary, transport_allowance: Number(e.target.value) })}
                />
              </div>
              <div className="input-group">
                <Label className="input-label">Other Allowances ($)</Label>
                <Input
                  type="number"
                  value={salary.other_allowances}
                  onChange={(e) => setSalary({ ...salary, other_allowances: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-semibold text-foreground text-lg">
                  ${(
                    Number(salary.basic_salary) +
                    Number(salary.housing_allowance) +
                    Number(salary.transport_allowance) +
                    Number(salary.other_allowances)
                  ).toLocaleString()}
                </span>
              </p>
              <Button onClick={handleSaveSalary} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Salary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
