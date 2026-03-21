ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS short_caption text;
ALTER TABLE public.generation_jobs ADD COLUMN IF NOT EXISTS short_caption text;