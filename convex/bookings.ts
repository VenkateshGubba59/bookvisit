import { ConvexError, v } from "convex/values";
import { env, mutation, query } from "./_generated/server";
import { normalizePhone, validateName, validatePhone } from "../lib/booking-validation";

export const create = mutation({
  args: {
    leadName: v.string(),
    phone: v.string(),
    city: v.string(),
    slotId: v.id("slots"),
  },
  handler: async (ctx, args) => {
    const leadName = args.leadName.trim();
    if (validateName(leadName)) throw new ConvexError("Invalid name");
    if (validatePhone(args.phone)) throw new ConvexError("Invalid phone number");
    const phone = normalizePhone(args.phone);

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
  args: { adminPassword: v.string() },
  handler: async (ctx, { adminPassword }) => {
    const configuredPassword = (env as unknown as Record<string, string | undefined>).ADMIN_PASSWORD;
    if (!configuredPassword || adminPassword !== configuredPassword) {
      throw new ConvexError("Unauthorized");
    }
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
