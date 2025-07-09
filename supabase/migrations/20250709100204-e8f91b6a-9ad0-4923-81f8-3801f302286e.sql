-- Update subscription tiers to simplified 2-tier system
-- Remove the complex trader/supplier/both tiers and use simple free/premium

-- Update the check constraint to allow the new tier values
ALTER TABLE public.subscribers 
DROP CONSTRAINT IF EXISTS subscribers_subscription_tier_check;

ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_subscription_tier_check 
CHECK (subscription_tier IN ('trial', 'free', 'premium'));

-- Update existing records to map to new tiers
-- trial stays as trial
-- trader, supplier, both all become premium (since they're paid tiers)
UPDATE public.subscribers 
SET subscription_tier = 'premium' 
WHERE subscription_tier IN ('trader', 'supplier', 'both');

-- Add comment to document the new tier system
COMMENT ON COLUMN public.subscribers.subscription_tier IS 'Subscription tier: trial (30-day full access), free (basic features), premium (full access for $1.99/month)';