ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS receipt_status text NOT NULL DEFAULT 'uploaded';

-- Backfill existing rows to a sensible state
UPDATE public.payments
SET receipt_status = CASE
  WHEN receipt_url IS NOT NULL THEN 'uploaded'
  WHEN status = 'pending' THEN 'uploading'
  ELSE 'failed'
END;