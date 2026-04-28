# Keep-Alive & Uptime Monitoring

This document describes the operational setup that prevents the backend from
pausing due to inactivity. **No code changes are required to follow this
guide** — it is operational configuration only.

## Why external monitoring is required

The backend runs on a managed Supabase project. When a project receives **zero
traffic for an extended period (~7 days on free / paused tiers)**, Supabase
will **pause** it. A paused project:

- Disables all edge functions (HTTP 503)
- **Disables `pg_cron`** — meaning our internal keep-alive cron job (`keep-alive-health-check`)
  will *also* stop running once the project is paused. It cannot wake itself up.
- Suspends database connections

Therefore the internal `pg_cron` keep-alive is **not sufficient on its own**.
We need an *external* heartbeat that continues to hit the backend even if our
own infrastructure has gone quiet.

## Layered keep-alive strategy

| Layer | Mechanism | Frequency | Purpose |
|------|-----------|-----------|---------|
| 1 | Frontend session ping (Landing page) | Once per browser session | Warms function on real visits |
| 2 | Internal `pg_cron` job `keep-alive-health-check` | Every 48h (`0 0 */2 * *`) | Cheap baseline ping while project is active |
| 3 | **External uptime monitor** *(this document)* | Every 24h | Survives full project pause; wakes the backend |

## Target endpoint

```
GET https://<project-ref>.supabase.co/functions/v1/health-check
```

For this project:

```
GET https://ppfrtdbjsagytuhweywd.supabase.co/functions/v1/health-check
```

The function is configured with `verify_jwt = false`, so **no authentication
header is required**. Do not add an `Authorization` header — it is unnecessary
and will only create maintenance burden when keys rotate.

## Expected response

- **Status code:** `200`
- **Body (JSON):**
  ```json
  { "status": "alive" }
  ```

The monitor should treat the endpoint as healthy only when **both** conditions
are true.

## Recommended monitor configuration

Pick **one** of the following free-tier services:

- **UptimeRobot** — https://uptimerobot.com (free: 5-minute minimum interval, 50 monitors)
- **Better Stack** — https://betterstack.com/uptime (free: 3-minute interval, 10 monitors)
- **Cronitor** — https://cronitor.io (free: 5 monitors, flexible scheduling)
- **Hetrix Tools** — https://hetrixtools.com (free: 1-minute interval, 15 monitors)

### Settings

| Field | Value |
|------|-------|
| Monitor type | HTTP(S) / Keyword |
| Method | `GET` |
| URL | `https://ppfrtdbjsagytuhweywd.supabase.co/functions/v1/health-check` |
| Interval | **Every 24 hours** (or the closest allowed value — most free tiers default to 5 min, which is also fine) |
| Request timeout | **5–10 seconds** |
| Expected status code | `200` |
| Keyword / body match | `alive` (must be present in response body) |
| Follow redirects | Yes |
| Authentication | **None** |

### Alerting

Configure the monitor to alert when **either**:

1. Response status code is not `200`, **or**
2. Response body does **not** contain the string `alive`

Send alerts to the on-call email / Slack / Discord channel of your choice.
A single failed check is usually a transient cold start; trigger alerts only
after **2 consecutive failures** to reduce noise.

## Validation checklist

After setting up the external monitor:

- [ ] Manually run `curl https://ppfrtdbjsagytuhweywd.supabase.co/functions/v1/health-check`
      and confirm it returns `{"status":"alive"}` with HTTP 200.
- [ ] In the monitor dashboard, trigger a test check and confirm it reports healthy.
- [ ] Temporarily change the keyword to something that will not match (e.g. `xxxxx`)
      and confirm the alert fires, then restore it to `alive`.
- [ ] Document the monitor URL and credentials in the team password manager.

## Outcome

With all three layers in place, the project remains active even with zero
real user traffic. The external monitor is the only layer that can recover
the project from a fully-paused state, so it must **never** be disabled.
