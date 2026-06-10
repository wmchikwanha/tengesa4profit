CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_id uuid,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can read business events"
  ON public.analytics_events FOR SELECT
  USING (is_business_owner(auth.uid(), business_id) OR user_id = auth.uid());

CREATE INDEX idx_analytics_events_name_created ON public.analytics_events (event_name, created_at);
CREATE INDEX idx_analytics_events_user ON public.analytics_events (user_id, created_at);