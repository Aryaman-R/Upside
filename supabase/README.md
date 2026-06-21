# Upside — Supabase setup (Phase 1: auth + sync)

Cloud sync is **optional**. With no Supabase env vars, Upside runs exactly as
before — fully local and offline, no account. Configure Supabase to enable
accounts and multi-device state sync. See [`../docs/BACKEND.md`](../docs/BACKEND.md)
for the architecture and roadmap.

## 1. Create a project

1. Create a project at <https://supabase.com> (free tier is fine).
2. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## 2. Point the app at it

```bash
cp .env.example .env.local
# then edit .env.local:
#   VITE_SUPABASE_URL=https://<your-ref>.supabase.co
#   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

`.env.local` is gitignored — never commit real keys. The anon key is safe to
ship to the browser **because Row-Level Security** (below) is what actually
protects the data.

## 3. Apply the schema

Either paste [`migrations/0001_init.sql`](migrations/0001_init.sql) into the
Supabase **SQL Editor** and run it, or use the Supabase CLI:

```bash
# with the Supabase CLI installed and linked to your project:
supabase db push
```

This creates `public.app_state` (a per-user JSONB snapshot) with RLS policies
that isolate every row to its owner (`auth.uid()`).

## 4. Auth settings

The app uses **email + password** auth. In **Authentication → Providers**,
ensure *Email* is enabled. For frictionless local testing you may turn **off**
"Confirm email" (Authentication → Providers → Email); leave it **on** for
anything real.

## 5. Run

```bash
npm run dev
```

Open the app → **Settings → Account** to sign up / sign in. On first sign-in
your existing local progress is uploaded ("claim local progress"); after that,
changes sync to the cloud and follow you across devices.

> Security note: `app_state` holds sensitive reflection/mood data. RLS keeps it
> private per user. Before any real launch, also add an account-deletion flow
> and review retention — see `docs/BACKEND.md` §6.
