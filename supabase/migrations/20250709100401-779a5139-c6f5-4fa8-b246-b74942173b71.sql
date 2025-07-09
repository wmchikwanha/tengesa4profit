-- First, let's see what tier values currently exist
-- and update them to the new system before changing constraints

-- Update existing records to map to new tiers
-- trader, supplier, both all become premium (since they're paid tiers)
UPDATE public.subscribers 
SET subscription_tier = 'premium' 
WHERE subscription_tier IN ('trader', 'supplier', 'both');

-- Now update the check constraint to allow the new tier values
ALTER TABLE public.subscribers 
DROP CONSTRAINT IF EXISTS subscribers_subscription_tier_check;

ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_subscription_tier_check 
CHECK (subscription_tier IN ('trial', 'free', 'premium'));

-- Add comment to document the new tier system
COMMENT ON COLUMN public.subscribers.subscription_tier IS 'Subscription tier: trial (30-day full access), free (basic features), premium (full access for $1.99/month)';