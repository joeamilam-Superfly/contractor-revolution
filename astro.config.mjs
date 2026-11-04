import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://contractor-revolution.co',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/order/thanks') && !page.endsWith('/404'),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
