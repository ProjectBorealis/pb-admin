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
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: import.meta.env.PROD && {
        "react-dom/server": "react-dom/server.edge",
      },
    },
  },
});
