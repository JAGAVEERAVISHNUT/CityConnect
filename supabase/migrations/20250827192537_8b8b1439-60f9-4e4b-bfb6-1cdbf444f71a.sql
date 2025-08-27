-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('citizen', 'staff', 'admin', 'field_worker');

-- Create issue status enum
CREATE TYPE public.issue_status AS ENUM ('submitted', 'acknowledged', 'assigned', 'in_progress', 'on_hold', 'resolved');

-- Create issue categories enum
CREATE TYPE public.issue_category AS ENUM ('pothole', 'water_leak', 'broken_streetlight', 'graffiti', 'illegal_dumping', 'traffic_signal', 'noise_complaint', 'tree_maintenance');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'citizen',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category issue_category NOT NULL,
  status issue_status NOT NULL DEFAULT 'submitted',
  priority INTEGER DEFAULT 1,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  photos TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create issue updates table for tracking status changes
CREATE TABLE public.issue_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_status issue_status,
  new_status issue_status NOT NULL,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'status_update',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for issues
CREATE POLICY "Citizens can view all public issues" 
ON public.issues 
FOR SELECT 
USING (TRUE);

CREATE POLICY "Users can create their own issues" 
ON public.issues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issues" 
ON public.issues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Staff can update assigned issues" 
ON public.issues 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'field_worker')
);

-- RLS Policies for issue_updates
CREATE POLICY "Users can view updates for issues they created or are assigned to" 
ON public.issue_updates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.issues 
    WHERE issues.id = issue_updates.issue_id 
    AND (issues.user_id = auth.uid() OR issues.assigned_to = auth.uid())
  ) OR
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Staff can create issue updates" 
ON public.issue_updates 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'staff') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'field_worker')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (TRUE);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-photos', 'issue-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-videos', 'issue-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for issue photos
CREATE POLICY "Anyone can view issue photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'issue-photos');

CREATE POLICY "Authenticated users can upload issue photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'issue-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own issue photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'issue-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for issue videos
CREATE POLICY "Anyone can view issue videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'issue-videos');

CREATE POLICY "Authenticated users can upload issue videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'issue-videos' AND auth.role() = 'authenticated');

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notifications on status updates
CREATE OR REPLACE FUNCTION public.create_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the issue reporter
  INSERT INTO public.notifications (user_id, issue_id, title, message, type)
  SELECT 
    i.user_id,
    NEW.issue_id,
    'Issue Status Updated',
    'Your issue "' || i.title || '" status changed to ' || NEW.new_status,
    'status_update'
  FROM public.issues i
  WHERE i.id = NEW.issue_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notifications on status updates
CREATE TRIGGER on_issue_status_update
  AFTER INSERT ON public.issue_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.create_status_notification();

-- Enable realtime for issues and notifications
ALTER TABLE public.issues REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.issue_updates REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issue_updates;