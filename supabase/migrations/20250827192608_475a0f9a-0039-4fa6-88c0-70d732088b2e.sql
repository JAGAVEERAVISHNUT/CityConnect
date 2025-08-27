-- Fix security issues by setting proper search_path for functions

-- Update the handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
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

-- Update the update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the create_status_notification function with proper search_path
CREATE OR REPLACE FUNCTION public.create_status_notification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;