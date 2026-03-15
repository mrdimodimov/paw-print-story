
ALTER TABLE public.generation_jobs
  ADD COLUMN IF NOT EXISTS prompt_context_hash text,
  ADD COLUMN IF NOT EXISTS narrative_context text;
