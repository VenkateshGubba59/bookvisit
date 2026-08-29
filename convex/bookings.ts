import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    leadName: v.string(),
    phone: v.string(),
    city: v.string(),
    slotId: v.id("slots"),
  },
  handler: async (ctx, args) => {
    const leadName = args.leadName.trim();
    const phone = args.phone.trim();
    if (leadName.length < 2) throw new ConvexError("Enter your full name");
    if (!/^[0-9+() -]{7,18}$/.test(phone))
      throw new ConvexError("Enter a valid phone number");

    const slot = await ctx.db.get(args.slotId);
    if (!slot || slot.status !== "available")
      throw new ConvexError("That time was just booked. Choose another slot.");
    if (slot.city !== args.city)
      throw new ConvexError("The selected slot does not match the city");

    const createdAt = Date.now();
    const bookingId = await ctx.db.insert("bookings", {
      leadName,
      phone,
      city: args.city,
      slotId: args.slotId,
      status: "confirmed",
      createdAt,
    });
    await ctx.db.patch(args.slotId, { status: "booked" });

    return {
      bookingId,
      leadName,
      phone,
      city: args.city,
      date: slot.date,
      time: slot.time,
      experienceCenterName: slot.experienceCenterName,
      status: "confirmed" as const,
      createdAt,
    };
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
    return Promise.all(
      bookings.map(async (booking) => ({
        ...booking,
        slot: await ctx.db.get(booking.slotId),
      })),
    );
  },
});
