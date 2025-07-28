// @ts-check
import { defineConfig } from "astro/config";

import db from "@astrojs/db";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "server",
  adapter: vercel(),

  site: process.env.PROD
    ? "https://astro-db-better-auth.vercel.app"
    : "http://localhost:4321",

  devToolbar: {
    enabled: false,
  },

  integrations: [db()],

  vite: {
    plugins: [tailwindcss()],
  },
});
