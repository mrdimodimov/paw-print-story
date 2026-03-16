CREATE TABLE public.tribute_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id text NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('candle', 'paw', 'heart')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tribute_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reactions"
  ON public.tribute_reactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read reactions"
  ON public.tribute_reactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_tribute_reactions_tribute_id ON public.tribute_reactions (tribute_id);