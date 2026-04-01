CREATE POLICY "Anyone can read analytics events for dashboard"
ON public.analytics_events
FOR SELECT
TO anon, authenticated
USING (true);