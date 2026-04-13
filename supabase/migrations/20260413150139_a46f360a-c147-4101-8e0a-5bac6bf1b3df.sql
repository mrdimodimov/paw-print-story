
ALTER TABLE public.public_tributes ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
ALTER TABLE public.tributes ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;
