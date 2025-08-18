-- Fix critical security vulnerability: restrict subscription record creation
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (
  (user_id = auth.uid()) AND 
  (email = auth.email())
);