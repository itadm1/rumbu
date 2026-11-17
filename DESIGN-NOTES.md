# Rumbu website redesign

The existing Next.js application now uses a shared visual system in `app/redesign.css`. The public website is scoped under `.public-site`, while the admin workspace uses `app/admin/admin.css`.

## Main changes

- Rebuilt the homepage around the company story, featured products, sustainability, industry affiliations, news and careers.
- Added shared page mastheads, contact calls to action, reusable news cards and a custom 404 page.
- Simplified navigation with an accessible company dropdown and mobile navigation.
- Added product category filtering, search, empty states and product-specific contact enquiries.
- Rebuilt the contact form with native validation, autocomplete, status messages and clickable contact details.
- Updated company, services, research, leadership, exhibition, news and careers pages.
- Replaced the careers layout-selection demo controls with a consistent career-fields layout.
- Moved profile and exhibition dialogs to native modal dialogs for keyboard focus, Escape, focus restoration and reliable overlay positioning.
- Refined admin styles and added the missing mobile sidebar controls.
- Fixed the catalogue download path and shared the published news source with the homepage (60-second revalidation).

## Content and integrations

- Existing company copy, product descriptions and photographs remain the source of truth in `lib/data.js`.
- PET flakes, yarn thread and polyester staple fibre currently have no supplied product photographs. Their cards display labelled material panels, without broken image requests.
- Two leadership portraits were not supplied. Those people display initials until portrait files are available.
- Unconfigured or unavailable careers data displays an explicit availability message. News falls back to the supplied editorial archive.
- Contact submissions, job applications and authenticated admin operations still require a configured Supabase project.

## Verification

Run `npm run build`, then `npm run start` to check the production application locally. No external deployment has been made by this redesign.

Final checks passed: production build; HTTP 200 for 14 public pages; one main heading per page; matching contact field labels; all referenced local images present; catalogue PDF response; optimized logo response; and custom HTTP 404. Browser visual QA was unavailable in this session. Live submissions and authenticated admin screens were not exercised.

## Video reference adaptation

Reference: https://www.youtube.com/watch?v=Qr3OMACe_6Y&t=10s

The opening product showcase informed a new homepage experience (`components/ProductExperience.js`, `app/product-experience.css`): large isolated product illustrations, layered pointer movement, floating details, product selectors, coordinated background colours and a scroll-driven desktop sequence. Mobile layouts use direct selection/swipe, without pinned scrolling. Reduced-motion and short-window layouts remain in normal flow. Pinning is enabled only after JavaScript enhancement.

Illustrative imagery lives in `public/showcase/`; full prompts and provenance are in `public/showcase/ASSET-NOTES.md`. These visuals are identified on the page as product illustrations; the catalogue cards retain the original product photography. The images use Next Image optimization. They are rendered illustrations with CSS motion, not interactive mesh-based 3D models.

Reveal animations now keep server-rendered content visible and animate only below-viewport sections as they enter view.

Production builds now use `.next-production`, while development retains `.next`, preventing concurrent build/preview cache corruption. Final production build and HTTP checks passed; desktop scene selection was verified visually in Chrome.

Final video-adaptation QA: production build passed; all 10 public page routes and every referenced CSS/JS resource returned HTTP 200 from the isolated production server; all three illustration files loaded. Chrome visual checks passed for desktop and a 375px mobile viewport, including product selection and the mobile navigation overlay. Existing development preview at http://localhost:3000 also returned HTTP 200. Browser-format artwork delivery is WebP at roughly 340–430 KB per 1080px image.
