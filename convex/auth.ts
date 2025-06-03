import { query } from "./_generated/server";
import { v } from "convex/values";

export const isAdmin = query({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      console.error("ADMIN_SECRET environment variable is not set");
      return false;
    }
    
    return args.secret === adminSecret;
  },
}); 