
CREATE TABLE public.public_tributes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL DEFAULT 'dog',
  breed TEXT,
  years_of_life TEXT,
  story TEXT NOT NULL,
  social_post TEXT,
  share_card_text TEXT,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  tier_id TEXT NOT NULL DEFAULT 'story',
  custom_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.public_tributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tributes are viewable by everyone"
  ON public.public_tributes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert public tributes"
  ON public.public_tributes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
