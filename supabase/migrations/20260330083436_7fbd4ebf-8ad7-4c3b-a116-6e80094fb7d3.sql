
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid,
  tester_token text,
  rating text,
  confusion_text text,
  positive_text text,
  missing_text text,
  time_to_complete_seconds integer,
  photos_uploaded integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read feedback"
  ON public.feedback
  FOR SELECT
  TO public
  USING (auth.role() = 'service_role'::text);
