/**
 * Feed One Domain: Time, Windows and Distance Calculations
 * Traceability: Ref §8.2.1, PRD §7.3, D6, D12, D14, D29
 */

import { CollectionWindow, Slot } from "../matching/types";

/**
 * Calculates Haversine distance in kilometers between two coordinates.
 * Earth radius = 6371 km. Result rounded to 2 decimal places for storage,
 * but full precision available.
 * Traceability: D6
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export interface WindowIntersectionResult {
  hasFeasibleSlot: boolean;
  earliestFeasiblePickup: string | null; // ISO 8601 UTC
  feasibleSlots: Slot[];
  reasonCode: string;
}

/**
 * Parses "HH:MM" into minutes from start of day.
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Intersects donation pickup window with recipient's recurring weekly collection windows.
 * Traceability: D12 (UTC + timezone), D14 (availability model), D29 (C3 algorithm)
 *
 * @param availableFromIso ISO 8601 UTC string
 * @param pickupDeadlineIso ISO 8601 UTC string
 * @param nowIso Injected current ISO 8601 UTC string
 * @param windows Recipient weekly collection windows
 * @param timezone IANA timezone string e.g. "Asia/Kolkata" or "UTC"
 * @param minSlotMinutes Minimum required duration in minutes (default 30)
 */
export function evaluatePickupWindow(
  availableFromIso: string,
  pickupDeadlineIso: string,
  nowIso: string,
  windows: CollectionWindow[],
  timezone: string = "UTC",
  minSlotMinutes: number = 30
): WindowIntersectionResult {
  const availableFrom = new Date(availableFromIso).getTime();
  const pickupDeadline = new Date(pickupDeadlineIso).getTime();
  const now = new Date(nowIso).getTime();

  // Effective window W = [max(available_from, now), pickup_deadline]
  const effectiveStart = Math.max(availableFrom, now);
  const effectiveEnd = pickupDeadline;

  const minSlotMs = minSlotMinutes * 60 * 1000;

  if (effectiveEnd - effectiveStart < minSlotMs) {
    return {
      hasFeasibleSlot: false,
      earliestFeasiblePickup: null,
      feasibleSlots: [],
      reasonCode: "C3_TOO_LATE",
    };
  }

  // Filter out any window that carries public_source provenance
  const confirmedWindows = windows.filter(
    (w) => w.provenance !== "public_source"
  );

  if (confirmedWindows.length === 0) {
    return {
      hasFeasibleSlot: false,
      earliestFeasiblePickup: null,
      feasibleSlots: [],
      reasonCode: "C3_NO_CONFIRMED_WINDOWS",
    };
  }

  const feasibleSlots: Slot[] = [];

  // Iterate over calendar days covered by the effective window
  // Look 1 day before and 1 day after to account for timezone offsets
  const startDay = new Date(effectiveStart - 86400000);
  const endDay = new Date(effectiveEnd + 86400000);

  // Normalize to day boundaries in target timezone
  const currentDay = new Date(startDay);
  while (currentDay <= endDay) {
    // Determine the date string "YYYY-MM-DD" and weekday in the specified timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "narrow",
    });

    const parts = formatter.formatToParts(currentDay);
    let year = "",
      month = "",
      day = "";
    for (const p of parts) {
      if (p.type === "year") year = p.value;
      if (p.type === "month") month = p.value;
      if (p.type === "day") day = p.value;
    }
    const dateStr = `${year}-${month}-${day}`;

    // Get day of week in timezone: 0 = Sun, 1 = Mon, ..., 6 = Sat
    // To do this accurately across timezones:
    const dayOfWeekFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
    });
    const weekdayStr = dayOfWeekFormatter.format(currentDay);
    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = weekdayMap[weekdayStr];

    // Find windows matching this weekday
    const dayWindows = confirmedWindows.filter((w) => w.dayOfWeek === dayOfWeek);

    for (const w of dayWindows) {
      // Calculate UTC milliseconds for window start and end
      const wStartUtc = parseZonedDateTimeToUtc(dateStr, w.startTime, timezone);
      const wEndUtc = parseZonedDateTimeToUtc(dateStr, w.endTime, timezone);

      // Intersect [wStartUtc, wEndUtc] with [effectiveStart, effectiveEnd]
      const slotStart = Math.max(wStartUtc, effectiveStart);
      const slotEnd = Math.min(wEndUtc, effectiveEnd);

      if (slotEnd - slotStart >= minSlotMs) {
        feasibleSlots.push({
          start: new Date(slotStart).toISOString(),
          end: new Date(slotEnd).toISOString(),
        });
      }
    }

    // Advance by 24 hours
    currentDay.setTime(currentDay.getTime() + 86400000);
  }

  // Deduplicate and sort feasible slots by start time
  const uniqueSlotsMap = new Map<string, Slot>();
  for (const s of feasibleSlots) {
    const key = `${s.start}_${s.end}`;
    if (!uniqueSlotsMap.has(key)) {
      uniqueSlotsMap.set(key, s);
    }
  }

  const sortedSlots = Array.from(uniqueSlotsMap.values()).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  if (sortedSlots.length > 0) {
    return {
      hasFeasibleSlot: true,
      earliestFeasiblePickup: sortedSlots[0].start,
      feasibleSlots: sortedSlots,
      reasonCode: "C3_FEASIBLE",
    };
  }

  return {
    hasFeasibleSlot: false,
    earliestFeasiblePickup: null,
    feasibleSlots: [],
    reasonCode: "C3_NO_OVERLAP",
  };
}

/**
 * Converts a calendar date "YYYY-MM-DD" and local time "HH:MM" in an IANA timezone to UTC milliseconds.
 */
export function parseZonedDateTimeToUtc(
  dateStr: string,
  timeStr: string,
  timezone: string
): number {
  if (timezone === "UTC") {
    return new Date(`${dateStr}T${timeStr}:00.000Z`).getTime();
  }

  // Create a naive date representation
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  // We find the UTC time whose representation in `timezone` matches year, month, day, hours, minutes.
  // Approximation by treating as UTC first:
  let utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);

  // Measure difference between target time and the timezone representation of utcGuess
  for (let i = 0; i < 3; i++) {
    const d = new Date(utcGuess);
    const dParts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).formatToParts(d);

    let py = 0,
      pm = 0,
      pd = 0,
      ph = 0,
      pmin = 0;
    for (const p of dParts) {
      if (p.type === "year") py = Number(p.value);
      if (p.type === "month") pm = Number(p.value);
      if (p.type === "day") pd = Number(p.value);
      if (p.type === "hour") ph = Number(p.value);
      if (p.type === "minute") pmin = Number(p.value);
    }
    // hour12: false might output 24 for midnight in some Node versions, normalize:
    if (ph === 24) ph = 0;

    const actualUtcOfGuess = Date.UTC(py, pm - 1, pd, ph, pmin, 0, 0);
    const targetUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
    const diff = targetUtc - actualUtcOfGuess;

    if (diff === 0) break;
    utcGuess += diff;
  }

  return utcGuess;
}
