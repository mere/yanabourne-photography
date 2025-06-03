import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  galleries: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    layout: v.array(v.object({
      id: v.string(),
      imageUrl: v.string(),
      altText: v.optional(v.string()),
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      link: v.optional(v.string()),
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),
});
