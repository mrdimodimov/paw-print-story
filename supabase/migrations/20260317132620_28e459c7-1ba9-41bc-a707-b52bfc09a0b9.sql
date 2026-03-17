CREATE TABLE public.tribute_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  tribute_id uuid REFERENCES public.tributes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tribute_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tribute emails"
  ON public.tribute_emails FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read tribute emails"
  ON public.tribute_emails FOR SELECT
  TO anon, authenticated
  USING (true);