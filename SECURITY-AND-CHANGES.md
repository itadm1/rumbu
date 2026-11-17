# Rumbu website: security review, new front page and changes, 17 Nov 2026

This note lists what was found in the code review, what was changed, how it was
tested, and what still needs a person to do.

## 1. Do these 3 things first

The code fixes in this version only take full effect after these steps.

1. **Run the database script once.** In Supabase, open SQL Editor, New query,
   paste all of `supabase/security-hardening.sql`, and click Run. It is safe to
   run more than once.
2. **Turn off public sign-up.** In Supabase, open Authentication, then
   Sign In / Providers, and turn off "Allow new users to sign up". Staff
   accounts are still created by a super admin on the Users page.
3. **Check who can sign in.** The last part of the script lists every account
   and its role. Remove any email you do not recognise.

## 2. What was wrong (security)

| No. | Finding | Risk | Fixed by |
|---|---|---|---|
| 1 | Any new account became an `admin`. The `profiles.role` column defaulted to `admin`, and the code also treated an account with no profile row as `admin`. If public sign-up is on in Supabase (it is on by default), anyone on the internet could create an account and open the workspace. | Critical. Job applicants' personal data, contact messages, news and job adverts were exposed. | Code: `lib/supabaseServer.js`, `middleware.js`. Database: the script. |
| 2 | A signed-in person could change their own role. The "profiles self update" rule had no limit on which columns could be changed, so any account could make itself a `super_admin` from the browser. | Critical. | Database: the script removes that rule. |
| 3 | The workspace pages checked only that someone was signed in, not that they had a staff role. | High. | `middleware.js` now checks the role on every workspace page. |
| 4 | The news image upload accepted any file type and size, and took the file extension from the uploaded file name. | Medium. | `app/api/admin/upload/route.js`: JPG, PNG or WEBP only, 5MB at most. |
| 5 | The contact form endpoint accepted any data: no length limits, no email check, no spam trap. | Medium. | `app/api/contact/route.js`, `components/ContactForm.js`. |
| 6 | No security headers. | Low. | `next.config.mjs`. |
| 7 | Two internal notes were publicly readable on the website (`/README.txt` and `/showcase/ASSET-NOTES.md`). | Low. | Moved to `docs/`. |

Whether finding 1 was ever used by an outsider cannot be told from the code.
Step 3 above is how to check.

## 3. What was changed

**Access to the workspace**
- `lib/supabaseServer.js`: an account must have a profile row with the role
  `admin`, `hr` or `super_admin`. Anything else has no access.
- `middleware.js`: checks that role on every `/admin` page. An account without
  a staff role is sent to the login page with a clear message.
- `app/admin/login/page.js`: shows that message and ends the session.
- `supabase/security-hardening.sql` (new): new accounts start as `pending`
  with no access; nobody can edit a profile row from the browser; each person
  reads only their own profile row.
- `supabase/admin-schema.sql` and `ADMIN-SETUP.md`: updated to match, for any
  future fresh setup.

**Forms and uploads**
- `app/api/admin/upload/route.js`: checks type and size.
- `app/api/contact/route.js`: checks required fields, email format and
  lengths. A hidden field catches automated spam.
- `components/ContactForm.js`: carries the hidden field.

**Content**
- `app/page.js` and `components/CareersView.js`: the facilities are in Kano
  and Ogun States, not "Kano and Lagos". Agbara is in Ogun State.
- `components/Counter.js`: the 4 headline figures are now in the page itself.
  Before, the page was sent with every figure at 0 and relied on an animation,
  so search engines and link previews read "0 mil". The animation still runs.
  It also no longer shows a negative number for an instant.

**Search engines and link previews**
- `app/sitemap.js` and `app/robots.js` (new): a sitemap of every public page,
  product and news story; the workspace and form endpoints are kept out of
  search.
- `lib/site.js` (new) and `app/layout.js`: link previews and the sitemap now
  use the address the site is really served from. Before, they always pointed
  to www.rumbuindustries.com, which is still on Wix, so preview images were
  broken. No change is needed when the domain moves.
- `app/layout.js`: company name, address and phone in the format search
  engines read.

**Reliability**
- `app/layout.js` and `app/fonts/` (new): the 2 fonts are stored in the
  project. Before, every build downloaded them from Google and failed if
  Google could not be reached. The look is unchanged.
- `next.config.mjs`: security headers; the workspace is never cached.

## 3a. The new front page

The front page is now one screen, with no long scroll.

- **3 full-height picture panels:** woven mats, yarn thread and PET flakes.
  Pointing at a panel, or tapping it on a phone, opens it and shows one line
  of text and a button to that product's page.
- **A moving water-light effect** lies over the whole screen. It stays still
  for visitors who have set their device to reduce motion.
- **A short footer line** with the address, phone and 3 links. The long
  footer still appears on every other page.
- **Removed:** the old scrolling sections of the home page, and the 4 headline
  figures (8 mil, 30 mil, 2,873, 20+) on the home page and the Our story page.
- **Pictures:** the woven mats panel uses the existing product illustration.
  No photographs of yarn thread or PET flakes were supplied, so those 2 panels
  use drawn artwork until photographs are uploaded.

**Changing it without a developer.** In the workspace, open **Front page**.
A member of staff can change the headline, the line under it, and each
panel's name, description, button words, linked page and photograph. They can
add, remove and reorder panels (2 to 4). Saving publishes the change at once.

Files: `app/page.js`, `components/HomeStage.js`, `components/HomeArt.js`,
`app/home-stage.css`, `lib/homeContent.js`, `lib/home.js`,
`components/HomeEditor.js`, `app/admin/home/page.js`,
`app/api/admin/home/route.js`, `supabase/home-page.sql`. Small edits:
`components/SiteFrame.js`, `components/AdminSidebar.js`,
`components/AdminTopbar.js`, `app/about/page.js`, `app/layout.js`.

The front page content is saved in the `app_settings` table, which the
workspace Settings page already uses. If saving fails, run
`supabase/home-page.sql` once. The old home page banner code
(`components/ProductExperience.js`) is kept in the project but no longer used.

## 4. How it was tested

- Production build: passes. Linter: no warnings or errors.
- All 12 public page types opened in a browser at desktop (1440px) and phone
  (390px) sizes: no script errors, no failed requests, no sideways scrolling.
- Workspace access, tested against a stand-in database with 6 kinds of
  account. Not signed in, `pending`, no profile row, and an unknown role are
  all refused on pages and on the API. `admin`, `hr` and `super_admin` get in.
  Only `super_admin` reaches the Users API.
- Contact endpoint: empty, bad email, over-long and spam-trap requests are all
  handled correctly.
- The front page: fits one screen on a computer (1440 by 900) and on a phone
  (390 by 844), with no script errors.
- The front page editor, against the stand-in database: saving is refused when
  not signed in, refused with fewer than 2 panels, and a saved change shows on
  the front page straight away. Text typed as code is shown as plain text.

Not tested: anything that needs the real Supabase project (real sign-in, the
script itself, saving news, job applications). Test these after deploying.

## 5. What still needs a person

1. The 3 steps in section 1.
2. The news item "Rumbu Industries Group First Annual talent hunt" looks like
   a test entry. It is in the database, not in the code. Edit or delete it in
   the workspace.
3. Upload real photographs of yarn thread and PET flakes on the Front page
   screen, to replace the drawn artwork.
4. Pointing www.rumbuindustries.com to this site, from the Wix account.
5. The 3 hero illustrations in `public/showcase/` are 2.3 to 3.1 MB each as
   source files. Visitors get smaller optimised copies, so this is not urgent.

## 6. If every staff account is refused after deploying

The workspace now reads each person's role under the database rules. If the
live database is missing the rule that lets a person read their own profile
row, everyone is refused. Running `supabase/security-hardening.sql` creates
that rule and fixes it.
