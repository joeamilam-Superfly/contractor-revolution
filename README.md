# Contractor Revolution

Marketing site for Contractor Revolution, a time tracking, work order, PTO, and billing product of Isom Technologies. Static [Astro](https://astro.build) build for Netlify.

Public site: https://contractor-revolution.co

```bash
npm install
npm run build
```

The build writes `dist/`. Netlify runs `npm run build` and publishes `dist` (`netlify.toml`).

Prices, phone, and address live in `src/lib/pricing.ts` and `src/lib/site.ts`. When those change, update `public/llms.txt` and `public/llms-full.txt` in the same commit.
