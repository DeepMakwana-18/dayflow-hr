-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- Create leave status enum
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create leave type enum
CREATE TYPE public.leave_type AS ENUM ('paid', 'sick', 'unpaid');

-- Create attendance status enum
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'half_day', 'leave');

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employee_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  department TEXT,
  position TEXT,
  hire_date DATE,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  UNIQUE (user_id, role)
);

-- Create salary structure table
CREATE TABLE public.salary_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  basic_salary DECIMAL(12, 2) DEFAULT 0,
  housing_allowance DECIMAL(12, 2) DEFAULT 0,
  transport_allowance DECIMAL(12, 2) DEFAULT 0,
  other_allowances DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status attendance_status DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (profile_id, date)
);

-- Create leave requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  remarks TEXT,
  status leave_status DEFAULT 'pending',
  admin_comments TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  basic_salary DECIMAL(12, 2) DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (profile_id, month)
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  document_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user's profile id
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile limited fields" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own role on signup" ON public.user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Salary structure policies
CREATE POLICY "Users can view own salary" ON public.salary_structure
  FOR SELECT USING (
    profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin can manage salary" ON public.salary_structure
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Attendance policies
CREATE POLICY "Users can view own attendance" ON public.attendance
  FOR SELECT USING (
    profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can insert own attendance" ON public.attendance
  FOR INSERT WITH CHECK (profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage attendance" ON public.attendance
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Leave requests policies
CREATE POLICY "Users can view own leave requests" ON public.leave_requests
  FOR SELECT USING (
    profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (profile_id = public.get_current_profile_id());

CREATE POLICY "Users can update own pending requests" ON public.leave_requests
  FOR UPDATE USING (
    (profile_id = public.get_current_profile_id() AND status = 'pending') 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Payroll policies
CREATE POLICY "Users can view own payroll" ON public.payroll
  FOR SELECT USING (
    profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin can manage payroll" ON public.payroll
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (
    profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can upload own documents" ON public.documents
  FOR INSERT WITH CHECK (profile_id = public.get_current_profile_id() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage documents" ON public.documents
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_structure_updated_at
  BEFORE UPDATE ON public.salary_structure
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();