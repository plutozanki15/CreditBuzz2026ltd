-- Add next_claim_time column for server-side claim timer persistence
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS next_claim_time TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.next_claim_time IS 'Timestamp when user can claim again (7-hour cooldown)';