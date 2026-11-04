import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./shared/site.mjs";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/order/thanks"),
    }),
  ],
});
