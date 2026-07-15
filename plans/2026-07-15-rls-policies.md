# RLS Policies for Supabase

## Goal

Enable Row Level Security on all 11 public tables and create per-user policies so that the Supabase anon key (exposed in the browser) cannot access other users' data via the Supabase REST API.

## Risk

Anyone can extract the anon key from the browser's JS bundle and call `https://pqvheypxqjufdspkvzpk.supabase.co/rest/v1/<table>` to read/write **any user's data**, because RLS is currently disabled on every table (Drizzle snapshot confirms `isRLSEnabled: false`).

## Files

| File | Action |
| ---- | ------ |
| `drizzle/0002_rls_policies.sql` | Create — manual SQL migration with `ALTER TABLE … ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` statements for all 11 tables |
| `scripts/start.mjs` | Modify — run `0002_rls_policies.sql` during startup (optional; see open questions) |

## Implementation order

1. Write `drizzle/0002_rls_policies.sql` with:
   - `ALTER TABLE … ENABLE ROW LEVEL SECURITY` for each table
   - `CREATE POLICY "Users can view own …" FOR SELECT USING (auth.uid() = user_id)`
   - `CREATE POLICY "Users can create own …" FOR INSERT WITH CHECK (auth.uid() = user_id)`
   - `CREATE POLICY "Users can update own …" FOR UPDATE USING (auth.uid() = user_id)`
   - `CREATE POLICY "Users can delete own …" FOR DELETE USING (auth.uid() = user_id)`
   - Special case: `cycle_meta` uses `user_id` as its PK — same policy pattern applies
   - Special case: `users` table — allow authenticated users to SELECT their own row (INSERT/UPDATE handled by server-side trigger and sync route)
2. User runs `drizzle/0002_rls_policies.sql` in Supabase SQL Editor
3. Verify: attempt direct REST API calls with the anon key to confirm 403 on other users' data

## Key decisions

- **Policies per table, not per operation type**: Using `FOR ALL` (equivalent to separate SELECT/INSERT/UPDATE/DELETE policies) where possible to reduce verbosity. Actually, Supabase recommends separate policies per operation for clarity — I'll use `FOR ALL` for simplicity since the check is identical for all operations.
- **RLS does not affect Drizzle direct connection**: The server-side sync routes use `postgres` driver with `DATABASE_URL` (direct Postgres connection). RLS only applies to queries through Supabase's API layer (REST, GraphQL, etc.), so the sync API continues working unchanged.
- **No code changes needed**: All data operations in the app go through the server-side API routes (Drizzle), not the Supabase REST API. The browser-side Supabase client (`supabase-browser.ts`) is only used for `supabase.auth` calls (sign in, sign up, session), not for data queries. So no source code changes are required — this is purely a database-side configuration fix.

## Verification

1. `npm run build` — confirm no TypeScript/build errors
2. Open browser DevTools, extract the anon key from the JS bundle
3. Run `curl -H "apikey: <anon-key>" https://<project>.supabase.co/rest/v1/habits` — should get an empty array or only own data, not all users' data
4. Confirm sync save/load still works end-to-end in the app

## Future considerations

- If the app ever uses Supabase's JS client for data queries (e.g., real-time subscriptions), RLS policies become critical for those paths too
- The `0001_supabase_trigger.sql` trigger function uses `SECURITY DEFINER` — correct, it needs to bypass RLS to insert into `public.users` on signup
- Consider adding a `service_role` key to `.env` for the server client instead of the anon key, for defense-in-depth (the server can use the service role key which bypasses RLS entirely)
- The `SUPABASE_ANON_KEY` on the server (`supabase-server.ts`) is used only for `supabase.auth.getUser()` which works fine with the anon key — no change needed there
