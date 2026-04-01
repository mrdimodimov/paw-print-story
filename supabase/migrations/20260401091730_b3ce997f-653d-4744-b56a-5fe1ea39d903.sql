
-- Add tester_source column to tributes
ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS tester_source text;

-- Create analytics events table
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  event_name text NOT NULL,
  tester_source text,
  tribute_id text,
  metadata jsonb
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read analytics events"
  ON public.analytics_events FOR SELECT
  TO public
  USING (auth.role() = 'service_role'::text);

CREATE INDEX idx_analytics_events_tester_source ON public.analytics_events(tester_source);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_tributes_tester_source ON public.tributes(tester_source);
