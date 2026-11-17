import { describe, it, expect } from "vitest";
import { evaluateSafetyRules } from "@/domain/safety/evaluator";

describe("Food Safety Boundary Edge Cases", () => {
  it("blocks items where useBy is before now (S1)", () => {
    const now = "2026-10-19T12:00:00.000Z";
    const useBy = "2026-10-19T11:59:59.000Z";

    const res = evaluateSafetyRules({
      category: "bakery",
      storageCategory: "ambient",
      packagedSealed: true,
      pickupDeadline: "2026-10-19T13:00:00Z",
      useBy: useBy,
    }, now);

    expect(res.status).toBe("blocked");
    expect(res.ruleId).toBe("S1");
  });

  it("blocks items where useBy is before pickup deadline (S2)", () => {
    const now = "2026-10-19T10:00:00.000Z";
    const pickupDeadline = "2026-10-19T18:00:00.000Z";
    const useBy = "2026-10-19T15:00:00.000Z";

    const res = evaluateSafetyRules({
      category: "bakery",
      storageCategory: "ambient",
      packagedSealed: true,
      pickupDeadline,
      useBy,
    }, now);

    expect(res.status).toBe("blocked");
    expect(res.ruleId).toBe("S2");
  });
});
