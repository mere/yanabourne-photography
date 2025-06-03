import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(api.auth.isAdmin, {
      secret: args.secret,
    });

    if (!isAdmin) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = mutation({
  args: { storageId: v.string(), secret: v.string() },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(api.auth.isAdmin, {
      secret: args.secret,
    });

    if (!isAdmin) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
}); 