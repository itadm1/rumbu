# Rumbu Industries Limited Website

Showcase website for Rumbu Industries Limited, rebuilt from the live Wix site
(rumbuindustries.com) using Next.js, deployed on Vercel, with Supabase backing
the contact form and a future admin/records area. this is new version

## Structure

```
app/
  layout.js            Shared header + footer
  page.js              Home (hero, about, carousel, products, services, stats, clients, membership)
  about/page.js        Full company story + founder spotlight
  products/page.js     6 products
  services/page.js     PP woven sacks + renewable energy
  team/page.js         Founder spotlight + directors grid with modal
  contact/page.js      Contact form (saves to Supabase) + head office info
  api/contact/route.js Server route that saves enquiries to Supabase
  globals.css          Full design system (navy/blue/gold, Arial, animations)
components/
  Header.js   Footer.js   Carousel.js   Reveal.js
  Founder.js  Team.js     PageFade.js
lib/
  data.js              ALL site content lives here, edit this to update text
  supabaseClient.js
public/
  team/  products/  services/  membership/   (all images, already included)
supabase/
  schema.sql
```

## Editing content

Almost everything (company info, about paragraphs, products, services, team,
memberships, carousel slides) lives in `lib/data.js`. Edit that one file on
GitHub to change text or swap an image path. Founder and director bios live in
`components/Founder.js` and `components/Team.js`. Replace the `'#'` social URLs
with real profile links; set a social value to `''` to hide that icon.

## Deployment (all via browser)

1. Supabase: create a project, run `supabase/schema.sql` in the SQL Editor,
   copy the Project URL, anon key and service_role key from Settings > API.
2. GitHub: create a private repo, use "uploading an existing file" to drag in
   everything from this folder (including the `public` images), commit.
3. Vercel: import the repo, add the three env vars
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`), deploy.
4. Domain: once happy, add rumbuindustries.com in Vercel > Domains and update
   DNS at your registrar. Keep Wix live until this final step.

## Local dev (optional)

```
npm install
cp .env.example .env.local   # fill in Supabase values
npm run dev
```

## Advanced features added

- Exhibitions page with a click-to-open lightbox gallery (arrow-key + swipe
  navigation) covering IATF Durban 2021, IATF Cairo 2018, PROPAK Lagos 2021,
  Made in Kano 2021 and AADFI Abuja 2017.
- Animated count-up stats (numbers tick up when scrolled into view).
- Clients shown as a paragraph plus named "chips".
- Scroll-progress bar at the top of every page.
- Floating WhatsApp quick-contact button (uses the head-office number).
- Back-to-top button that appears after scrolling.
- SEO + Open Graph / Twitter card metadata for sharp link previews.

## Adding exhibition photos

Exhibition images live in `lib/data.js` under `exhibitions`, each photo with
`img: null` (placeholder) and a `caption`. Upload photos to
`/public/exhibitions/` on GitHub and set the matching `img` path, e.g.
`img: '/exhibitions/iatf-durban-buhari.jpg'`. The lightbox and grid pick them
up automatically.

## News & milestones

Articles live in `lib/data.js` under `news` (newest first). Each has a `slug`,
`title`, `date`, `category`, `excerpt`, a `body` array of paragraphs, and
`cover` (set to null for a placeholder, or a path under `/public/news/`). Add a
new object to the top of the array to publish; the list page, homepage teaser,
and individual article page update automatically. Categories used: Press,
Events, Milestone.

## Contact map

The Contact page embeds a Google Map keyed to the business name and address, so
Google resolves the correct pin, plus a "Get directions" button.

## Hero video

The homepage hero plays /public/hero.mp4 automatically (muted, looped). Until
you add that file it falls back to the factory image. Keep the video short
(10 to 20 seconds), under ~10 MB, 1920x1080, encoded as H.264 MP4. Add an
optional /public/hero-poster.jpg for the first frame.

## Product catalogue

A branded PDF catalogue is at /public/rumbu-product-catalogue.pdf and downloads
from the hero and the Products page. To regenerate it after changing products,
re-run make_catalogue.py (kept in the project root).
