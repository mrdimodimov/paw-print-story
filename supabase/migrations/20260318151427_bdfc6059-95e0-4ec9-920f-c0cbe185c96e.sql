ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;
ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS stripe_session_id text;
CREATE POLICY "Service role can update tributes" ON public.tributes FOR UPDATE TO public USING (auth.role() = 'service_role'::text) WITH CHECK (auth.role() = 'service_role'::text);