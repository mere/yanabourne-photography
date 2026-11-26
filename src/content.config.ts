import { defineCollection } from "astro:content";

/** Gallery JSON files are loaded via `src/lib/galleries.ts`; this silences the auto-collection warning. */
const galleries = defineCollection({ type: "data" });

export const collections = { galleries };