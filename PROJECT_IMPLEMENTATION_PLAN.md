# Pen & Paper Labs — Implementation Plan

**Purpose of this doc:** a build brief for implementing the real, live version of the site from the mockups already in `mockups/`. Written to be actionable directly by Claude Code. Owner/operator is a single person (John) who will manage all products and content himself after launch.

**Source of truth for design:** `mockups/index.html`, `shop.html`, `product.html`, `blog.html`, `about.html`, and `style.css`. These are current (post-v1) and should be preserved pixel-for-pixel wherever possible — this plan is about wiring them to real data and commerce, not redesigning them. `mockups/v1/` is a frozen earlier snapshot, kept for reference only.

---

## 1. Decisions made

| Area | Decision |
|---|---|
| Commerce backend | Shopify (new account, not yet created) |
| Commerce integration | Headless — Shopify Storefront API (GraphQL), not the Buy Button widget |
| Checkout | Redirect to Shopify's hosted checkout (standard on non-Plus plans) |
| Frontend hosting | Existing IONOS web hosting (self-hosted, not Shopify's hosting) |
| Content ownership | One person (John) manages products, blog posts, and everything else |
| Content status | Placeholder/TBD — real product photos and blog copy don't exist yet |
| Domain | Already owned |
| Blog authoring | Markdown files in the repo, written/edited through a **Decap CMS** admin screen — not the Shopify blog |

## 2. Recommended architecture (open for confirmation)

Because IONOS shared hosting can't be assumed to run a persistent Node server, the safest target is a **static-site build**: a build step produces plain HTML/CSS/JS, which is then uploaded to IONOS. No server-side code runs in production.

- **Framework: Astro**, in static output mode. Astro pages/layouts can wrap the existing mockup HTML/CSS almost verbatim — it's built for exactly this "mostly static, some dynamic data" case, and needs no client-side framework to render markup.
- **Product & inventory data**: fetched from Shopify's **Storefront API** at build time to generate the shop grid and one page per product. Re-fetched client-side only for cart operations.
- **Blog**: markdown files live in the Astro repo (Content Collections), edited through a **Decap CMS** admin screen at `/admin` on the site itself — title/category/date fields, rich text editor, drag-and-drop image upload. Decap writes commits straight to the GitHub repo, so a new post triggers the same build/deploy pipeline as any other change, no Shopify blog involved. Posts are pure static content — no API call needed at build time, they're just files.
- **Decap auth**: Decap needs something to authenticate John's login and let it commit to GitHub on his behalf. Since hosting is on IONOS (not Netlify), the simplest path is a **free Netlify project connected to the same GitHub repo, used only for Netlify Identity + Git Gateway** — it never serves any traffic, it just handles "who's allowed to publish." Alternative: a small self-hosted OAuth proxy (e.g. a Cloudflare Worker) authenticating directly against a GitHub OAuth App, which avoids the Netlify dependency entirely but is a bit more setup. Flagged in §7 as a decision to confirm.
- **Cart**: client-side JS against the Storefront API's Cart object. Cart ID persisted in `localStorage` so it survives page reloads. "Checkout" button sends the shopper to the Shopify-hosted checkout URL returned by the Cart object.
- **Deploy**: GitHub repo → GitHub Actions workflow builds the Astro site and pushes the output to IONOS over FTP/SFTP. A scheduled rebuild (e.g. hourly) picks up any new products or posts John adds in Shopify, so he never has to touch code or redeploy manually. A manual "run workflow" button covers the case where he wants a new post live immediately.

## 3. Site map & routes

| Route | Source mockup | Notes |
|---|---|---|
| `/` | `index.html` | Hero, marquee strip, 4 featured products, 6 featured journal entries — products pulled from Shopify at build time, journal entries pulled from the markdown content collection |
| `/shop` | `shop.html` | Full product grid. Category buttons (Prints & Posters / Stationery / Built Objects) map to Shopify **Collections** or **tags**; "Under $25" and "Featured" sort are computed client-side over the page's product data |
| `/shop/[handle]` | `product.html` | One page generated per Shopify product. Variant selector (e.g. frame finish), quantity, add-to-cart, specs table, related products (from same collection) |
| `/journal` | `blog.html` | Index of all posts with category filter, generated from the markdown content collection. Currently links to `#` placeholders — no article template exists yet |
| `/journal/[slug]` | **missing — needs to be designed** | Individual article page, one per markdown file. Not present in the mockups; build in the same visual language (mono kicker, `.display` headings, `.tag` categories) since it doesn't exist yet |
| `/admin` | n/a | Decap CMS admin screen — not a public content page, gated behind login (see §2) |
| `/about` | `about.html` | Mostly static. The "24 journal entries / 18 products shipped" ticker can either stay hand-edited or be computed from live counts — pick one, don't leave it silently wrong |

Global components used on every page: nav with cart count, `.frame` corner-mark border, footer. These should become a single shared Astro layout, not repeated per page.

## 4. Shopify data model to set up

Shopify's default product schema doesn't cover everything the mockups display, so these need **custom metafields** defined in Shopify admin (Settings → Custom data) before any real products are entered:

- **Medium** — Physical / Digital / Hybrid (shown as the 3-box selector on the product page)
- **Domain Index** — HW / SW / XR / RES / PD / LIFE (shown as the 6-box row on the product page)
- **Badge** — New / Kit / Sold out / (none) — sold-out can instead be derived from inventory count, but "New" and "Kit" have no natural Shopify equivalent

Collections to create (map to the shop filter bar): Prints & Posters, Stationery, Built Objects.

**Blog content model (markdown, not Shopify):** each post is one markdown file with frontmatter — `title`, `date`, `category` (Print / Paper / Electronics / Process / Shop notes), `slug`, optional `image`. Read time is computed automatically at build time from word count, no field needed. Astro's Content Collections schema should validate this frontmatter shape so a malformed post fails the build loudly instead of breaking the journal page silently.

## 5. Gaps to resolve during build (flagging now so they're not missed)

1. **No blog article template exists.** `blog.html` links to `#`. This needs to be designed, not just wired to data.
2. **Custom taxonomy isn't native Shopify data** (see §4) — must be configured before content entry, or product pages will have nothing to display in those sections.
3. **Filter bars are currently decorative.** Category/price/sort buttons on `shop.html` and `blog.html` don't filter anything yet — needs real client-side logic.
4. **Placeholder art.** All product imagery today is a CSS pattern + glyph, not a photo. Plan to launch with these as a visual fallback and swap in real photography per-product as it becomes available, rather than blocking launch on photography being done.
5. **Dead links.** Social links (Instagram, GitHub, Newsletter), the "Write me" contact link, and the mailto address in the footer/About page are all placeholders (`#` or unverified) — need real destinations before launch.
6. **Shopify plan cost.** A paid Shopify plan is required to accept real payments (the free trial doesn't process live orders) — factor this into launch budget/timeline.
7. **Decap needs an auth backend.** It can't authenticate John's login on its own — requires either a free Netlify project (used only for Identity + Git Gateway, not hosting) or a self-hosted GitHub OAuth proxy. Neither is hard, but it's a real setup step, not zero-config.

## 6. Build phases

**Phase 0 — Setup**
Create the Shopify account and a paid plan (or trial, upgraded before go-live). Define the custom metafields and collections in §4. Create a GitHub repo. Scaffold an Astro project; port `style.css` and the shared nav/footer markup into a base layout unchanged. Set up the Decap auth backend (Netlify Identity + Git Gateway, or the OAuth proxy alternative).
*Done when:* Astro project builds locally and serves a shell matching the mockups' header/footer.

**Phase 1 — Static shell**
Rebuild all 5 existing pages as Astro pages using the current mockup markup, with content still hardcoded (no Shopify/markdown data yet).
*Done when:* every page renders visually identical to its mockup counterpart, including responsive breakpoints (860px / 720px / 520px already defined in `style.css`).

**Phase 2 — Live data (read-only)**
Wire homepage featured tiles, shop grid, and product detail pages to real Shopify data via the Storefront API at build time. Define the markdown content collection schema, migrate the journal index to read from it, and design + build the missing article template.
*Done when:* entering a handful of test products in Shopify, and adding a couple of markdown post files, produces correct, populated pages at the right routes after a rebuild.

**Phase 2b — Decap CMS**
Install and configure Decap CMS (`/admin` route, `config.yml` defining the post fields from §4) pointed at the same markdown collection used in Phase 2.
*Done when:* John can log into `/admin`, write a post with an embedded image through the form, and see it committed to the repo and appear on `/journal` after the next build.

**Phase 3 — Cart & checkout**
Implement the Storefront API Cart: add-to-cart with variant + quantity, persistent cart ID, live cart count in nav, checkout button redirecting to Shopify's hosted checkout.
*Done when:* a test order can be added to cart, persists across a page reload, and completes checkout in Shopify's test mode.

**Phase 4 — Interactivity**
Wire the shop and journal filter bars to actually filter the already-rendered data client-side.
*Done when:* clicking a category/price/sort control changes what's visible without a full page reload.

**Phase 5 — Deploy pipeline**
GitHub Actions workflow: build on push to `main` (this covers Decap commits automatically, since Decap publishes by committing to the repo), deploy `dist/` to IONOS via FTP, plus a scheduled rebuild (hourly is a reasonable starting point) so any Shopify-side product changes go live too, without a code push. Document the manual "run now" option for when he wants something live immediately.
*Done when:* a Decap-published post and a push to `main` both update the live site with no manual FTP step.

**Phase 6 — Content & launch**
John enters real products (photos, prices, variants, metafields) through the Shopify admin, and writes real blog posts through Decap. Verify meta tags, sitemap, robots.txt, and resolve the dead links from §5. Point DNS at the new hosting. Final cross-device QA.

**Out of scope for v1** (park for later): customer accounts, product reviews, search, wishlists, newsletter integration, discount codes, live social feed embeds.

## 7. Open questions for John to confirm before/while building

- Decap auth backend: free Netlify project (Identity + Git Gateway) vs. self-hosted GitHub OAuth proxy (see §5, item 7) — Netlify Identity proposed as the lower-effort default.
- Rebuild cadence for Phase 5 (hourly vs. on-demand only vs. webhook-triggered) — hourly proposed as the simplest default.
- Real destinations for Instagram / GitHub / Newsletter / contact email (currently placeholders).
- Whether the About page's stats ("24 journal entries," "18 products shipped") should be live-computed or manually maintained.
