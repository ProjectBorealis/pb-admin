import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig, envField } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: cloudflare(),
  experimental: {
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
  },
});
