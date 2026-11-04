# Contractor Revolution

Marketing and order site for Contractor Revolution, a time-tracking, work order, and billing app for contractors. It is a product of [Isom Technologies](https://isomtechnologies.com).

The public site URL is **https://www.contractor-revolution.co**. That origin lives in one place, `shared/site.mjs`, and Astro uses it for the canonical URL, the sitemap, and Open Graph tags. `www` is the primary host. `netlify.toml` redirects the apex (`contractor-revolution.co`) to `https://www.contractor-revolution.co`.

## Pages

- `/` home, with the product lines and sample screens
- `/pricing` rate card
- `/compare` Jobber and JobTread, from the November 3, 2026 pricing proposal
- `/order` seat-count calculator and order form
- `/about` Isom Technologies contact details
- `/order/thanks` confirmation

## Run it

```bash
npm install
npm test
npm run build
npm run dev
```

`npm test` checks the rate card against the proposal: every tier's monthly price, the published annual price (15% off, rounded to the nearest dollar), setup, extra-user rates, and the rule that extra users move up to the next tier once they cost as much as that tier.

The Netlify build runs `npm test` and then `npm run build`.

## Contact

These are Isom Technologies' published details. Do not replace them with invented addresses.

- 7205 US 76, Pendleton, SC 29670
- 864-437-1827
- info@isomtechnologies.com
- support@isomtechnologies.com

Set the Netlify Forms notification for the `order` form to info@isomtechnologies.com.

## Domain on Netlify

1. Add `www.contractor-revolution.co` and set it as the primary domain.
2. Add `contractor-revolution.co` as a domain alias.
3. At GoDaddy, use the DNS records Netlify shows for this site. Do not guess an IP.
4. The redirect in `netlify.toml` sends every apex request to `https://www.contractor-revolution.co`.

## Order flow

The buyer picks a seat count from 1 to 200. The page shows the matching tier, extra users, the setup fee, and a monthly or annual total.

Pricing rules, from the November 3, 2026 proposal:

| Tier | Users included | Monthly | Annual per month | Paid for the year | Setup | Extra user / month | Extra user on annual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Starter | Up to 5 | $239 | $203 | $2,436 | $1,500 | $19 | $16 |
| Crew | Up to 10 | $329 | $280 | $3,360 | $2,500 | $19 | $16 |
| Company | Up to 20 | $429 | $365 | $4,380 | $4,000 | $15 | $13 |
| Pro | Up to 40 | $529 | $450 | $5,400 | $6,000 | $12 | $10 |
| Enterprise | Up to 75 | $729 | $620 | $7,440 | From $9,500 | $8 | $7 |

Annual prepay is 15% off, rounded to the nearest dollar. Extra users are discounted the same way, each rounded to the nearest dollar, so the page matches a Stripe quantity price. Setup is not discounted. Above 75 users, Enterprise stays the tier and extra users are $8 a month ($7 on annual prepay).

A seat count between tiers stays on the cheaper of "lower tier plus extra users" and "next tier at its base price." Examples: 9 users stay on Starter at $315. 10 users move to Crew at $329, because Starter plus 5 extra users would be $334.

Enterprise setup on the order is the $9,500 starting fee. The page says Isom will say so before any migration work beyond a standard setup.

Due today is the setup fee plus the first month, or the setup fee plus the full year, depending on the toggle.

### Stripe

`netlify/functions/create-checkout.mjs` creates a Stripe Checkout session in subscription mode when `STRIPE_SECRET_KEY` and the price ids for that quote are set. The session has three kinds of line items:

- the tier's recurring price, quantity 1
- the extra-user recurring price, quantity equal to the extra seats (omitted when there are none)
- the one-time setup price, quantity 1

If the secret or a required price id is missing, or Stripe returns an error, the function tells the page to fall back. The browser then submits the Netlify Form named `order`, and the buyer sees a confirmation that Isom will follow up. No payment is taken on that path.

The function recalculates the quote. It does not trust totals sent by the browser.

Set these in Netlify, under Site configuration, Environment variables, scoped to Functions. Leave them out of the repo.

`STRIPE_SECRET_KEY`

Create the prices in Stripe for the amounts below. Monthly prices use interval **month**. Annual prices use interval **year** and are the full year, not the per-month figure. Setup prices are **one time**. Extra-user prices are recurring, and the annual extra price is also interval **year**.

| Variable | Amount | Interval |
| --- | --- | --- |
| `STRIPE_PRICE_STARTER_MONTHLY` | $239 | month |
| `STRIPE_PRICE_STARTER_ANNUAL` | $2,436 | year |
| `STRIPE_PRICE_STARTER_SETUP` | $1,500 | once |
| `STRIPE_PRICE_STARTER_EXTRA_MONTHLY` | $19 | month |
| `STRIPE_PRICE_STARTER_EXTRA_ANNUAL` | $192 | year |
| `STRIPE_PRICE_CREW_MONTHLY` | $329 | month |
| `STRIPE_PRICE_CREW_ANNUAL` | $3,360 | year |
| `STRIPE_PRICE_CREW_SETUP` | $2,500 | once |
| `STRIPE_PRICE_CREW_EXTRA_MONTHLY` | $19 | month |
| `STRIPE_PRICE_CREW_EXTRA_ANNUAL` | $192 | year |
| `STRIPE_PRICE_COMPANY_MONTHLY` | $429 | month |
| `STRIPE_PRICE_COMPANY_ANNUAL` | $4,380 | year |
| `STRIPE_PRICE_COMPANY_SETUP` | $4,000 | once |
| `STRIPE_PRICE_COMPANY_EXTRA_MONTHLY` | $15 | month |
| `STRIPE_PRICE_COMPANY_EXTRA_ANNUAL` | $156 | year |
| `STRIPE_PRICE_PRO_MONTHLY` | $529 | month |
| `STRIPE_PRICE_PRO_ANNUAL` | $5,400 | year |
| `STRIPE_PRICE_PRO_SETUP` | $6,000 | once |
| `STRIPE_PRICE_PRO_EXTRA_MONTHLY` | $12 | month |
| `STRIPE_PRICE_PRO_EXTRA_ANNUAL` | $120 | year |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | $729 | month |
| `STRIPE_PRICE_ENTERPRISE_ANNUAL` | $7,440 | year |
| `STRIPE_PRICE_ENTERPRISE_SETUP` | $9,500 | once |
| `STRIPE_PRICE_ENTERPRISE_EXTRA_MONTHLY` | $8 | month |
| `STRIPE_PRICE_ENTERPRISE_EXTRA_ANNUAL` | $84 | year |

Optional: `SITE_URL`. When set, Stripe success and cancel URLs use it. Production should set `https://www.contractor-revolution.co`. Leave it unset on deploy previews so Netlify's `DEPLOY_PRIME_URL` is used and the buyer returns to that preview.

Blank names are listed in `.env.example`.

### Netlify Forms

The order form is in the static HTML (`data-netlify="true"`, form name `order`) so Netlify can detect it at deploy time. JavaScript fills the tier and fee fields before a fallback submit. If JavaScript is off, those fee fields stay empty and the seat count still submits. Price from the seat count if the fee fields are empty or do not match it.

## Screens

The pictures in `public/images/app/` are screenshots of the app with sample data. The app header in those shots carried an Isom Electric logo, so that bar is covered with a Contractor Revolution wordmark. The work order detail shot has no logo bar. `npm run screens` will not overwrite these files.

## What the copy will not say

No internal sales terms, no invented testimonials, customer logos, or statistics. Competitor prices are the ones in the November 3, 2026 proposal, including the note that Jobber above 15 users is an estimate.
