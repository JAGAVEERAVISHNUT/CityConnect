-- Fix the security definer view issue by removing the problematic policy and view
-- Remove the problematic public policy and view
DROP POLICY IF EXISTS "Public can view limited issue information" ON public.issues;
DROP VIEW IF EXISTS public.public_issues;

-- The secure solution: Only allow access to users' own issues and staff
-- The existing policies we created are sufficient:
-- 1. "Users can view their own issues" - users see only their own issues
-- 2. "Staff can view all issues" - staff/admins see all issues for management

-- This ensures complete privacy protection:
-- - No public access to any issue data
-- - Users only see their own issues with full details
-- - Only authorized staff can see all issues for municipal management