ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS title text;