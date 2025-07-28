// @ts-check
import { defineConfig } from "astro/config";

import db from "@astrojs/db";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import netlify from "@astrojs/netlify";
import cloudflare from "@astrojs/cloudflare";

const adapter =
  process.env.VERCEL === "1"
    ? vercel()
    : process.env.NETLIFY === "true"
      ? netlify()
      : process.env.CF_PAGES === "1"
        ? cloudflare()
        : undefined;

const siteUrl = process.env.PROD
  ? "https://astro-db-better-auth.vercel.app"
  : "http://localhost:4321";

export default defineConfig({
  output: "server",
  adapter: adapter,

  site: siteUrl,

  devToolbar: {
    enabled: false,
  },

  integrations: [db()],

  vite: {
    plugins: [tailwindcss()],
  },
});
