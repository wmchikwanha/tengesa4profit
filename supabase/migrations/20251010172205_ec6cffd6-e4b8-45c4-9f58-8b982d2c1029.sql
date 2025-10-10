-- Tighten RLS on subscribers: remove email-based access and require user_id match only
-- Ensure RLS is enabled
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Replace SELECT policy
DROP POLICY IF EXISTS select_own_subscription ON public.subscribers;
CREATE POLICY select_own_subscription
ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Replace UPDATE policy
DROP POLICY IF EXISTS update_own_subscription ON public.subscribers;
CREATE POLICY update_own_subscription
ON public.subscribers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());