import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("galleries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("galleries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("galleries")
      .order("desc")
      .collect();
  },
});

export const listWithoutLayouts = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db
      .query("galleries")
      .collect();

    // Return galleries without their layouts
    return galleries.map(({ layout, ...gallery }) => gallery);
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("galleries", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("galleries"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    layout: v.optional(v.array(v.object({
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
    }))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("galleries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
}); 