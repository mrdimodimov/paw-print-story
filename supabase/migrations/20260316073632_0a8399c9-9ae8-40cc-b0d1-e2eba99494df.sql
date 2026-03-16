CREATE TABLE public.tribute_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id uuid NOT NULL REFERENCES public.tributes(id) ON DELETE CASCADE,
  visitor_name text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tribute_memories_tribute_id ON public.tribute_memories(tribute_id);

ALTER TABLE public.tribute_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tribute memories"
  ON public.tribute_memories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert tribute memories"
  ON public.tribute_memories FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(message) >= 5
    AND char_length(message) <= 300
  );