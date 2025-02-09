import react from "@astrojs/react";
import { defineConfig, envField } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: cloudflare(),

  env: {
    schema: {
      API_ADMIN_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      API_BASE_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});