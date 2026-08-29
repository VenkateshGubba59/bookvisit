import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const centers = [
  { city: "Bengaluru", name: "Indiranagar Experience Center" },
  { city: "Mumbai", name: "Bandra Experience Center" },
  { city: "Delhi", name: "Saket Experience Center" },
  { city: "Hyderabad", name: "Banjara Hills Experience Center" },
];

const times = ["10:00 AM", "12:30 PM", "3:00 PM", "5:30 PM"];

function dateAfter(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    for (const center of centers) {
      const existing = await ctx.db
        .query("slots")
        .withIndex("by_city_and_status", (q) => q.eq("city", center.city))
        .first();
      if (existing) continue;

      for (const day of [1, 2, 3, 5]) {
        for (const time of times) {
          await ctx.db.insert("slots", {
            date: dateAfter(day),
            time,
            city: center.city,
            experienceCenterName: center.name,
            status: "available",
          });
          inserted += 1;
        }
      }
    }
    return { inserted, message: `Added ${inserted} fake slots` };
  },
});

export const listAvailableByCity = query({
  args: { city: v.string() },
  handler: async (ctx, { city }) => {
    const slots = await ctx.db
      .query("slots")
      .withIndex("by_city_and_status", (q) =>
        q.eq("city", city).eq("status", "available"),
      )
      .collect();
    return slots.sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
    );
  },
});
