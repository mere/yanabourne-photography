// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify/functions";
import { imageService } from "@unpic/astro/service";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],

  devToolbar: {
    enabled: false,
  },

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    domains: ["*.convex.cloud", "*.netlify.blobs.core", "yanabourne-photography.netlify.app"],
    service: imageService(),
  },

  adapter: netlify({
    edgeMiddleware: true,
    imageCDN: true
  }),
});
