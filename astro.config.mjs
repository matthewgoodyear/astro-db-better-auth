// @ts-check
import { defineConfig } from "astro/config";

// Integrations
import db from "@astrojs/db";
import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",

  devToolbar: {
    enabled: false,
  },

  integrations: [db()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
