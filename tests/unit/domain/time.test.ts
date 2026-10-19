/**
 * Unit Tests: Time, Haversine Distance, and Window Intersection
 * Traceability: PRD §7.3, D6, D12, D14, D29
 */

import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistance,
  evaluatePickupWindow,
} from "@/domain/time/windows";

describe("Time & Window Domain Helpers", () => {
  it("calculates accurate Haversine straight-line distance (D6)", () => {
    // Distance between (12.9716, 77.5946) and ~4.2 km east
    const lat1 = 12.9716;
    const lon1 = 77.5946;
    const lat2 = 12.9716;
    const lon2 = 77.5946 + 4.2 / (111.32 * Math.cos((12.9716 * Math.PI) / 180));

    const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(4.2, 1);
  });

  it("fails C3 when remaining time to deadline is under 30 minutes (C3_TOO_LATE)", () => {
    const res = evaluatePickupWindow(
      "2026-10-19T18:00:00.000Z",
      "2026-10-19T21:00:00.000Z",
      "2026-10-19T20:45:00.000Z", // only 15m remaining!
      [
        {
          dayOfWeek: 1,
          startTime: "18:00",
          endTime: "22:00",
          provenance: "recipient_confirmed",
        },
      ],
      "UTC",
      30
    );

    expect(res.hasFeasibleSlot).toBe(false);
    expect(res.reasonCode).toBe("C3_TOO_LATE");
  });

  it("finds overlapping slot of at least 30 minutes (C3_FEASIBLE)", () => {
    const res = evaluatePickupWindow(
      "2026-10-19T18:00:00.000Z",
      "2026-10-19T21:00:00.000Z",
      "2026-10-19T18:00:00.000Z",
      [
        {
          dayOfWeek: 1, // Monday
          startTime: "19:00",
          endTime: "20:30",
          provenance: "recipient_confirmed",
        },
      ],
      "UTC",
      30
    );

    expect(res.hasFeasibleSlot).toBe(true);
    expect(res.reasonCode).toBe("C3_FEASIBLE");
    expect(res.earliestFeasiblePickup).toBe("2026-10-19T19:00:00.000Z");
    expect(res.feasibleSlots.length).toBe(1);
    expect(res.feasibleSlots[0].end).toBe("2026-10-19T20:30:00.000Z");
  });

  it("fails when collection window ends before food is available (C3_NO_OVERLAP)", () => {
    const res = evaluatePickupWindow(
      "2026-10-19T18:00:00.000Z",
      "2026-10-19T21:00:00.000Z",
      "2026-10-19T18:00:00.000Z",
      [
        {
          dayOfWeek: 1,
          startTime: "08:00",
          endTime: "12:00",
          provenance: "recipient_confirmed",
        },
      ],
      "UTC",
      30
    );

    expect(res.hasFeasibleSlot).toBe(false);
    expect(res.reasonCode).toBe("C3_NO_OVERLAP");
  });

  it("ignores windows carrying public_source provenance (D24)", () => {
    const res = evaluatePickupWindow(
      "2026-10-19T18:00:00.000Z",
      "2026-10-19T21:00:00.000Z",
      "2026-10-19T18:00:00.000Z",
      [
        {
          dayOfWeek: 1,
          startTime: "18:30",
          endTime: "20:30",
          provenance: "public_source", // public source ignored!
        },
      ],
      "UTC",
      30
    );

    expect(res.hasFeasibleSlot).toBe(false);
    expect(res.reasonCode).toBe("C3_NO_CONFIRMED_WINDOWS");
  });
});
