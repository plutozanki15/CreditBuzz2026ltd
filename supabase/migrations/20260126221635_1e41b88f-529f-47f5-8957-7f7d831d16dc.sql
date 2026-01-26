-- Add archived column to payments table for archive system
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Add index for faster filtering of non-archived payments
CREATE INDEX IF NOT EXISTS idx_payments_archived ON public.payments(archived);

-- Add RLS policy for admins to view all profiles (needed for user management)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to update any profile (for banning)
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));