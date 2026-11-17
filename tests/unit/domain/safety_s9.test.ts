import { describe, it, expect } from "vitest";
import { evaluateSafetyRules } from "@/domain/safety/evaluator";

describe("Food Safety Screening Rules S1-S8 & Cold Chain", () => {
  it("routes frozen or chilled items to needs_review under rule S4", () => {
    const result = evaluateSafetyRules({
      category: "bakery",
      storageCategory: "frozen",
      packagedSealed: true,
      pickupDeadline: "2026-10-19T20:00:00Z",
      useBy: "2026-10-25T12:00:00Z",
    }, "2026-10-19T10:00:00Z");

    expect(result.status).toBe("needs_review");
    expect(result.ruleId).toBe("S4");
  });
});
