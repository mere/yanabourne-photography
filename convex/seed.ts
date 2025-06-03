import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a gallery with layout
    const galleryId = await ctx.db.insert("galleries", {
      title: "Fashion Events",
      slug: "fashion-events",
      description: "A collection of fashion event photography",
      layout: [
        {
          id: "1",
          imageUrl: "/images/events/event1.jpg",
          altText: "Fashion Week Opening",
          description: "The opening ceremony of Fashion Week",
          x: 1,
          y: 1,
          w: 4,
          h: 3,
        },
        {
          id: "2",
          imageUrl: "/images/events/event2.jpg",
          altText: "Runway Show",
          description: "Highlights from the main runway show",
          x: 5,
          y: 1,
          w: 4,
          h: 3,
        },
        {
          id: "3",
          imageUrl: "/images/events/event3.jpg",
          altText: "After Party",
          description: "Exclusive coverage of the after party",
          x: 9,
          y: 1,
          w: 4,
          h: 3,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { galleryId };
  },
}); 