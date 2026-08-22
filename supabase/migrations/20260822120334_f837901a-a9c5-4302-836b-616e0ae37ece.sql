ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS entry_currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS entry_rate numeric NOT NULL DEFAULT 1;