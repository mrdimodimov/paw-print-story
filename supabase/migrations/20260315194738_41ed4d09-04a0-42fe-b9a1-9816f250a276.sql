
CREATE TABLE public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  pet_name text NOT NULL,
  owner_name text,
  tier_name text NOT NULL,
  tribute_story text,
  social_post text,
  share_card_text text,
  error_message text,
  form_data jsonb,
  photo_urls text[] NOT NULL DEFAULT '{}'::text[]
);

ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert generation jobs"
  ON public.generation_jobs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read generation jobs"
  ON public.generation_jobs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update generation jobs"
  ON public.generation_jobs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
