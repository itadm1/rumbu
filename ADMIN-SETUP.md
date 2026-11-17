# Rumbu Admin Panel — Setup Guide

Follow these steps once to activate the admin panel. Do them in order.

## Step 1 — Create the database tables

1. In Supabase, open **SQL Editor → New query**.
2. Open the file `supabase/admin-schema.sql` from the project, copy ALL of it,
   paste into the query editor, and click **Run**.
3. You should see "Success". This creates the tables for profiles (admin users),
   news posts, jobs, applications, and a storage bucket for news images.

## Step 2 — Create your first admin (super admin)

The panel needs one super admin to start. Create it directly in Supabase:

1. In Supabase, go to **Authentication → Users → Add user → Create new user**.
2. Enter your email and a password. Tick **Auto Confirm User** (important, so you
   can log in immediately).
3. Click Create user.

That creates your login and, via the database trigger, a matching profile row.
A new profile has the role `pending`, which gives no access. Make yourself the
super admin:

4. Go to **Table Editor → profiles**. Find your row.
5. Change the `role` value from `pending` to `super_admin`. Save.

Then turn off public sign-up, so that nobody can create an account by
themselves: **Authentication → Sign In / Providers → Allow new users to sign
up → off**. Staff accounts are created on the Users page, which keeps working.

Now you can log in and manage everyone else from inside the panel.

## Step 3 — Confirm environment variables (already set)

The panel uses the same three Vercel environment variables the contact form
uses: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`. These are already configured. No change needed.

## Step 4 — Deploy and log in

1. Commit all the new files to GitHub (see the file list in HANDOVER, or upload
   the whole updated project).
2. Once Vercel finishes deploying, go to **https://www.rumbuindustries.com/admin**
3. You'll be redirected to the login page. Sign in with the email and password
   from Step 2.

## What you can do in the panel

- **Dashboard**: counts of messages, applications, open jobs, news posts, plus
  recent activity.
- **News**: create, edit, delete posts. Upload a cover image and paste a YouTube
  link. Posts appear on the public /news page automatically.
- **Job Adverts**: create, edit, delete adverts. See the applicant count per
  advert. Open adverts appear on the public /careers page.
- **Applications**: every application submitted through the site, with the role
  applied for and contact details.
- **Messages**: every contact-form submission.
- **Users** (super admin only): create new admins, promote/demote super admins,
  delete users.

## Adding more admins

As a super admin: go to **Users → New user**, enter their name, email, a
temporary password, and choose their role. Share the password with them; they
log in at /admin/login. You can change anyone's role or remove them anytime.

## Security notes

- Only signed-in accounts with a staff role (`admin`, `hr` or `super_admin`) can
  reach /admin. A signed-in account with no role is sent back to the login page.
- A new account has the role `pending` and no access until a super admin gives
  it a role.
- If the site was set up before 17 Nov 2026, run `supabase/security-hardening.sql`
  once. See `SECURITY-AND-CHANGES.md`.
- Only super admins can see or use the Users page.
- The service_role key stays server-side only; it is never sent to the browser.
- Applications and messages are private: the public site cannot read them; only
  the admin panel can, through the secure server routes.

## Troubleshooting

- **Can't log in**: make sure you ticked "Auto Confirm User" when creating the
  account. If not, go to Authentication → Users and confirm the user.
- **"Unauthorized" when saving**: your login session expired; sign in again.
- **Images won't upload**: confirm Step 1 ran fully (it creates the `news`
  storage bucket).
