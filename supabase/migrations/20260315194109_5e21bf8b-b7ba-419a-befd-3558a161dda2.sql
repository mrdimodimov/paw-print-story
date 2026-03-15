
-- Create tributes table for persisting generated tributes
CREATE TABLE public.tributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  pet_name text NOT NULL,
  pet_type text NOT NULL DEFAULT 'dog',
  breed text,
  years_of_life text,
  owner_name text,
  tier_name text NOT NULL,
  tribute_story text NOT NULL,
  social_post text,
  share_card_text text,
  photo_urls text[] NOT NULL DEFAULT '{}'::text[],
  form_data jsonb
);

-- Enable RLS
ALTER TABLE public.tributes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (no auth required since app has no auth)
CREATE POLICY "Anyone can insert tributes"
  ON public.tributes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read tributes by ID
CREATE POLICY "Anyone can read tributes"
  ON public.tributes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Storage: Add RLS policies for pet-photos bucket
-- Allow anyone to upload (since no auth)
CREATE POLICY "Allow public uploads to pet-photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'pet-photos');

-- Allow public reads
CREATE POLICY "Allow public reads of pet-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pet-photos');
