-- Drop existing FK so we can handle orphans
ALTER TABLE public.public_tributes DROP CONSTRAINT IF EXISTS public_tributes_tribute_id_fkey;

-- Delete the 2 soft-deleted orphan rows that have no real tribute
DELETE FROM public.public_tributes WHERE tribute_id IS NULL;

-- Now enforce NOT NULL
ALTER TABLE public.public_tributes ALTER COLUMN tribute_id SET NOT NULL;

-- Re-add FK
ALTER TABLE public.public_tributes ADD CONSTRAINT public_tributes_tribute_id_fkey FOREIGN KEY (tribute_id) REFERENCES public.tributes(id);

-- Add unique constraint for 1:1 mapping
ALTER TABLE public.public_tributes ADD CONSTRAINT unique_tribute_id UNIQUE (tribute_id);