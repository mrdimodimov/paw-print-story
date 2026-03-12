
-- Create a public storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);

-- Allow anyone to upload files to pet-photos bucket (no auth required for this app)
CREATE POLICY "Anyone can upload pet photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pet-photos');

-- Allow anyone to read pet photos
CREATE POLICY "Anyone can view pet photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-photos');

-- Allow anyone to delete their uploaded pet photos
CREATE POLICY "Anyone can delete pet photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'pet-photos');
