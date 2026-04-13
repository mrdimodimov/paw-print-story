ALTER TABLE public.public_tributes
  ADD COLUMN IF NOT EXISTS tribute_id uuid;

ALTER TABLE public.public_tributes
  ADD CONSTRAINT public_tributes_tribute_id_key UNIQUE (tribute_id);

ALTER TABLE public.public_tributes
  ADD CONSTRAINT public_tributes_tribute_id_fkey
  FOREIGN KEY (tribute_id) REFERENCES public.tributes(id) ON DELETE CASCADE;