-- Add zfc_code column to profiles table to store the purchased withdrawal activation code
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zfc_code TEXT DEFAULT NULL;

-- Add zfc_code_purchased_at to track when the code was purchased
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zfc_code_purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;