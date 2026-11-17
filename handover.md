Rumbu Industries Website — Handover & Continuation Guide
This document explains how the Rumbu Industries Limited website is built and how
to continue working on it. Read this first before making changes.
---
1. What this site is
A showcase website for Rumbu Industries Limited (rumbuindustries.com), a
Nigerian manufacturer of polypropylene woven mats and twine ropes, based in
Kano since 2001. It replaced the old Wix site.
Live at: https://www.rumbuindustries.com
Also on Vercel: rumbu-website (project), auto-deploys from GitHub.
---
2. The tech stack (and what each part does)
Next.js 14 — the website framework (App Router; files live under `app/`).
React — the components (files under `components/`).
Vercel — hosting. It watches GitHub and rebuilds automatically on every commit.
Supabase — database. Currently stores contact-form submissions. Reserved
for a future admin/records area.
GitHub — the source of truth. Repo: `github.com/itadm1/rumbu-website`.
Workflow (no terminal needed): edit a file on GitHub → commit → Vercel
rebuilds in ~1 minute → change is live.
---
3. How the project is organised
```
app/
  layout.js            Wraps every page (header, footer, site chrome)
  page.js              HOME page (hero, carousel, about, products, services,
                       stats, clients, membership, news teaser, CTA)
  about/page.js        About + founder spotlight
  products/page.js     Products grid + catalogue download
  services/page.js     Other services
  team/page.js         Org chart (leadership)
  research/page.js     Research team
  careers/page.js      Job adverts
  exhibitions/page.js  Photo gallery with lightbox
  news/page.js         News list
  news/[slug]/page.js  Individual news article (auto-generated per post)
  contact/page.js      Contact form + Google map
  api/contact/route.js Server code that saves the contact form to Supabase
  globals.css          ALL styling for the whole site

components/
  Header.js            Top navigation menu
  Footer.js            Footer
  orgChart.js          Leadership org chart (NOTE: lowercase filename!)
  socialIcons.js       LinkedIn/Instagram/X/Facebook icons
  Carousel.js          Home hero-area carousel
  HeroMedia.js         Home hero video/image
  Reveal.js            Fade-in-on-scroll wrapper
  Counter.js           Animated number count-up
  SiteChrome.js        Scroll progress bar, WhatsApp button, back-to-top
  ExhibitionGallery.js Exhibition photos + lightbox
  Founder.js           Founder spotlight used on the About page
  PageFade.js          Page fade-in transition

lib/
  data.js              *** ALL CONTENT LIVES HERE *** (see section 4)
  supabaseClient.js    Supabase connection helper

public/                All images and the PDF catalogue
  team/  products/  services/  membership/  exhibitions/  news/
```
---
4. Where to change things — `lib/data.js` is the key file
Most edits are just text or image swaps, and almost all of them happen in
`lib/data.js`. Open it on GitHub and edit the relevant block:
Company phone/email/address/tagline → `company`
Homepage stat numbers → `stats`
Products → `products`
Other services → `services`
Leadership (names, roles, bios, social links) → `team`
Memberships → `memberships`
Homepage carousel slides → `carousel`
Named clients → `clientList`
Exhibitions → `exhibitions`
News posts → `news`
Job adverts → `careers`
Research fields → `research`
To add a NEWS post
Add an object to the top of the `news` array with a unique `slug`, `title`,
`date` (YYYY-MM-DD), `category` ('Press', 'Events', or 'Milestone'), `excerpt`,
and `body` (an array of paragraphs). The list, homepage teaser, and its own
article page all appear automatically.
To add a JOB advert
Add an object to the `careers` array with `id`, `title`, `location`, `type`,
`department`, `open: true`, `summary`, `responsibilities` (array),
`requirements` (array), and `applyLink`. To close a role, delete it or set
`open: false`.
To change the MENU
Edit `components/Header.js` — the list of `<Link>` lines is the menu.
To swap or add an IMAGE
Upload the image to the right folder under `public/` (GitHub: Add file →
Upload files).
In `lib/data.js`, set the item's image path to match, e.g.
`/team/suwaiba.jpg`. The leading `/` means "from the public folder".
---
5. Known gotchas (these caused real problems — read them)
`orgChart.js` is lowercase. The file is `components/orgChart.js` and the
team page imports it as `'../../components/orgChart'` (lowercase). Vercel runs
on Linux, which is case-sensitive, so `OrgChart` and `orgChart` are different
files. Keep the filename and the import spelled identically or the build fails
with "Module not found".
JSX/paste errors break the build. When pasting code, make sure nothing is
dropped — a missing `<a` tag once caused repeated "Failed to compile" errors.
If a build fails, read the log line starting with `./` — it names the exact
file and line.
Stale build cache. If a build fails oddly or a fix doesn't seem to apply,
redeploy with the cache OFF: Vercel → Deployments → the failed one → three-dot
menu → Redeploy → UNTICK "Use existing build cache".
Reading build errors: the useful part is always at the BOTTOM of the log,
after "Failed to compile." Use the log's search (Ctrl+F) for `./` or `Error`.
CSS changes not showing: hard-refresh the browser (Ctrl+Shift+R) or use an
incognito window — the old stylesheet is often cached.
---
6. Deploying / going live (recap)
Supabase: project already created; contact form saves to the
`contact_submissions` table. Keys are set in Vercel's environment variables
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`). The service_role key is secret — never commit it.
GitHub → Vercel: every commit to the `main` branch auto-deploys.
Domain: rumbuindustries.com points to Vercel via DNS.
---
7. Design system (house style)
Colours: navy `#14264d`, secondary navy `#1F3864`, blue `#2E75B6`,
gold accent `#C9A227`.
Font: Arial throughout.
All styling is in `app/globals.css`.
---
8. Still to do / outstanding
Upload real photos: `public/team/suwaiba.jpg` (ED3) and confirm
`public/team/hamza.jpg` (ED2). Until uploaded, those cards show initials.
Replace placeholder social links (`#`) in `lib/data.js` `team` block with real
LinkedIn/Instagram/X/Facebook URLs.
Add real exhibition photos to `public/exhibitions/` and set their `img` paths
in the `exhibitions` data (currently captioned placeholders).
Add real news cover images to `public/news/` (optional; placeholders show
otherwise).
Optional: add a hero video at `public/hero.mp4` (falls back to the factory
image if absent).
Optional: the menu has ~10 items and may look crowded on laptops — consider
grouping some under a dropdown.
---
9. How to continue this work with Claude
If you (or a colleague) want to keep building with Claude:
Create a Project in Claude.
Upload the project zip (the full website) and this HANDOVER.md as Project
knowledge.
In a new chat inside that Project, Claude will have the code and this guide as
context. Briefly restate what you want to change.
Note: a new Claude chat will know the code (from the files) but not the
history of how it was built — this document fills that gap.
