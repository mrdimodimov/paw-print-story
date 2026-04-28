CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any old keep-alive job if present
DO $$
BEGIN
  PERFORM cron.unschedule('keep-alive-health-check');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;