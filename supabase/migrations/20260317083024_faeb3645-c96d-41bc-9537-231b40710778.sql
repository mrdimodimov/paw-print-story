CREATE POLICY "Anyone can update slug on public tributes"
ON public.public_tributes
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);