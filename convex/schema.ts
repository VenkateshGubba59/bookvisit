import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  slots: defineTable({
    date: v.string(),
    time: v.string(),
    city: v.string(),
    experienceCenterName: v.string(),
    status: v.union(v.literal("available"), v.literal("booked")),
  })
    .index("by_city_and_status", ["city", "status"])
    .index("by_date", ["date"]),
  bookings: defineTable({
    leadName: v.string(),
    phone: v.string(),
    city: v.string(),
    slotId: v.id("slots"),
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),
    createdAt: v.number(),
  }).index("by_created_at", ["createdAt"]),
});
