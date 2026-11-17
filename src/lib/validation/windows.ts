import { z } from "zod";

export const WeeklyWindowSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time"
});

export const BatchWindowsSchema = z.array(WeeklyWindowSchema);
