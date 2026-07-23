# Pen & Paper Labs

Astro static site. Full build rationale and phase breakdown lives in
[`PROJECT_IMPLEMENTATION_PLAN.md`](./PROJECT_IMPLEMENTATION_PLAN.md); this
file is just the practical "how do I run it / turn on integration X" reference.

## Develop

```
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built dist/
```

The site runs and builds today with zero configuration — Shopify products
and the cart are dormant and fall back to local data (`src/data/products.ts`)
until you wire in real accounts below. Journal posts are real markdown files
in `src/content/journal/`.

## Turning on Shopify (products, cart, checkout)

1. Create the Shopify store (paid plan or trial — a paid plan is required
   before it can process real payments).
2. In Settings → Custom data, add three product metafields: **Medium**
   (Physical/Digital/Hybrid), **Domain Index** (HW/SW/XR/RES/PD/LIFE), and
   **Badge** (New/Kit — sold-out is derived from inventory automatically).
3. Create three collections: **Prints & Posters**, **Stationery**,
   **Built Objects** — these become the shop's category filter.
4. Create a Storefront API access token (Settings → Apps → Develop apps, or
   Headless channel).
5. Copy `.env.example` to `.env` and fill in `PUBLIC_SHOPIFY_STORE_DOMAIN`
   and `PUBLIC_SHOPIFY_STOREFRONT_TOKEN`.
6. Rebuild. `src/lib/shopify.ts` maps live products into the same shape the
   site already renders — check the shop grid and a product page for sane
   output; the field mapping is best-effort and untested against a real
   store, so expect to adjust it.

Known limitation: "Add to cart" only adds the product's first/default
variant. A product with real option-based variants (like the Frame finish
selector) needs `src/lib/shopify.ts` extended to fetch all variants and map
option values to variant IDs — not built yet.

## Turning on Decap CMS (`/admin`)

Decap needs something to authenticate logins and let it commit to GitHub.
Simplest path (assumed by `public/admin/config.yml`'s `git-gateway` backend):

1. Push this repo to GitHub.
2. Create a **free Netlify site** pointed at that repo (it never serves
   traffic — IONOS still hosts the real site — it's only used for Identity +
   Git Gateway).
3. In the Netlify site: Site settings → Identity → Enable Identity, then
   Services → Git Gateway → Enable.
4. Invite yourself as an Identity user (or set registration to invite-only
   and send yourself an invite).
5. Visit `/admin` on the deployed site, log in, and Decap will commit new
   posts straight to `src/content/journal/` on `main`.

Alternative: a self-hosted OAuth proxy (e.g. a Cloudflare Worker) against a
GitHub OAuth App, avoiding the Netlify dependency — more setup, not
implemented here.

## Turning on deploy (`.github/workflows/deploy.yml`)

1. Push this repo to GitHub.
2. Add repo secrets (Settings → Secrets and variables → Actions):
   `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (your IONOS FTP credentials),
   and optionally `PUBLIC_SHOPIFY_STORE_DOMAIN` /
   `PUBLIC_SHOPIFY_STOREFRONT_TOKEN` if Shopify is live.
3. Push to `main` — the workflow builds and FTPs `dist/` to IONOS. It also
   runs hourly and can be triggered manually from the Actions tab, so a
   Shopify product change goes live without a code push.

## Still open (see plan §7)

- Real destinations for Instagram / GitHub / Newsletter / the contact
  email — currently `#` placeholders in `src/layouts/Layout.astro` and
  `src/pages/about.astro`.
