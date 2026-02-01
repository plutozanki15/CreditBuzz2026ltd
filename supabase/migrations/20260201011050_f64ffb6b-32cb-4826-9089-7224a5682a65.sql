-- Create claims table to store user-specific claims
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success'
);

-- Enable RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Users can only view their own claims
CREATE POLICY "Users can view own claims"
ON public.claims
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own claims
CREATE POLICY "Users can insert own claims"
ON public.claims
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
ON public.claims
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add activation_code column to profiles for storing dynamic codes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS activation_code TEXT;