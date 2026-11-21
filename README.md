# AYCF Logistics

Group-leader site for AYCF: live announcements, a resource hub, a status
tracker, and a status changer — all gated by a shared site key, with a
per-group key required to update that group's status, and an admin panel
for managing everything else.

## 1. Supabase setup (one-time)

1. In your Supabase project, go to **SQL Editor -> New query**, paste the
   entire contents of `supabase/schema.sql`, and run it. This creates the
   tables with no data in them yet.
2. In Supabase, go to **Settings -> API** and copy:
   - **Project URL**
   - **anon public** key (not used by this app, but good to have)
   - **service_role** key — this one is sensitive, treat it like a password

## 2. Local environment

1. Copy `.env.local.example` to `.env.local`.
2. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — your service_role key
   - `SESSION_SECRET` — any long random string you make up (used to sign
     login sessions; losing it just logs everyone out, it's not a disaster)
3. Install dependencies: `npm install`

## 3. Set the first site key and admin key

Run this once, from the project folder:

```
npm run set-initial-keys -- <site-key> <admin-key>
```

Example:

```
npm run set-initial-keys -- 243571 hci-aycf-2027
```

- `<site-key>` is what every group leader types to get into the site.
- `<admin-key>` is what only you type to unlock the Admin tab.
- Both can be changed later from the Admin tab itself — you never need to
  run this script again after the first time.

## 4. Run it locally to check it works

```
npm run dev
```

Visit http://localhost:3000 — it should redirect you to `/login`. Log in
with the site key you just set, then go to `/admin` and unlock it with
your admin key. From there, add your groups (each one gets a 6-digit key
shown to you ONCE — copy it down and give it to that group's leader).

## 5. Push to GitHub

```
git init
git add .
git commit -m "Initial AYCF logistics site"
git branch -M main
git remote add origin <your-empty-repo-url>
git push -u origin main
```

(`.env.local` is in `.gitignore` already — your keys never get committed.)

## 6. Deploy on Vercel

1. In Vercel, "Add New Project" and import this GitHub repo.
2. Before deploying, add the same three environment variables from step 2
   (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`)
   under **Settings -> Environment Variables**.
3. Deploy. Every future `git push` to `main` auto-redeploys.

## Day-to-day use (after setup)

Everything below happens on the live website — you never need to touch
Supabase or Vercel again for normal operation:

- **Admin tab**: rotate the site key or your own admin key, add/remove
  groups (each new group gets a fresh 6-digit key shown once), manually
  override any group's status, post or delete announcements, pin one as
  the "Happening Now" banner, and manage Resource Hub links.
- **Group leaders**: log in with the site key, use the Update tab with
  their own group's 6-digit key to change their status, and check the
  Tracker, Announcements, and Resources tabs as needed.

## Notes on how the keys work

- The **site key** is one shared password that gets anyone into the site
  at all.
- The **admin key** is a second, separate password that unlocks the Admin
  tab specifically — knowing the site key alone does not unlock Admin.
- Each **group's 6-digit key** only lets someone update *that* group's
  status. It must be entered fresh every time a status is submitted — it
  is not remembered by the browser, so one group leader can never
  accidentally (or otherwise) change another group's status.
- No plaintext key is ever stored in the database — only salted hashes.
  The plain key is shown to you once, right after you create or rotate it,
  and never again.
