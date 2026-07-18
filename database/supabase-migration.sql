-- HMorix Platform - Supabase Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- This creates all tables in your Supabase PostgreSQL database

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'editor', 'developer', 'employee', 'hr', 'manager')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'business', 'enterprise')),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, company)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'company'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CRM TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('active', 'inactive', 'lead', 'customer', 'churned')),
  source TEXT,
  tags JSONB DEFAULT '[]',
  notes TEXT,
  last_contacted TIMESTAMPTZ,
  total_deal_value DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_contacts_email ON public.crm_contacts(email);
CREATE INDEX idx_crm_contacts_company ON public.crm_contacts(company);
CREATE INDEX idx_crm_contacts_status ON public.crm_contacts(status);

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualification', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INT DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX idx_crm_deals_owner ON public.crm_deals(owner_id);

CREATE TABLE IF NOT EXISTS public.crm_activities (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  deal_id BIGINT REFERENCES public.crm_deals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task')),
  subject TEXT,
  description TEXT,
  duration INT,
  outcome TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crm_activities_contact ON public.crm_activities(contact_id);
CREATE INDEX idx_crm_activities_type ON public.crm_activities(type);

-- ============================================
-- HRM TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.hrm_departments (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  budget DECIMAL(15, 2) DEFAULT 0,
  headcount INT DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrm_employees (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  department_id BIGINT REFERENCES public.hrm_departments(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  manager_id BIGINT REFERENCES public.hrm_employees(id) ON DELETE SET NULL,
  location TEXT,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('active', 'on_leave', 'onboarding', 'terminated', 'resigned')),
  start_date DATE NOT NULL,
  end_date DATE,
  salary DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hrm_employees_department ON public.hrm_employees(department_id);
CREATE INDEX idx_hrm_employees_status ON public.hrm_employees(status);

CREATE TABLE IF NOT EXISTS public.hrm_attendance (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  total_hours DECIMAL(4, 2),
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave', 'holiday')),
  notes TEXT,
  UNIQUE(employee_id, date)
);

CREATE INDEX idx_hrm_attendance_date ON public.hrm_attendance(date);

CREATE TABLE IF NOT EXISTS public.hrm_leave_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('annual', 'sick', 'personal', 'parental', 'bereavement', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days DECIMAL(3, 1) NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by BIGINT REFERENCES public.hrm_employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hrm_leave_status ON public.hrm_leave_requests(status);

CREATE TABLE IF NOT EXISTS public.hrm_payroll (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  base_salary DECIMAL(12, 2) NOT NULL,
  bonus DECIMAL(12, 2) DEFAULT 0,
  overtime DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  tax DECIMAL(12, 2) DEFAULT 0,
  benefits DECIMAL(12, 2) DEFAULT 0,
  net_pay DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hrm_payroll_period ON public.hrm_payroll(period_start, period_end);

CREATE TABLE IF NOT EXISTS public.hrm_performance_reviews (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES public.hrm_employees(id) ON DELETE CASCADE,
  reviewer_id BIGINT REFERENCES public.hrm_employees(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'quarterly' CHECK (type IN ('quarterly', 'annual', 'probation', 'ad_hoc')),
  period TEXT,
  overall_score DECIMAL(3, 2),
  skills JSONB,
  goals JSONB,
  strengths TEXT,
  improvements TEXT,
  comments TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrm_recruitment (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department_id BIGINT REFERENCES public.hrm_departments(id) ON DELETE SET NULL,
  location TEXT,
  employment_type TEXT DEFAULT 'full_time',
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  description TEXT,
  requirements JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'filled')),
  applicants_count INT DEFAULT 0,
  posted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANALYTICS TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_page_views (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  os TEXT,
  duration INT DEFAULT 0,
  is_bounce BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_pv_session ON public.analytics_page_views(session_id);
CREATE INDEX idx_analytics_pv_visitor ON public.analytics_page_views(visitor_id);
CREATE INDEX idx_analytics_pv_created ON public.analytics_page_views(created_at);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_label TEXT,
  event_value DECIMAL(15, 2),
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);

CREATE TABLE IF NOT EXISTS public.analytics_conversions (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('signup', 'demo_request', 'contact_form', 'purchase', 'trial_start')),
  source TEXT,
  medium TEXT,
  campaign TEXT,
  value DECIMAL(15, 2) DEFAULT 0,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS & SUPPORT
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact_id BIGINT REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  progress INT DEFAULT 0,
  description TEXT,
  budget DECIMAL(15, 2),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  category TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sla_deadline TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_id BIGINT REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  items JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS & ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read_at);

CREATE TABLE IF NOT EXISTS public.activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id BIGINT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_created ON public.activity_log(created_at);

-- ============================================
-- BLOG
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT,
  tags JSONB DEFAULT '[]',
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  read_time INT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_status ON public.blog_posts(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- User profiles: users can read all, update own
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- CRM: authenticated users can access
CREATE POLICY "Authenticated users can manage contacts" ON public.crm_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage deals" ON public.crm_deals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage activities" ON public.crm_activities FOR ALL USING (auth.role() = 'authenticated');

-- HRM: authenticated users can read, admins can write
CREATE POLICY "Authenticated users can view employees" ON public.hrm_employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view departments" ON public.hrm_departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can view own attendance" ON public.hrm_attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can view own leave" ON public.hrm_leave_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can view own payroll" ON public.hrm_payroll FOR SELECT USING (auth.role() = 'authenticated');

-- Support: users can see own tickets
CREATE POLICY "Users can manage own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Notifications: users see own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Blog: public read, authenticated write
CREATE POLICY "Anyone can read published posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create posts" ON public.blog_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update own posts" ON public.blog_posts FOR UPDATE USING (auth.uid() = author_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in Supabase Dashboard > Storage

-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies
-- CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
-- CREATE POLICY "Public assets are accessible" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
