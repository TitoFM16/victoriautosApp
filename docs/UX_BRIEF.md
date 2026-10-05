You are working in the Victoria Autos monorepo (this directory): a used-car consignment dealership in Pasto, Colombia (victoriautos.com). Read AGENTS.md and follow it. Only touch frontend/. JS/JSX + Bootstrap/Sass, Yarn, no TypeScript. Don't change API contracts, routes, reCAPTCHA, analytics, or admin layouts. Work on branch ux-improvements and open a pull request into main when done; never deploy. The owner reviews from their phone, so finish with a clear summary and a list of next ideas they can pick from.

# Context
A previous pass (commit cec65a6) only made the public site "less rectangular" (radii, pills, shadows). The owner says it is STILL UGLY and the UX did not improve. This pass is about real UI/UX quality: hierarchy, conversion, and how buyers and sellers actually use a Colombian dealership site, mostly on phones over WhatsApp.

Look at the site first. In Codex Cloud there is no running backend: run `cd frontend && yarn install && yarn dev --port 5199` and, where pages need inventory, temporarily mock `/api/cars` responses (e.g. a Vite dev-only middleware or MSW-free fetch stub that is NOT shipped in the production build) using realistic Colombian used cars. Images can be any local placeholder. Take screenshots at 390px and 1440px of: /, /vitrina, /vitrina/<id>, /vende, /interes, /financiamiento (Playwright via npx if available). Critique them honestly before changing anything, and write the critique into your final summary.

# Goals (prioritize by impact; do the top items well rather than everything shallowly)
1. Make the inventory the hero. Buyers come to see cars. Homepage above the fold on mobile should show what the dealership is + a fast way into the cars (search or quick chips by type/brand/price), not a long marketing paragraph and a 6-field form. Reduce text, tighten whitespace (current sections have huge empty gaps), stronger visual hierarchy.
2. Contact = WhatsApp. Add a persistent, tasteful WhatsApp CTA (floating button on mobile, header action on desktop) and "Preguntar por WhatsApp" on each car card/detail page with a prefilled message including the car name, year, and URL. Find the business WhatsApp number already used in the footer/links; don't invent one. Keep existing forms too.
3. Car cards: scannable. Price is the most prominent element, then brand + line + year, then km/transmission/fuel as compact icons/chips, then location. Show an estimated monthly payment ("Desde $X/mes") using the existing financing calculator logic if it exists in the code (reuse it, label it as an estimate). Whole card clickable, good hover/press states, consistent heights.
4. Vitrina (inventory page): mobile filters in a bottom sheet/offcanvas with an "N resultados" apply button; sort (precio, año, km, recientes); result count; active-filter chips with clear; good empty state; skeletons while loading.
5. Car detail page: large swipeable gallery with thumbnails and fullscreen; sticky price + CTA bar on mobile (WhatsApp, "Me interesa"); specs in a clean 2-column grid with icons; financing estimate block linking to /financiamiento with the price prefilled if the calculator supports it; "Vehículos similares" row.
6. Sell flow (/vende): clear stepper with progress, fewer fields per screen, big tap targets, photo upload with previews, reassuring copy about the process. Keep the same API payload.
7. Typography and color: one clean, modern type scale (the giant thin headings feel dated; prefer a confident sans like Inter or a Google Font already loaded, with semibold headings), consistent spacing scale, a refined palette around the brand red with neutral warm greys, accessible contrast (WCAG AA), visible focus states.
8. Trust: compact trust strip (years in Pasto, consignment process, peritaje/documentation help) and the physical address/map link and hours, without walls of text.

Keep everything responsive (360–1440px, no horizontal scroll, tap targets >= 44px), fast (lazy images below the fold, no heavy new libraries; small icon set like the already-installed one if any, otherwise inline SVG), and accessible (alt text, labels, aria for sheets/galleries, prefers-reduced-motion).

# Done means
- `yarn build` passes; `yarn lint` adds no NEW errors (about 20 pre-existing errors in untouched files are known).
- Before/after screenshots attached to the PR description or task summary (not committed) for the pages above at 390 and 1440.
- Final summary: critique of the old UI, what you changed and why (by page), anything you could not verify, and 5–8 concrete next-step ideas the owner can choose from on their phone.
