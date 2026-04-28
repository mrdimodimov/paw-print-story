-- Race-safe idempotency for confirmation emails: enforce one row per tribute_id
-- across all non-failed states (pending, sent, dlq, etc.). Failed sends are excluded
-- so a genuine retry can re-acquire the slot after cleanup.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_confirmation_unique
ON public.email_send_log ((metadata->>'tribute_id'))
WHERE template_name = 'confirmation' AND status <> 'failed';