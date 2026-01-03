import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Employee {
  id: string;
  employee_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  position: string | null;
  hire_date: string | null;
  profile_picture: string | null;
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setEmployees(data as Employee[]);
    }
    setLoading(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.employee_id.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.first_name?.toLowerCase().includes(query) ||
      emp.last_name?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout requiredRole="admin">
      <div className="animate-fade-in">
        <div className="page-header flex items-start justify-between">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">Manage all employees in the system</p>
          </div>
        </div>

        {/* Search */}
        <div className="form-section mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="form-section">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {emp.profile_picture ? (
                              <img
                                src={emp.profile_picture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {emp.first_name && emp.last_name
                                ? `${emp.first_name} ${emp.last_name}`
                                : 'No name set'}
                            </p>
                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{emp.employee_id}</td>
                      <td>{emp.department || '-'}</td>
                      <td>{emp.position || '-'}</td>
                      <td>
                        {emp.hire_date
                          ? format(new Date(emp.hire_date), 'MMM d, yyyy')
                          : '-'}
                      </td>
                      <td>
                        <Link to={`/admin/employees/${emp.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No employees found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
