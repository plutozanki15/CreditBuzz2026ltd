-- DROP ALL PAYMENT AND ADMIN RELATED TABLES AND POLICIES

-- First drop RLS policies on payments table
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

-- Drop RLS policies on admin_activity_log table
DROP POLICY IF EXISTS "Admins can create activity log" ON public.admin_activity_log;
DROP POLICY IF EXISTS "Admins can view activity log" ON public.admin_activity_log;

-- Drop RLS policies on notifications table
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notification read status" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

-- Drop RLS policies on user_roles table
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Drop admin-related RLS policies on profiles table
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop the payments table
DROP TABLE IF EXISTS public.payments CASCADE;

-- Drop the admin_activity_log table
DROP TABLE IF EXISTS public.admin_activity_log CASCADE;

-- Drop the notifications table
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Drop the user_roles table
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop the app_role enum
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Drop the has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Drop the credit_user_balance function
DROP FUNCTION IF EXISTS public.credit_user_balance(uuid, numeric);

-- Delete the receipts storage bucket
DELETE FROM storage.objects WHERE bucket_id = 'receipts';
DELETE FROM storage.buckets WHERE id = 'receipts';