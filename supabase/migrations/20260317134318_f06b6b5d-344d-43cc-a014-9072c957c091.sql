
-- Track nurture email sequence per tribute_email entry
CREATE TABLE public.tribute_email_sequence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_email_id uuid NOT NULL REFERENCES public.tribute_emails(id) ON DELETE CASCADE,
  email text NOT NULL,
  tribute_id uuid REFERENCES public.tributes(id) ON DELETE SET NULL,
  pet_name text NOT NULL DEFAULT '',
  email_number smallint NOT NULL CHECK (email_number BETWEEN 1 AND 3),
  sent_at timestamptz,
  stopped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tribute_email_id, email_number)
);

ALTER TABLE public.tribute_email_sequence ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "Service role can manage email sequence"
  ON public.tribute_email_sequence
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Allow anon/authenticated to insert (triggered from client after email capture)
CREATE POLICY "Anyone can insert email sequence"
  ON public.tribute_email_sequence
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
