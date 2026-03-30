
CREATE TABLE public.tester_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  source text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tester_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active tester tokens"
  ON public.tester_access
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
