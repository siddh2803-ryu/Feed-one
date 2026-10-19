/**
 * Unit Tests: Safety Rule Evaluator (S1 to S8)
 * Traceability: PRD §7.4, D10, D17, BR-SAF
 */

import { describe, it, expect } from "vitest";
import { evaluateSafetyRules } from "@/domain/safety/evaluator";

describe("Food Safety Rule Evaluator (BR-SAF)", () => {
  const now = "2026-10-19T12:00:00.000Z";
  const deadline = "2026-10-19T15:00:00.000Z";

  it("S1: blocks when use_by is in the past", () => {
    const res = evaluateSafetyRules(
      {
        category: "bakery",
        storageCategory: "ambient",
        packagedSealed: true,
        useBy: "2026-10-19T11:59:00.000Z",
        pickupDeadline: deadline,
      },
      now
    );
    expect(res.status).toBe("blocked");
    expect(res.ruleId).toBe("S1");
    expect(res.reason).toContain("passed");
  });

  it("S2: blocks when use_by is before the pickup deadline", () => {
    const res = evaluateSafetyRules(
      {
        category: "bakery",
        storageCategory: "ambient",
        packagedSealed: true,
        useBy: "2026-10-19T14:00:00.000Z", // before 15:00 deadline
        pickupDeadline: deadline,
      },
      now
    );
    expect(res.status).toBe("blocked");
    expect(res.ruleId).toBe("S2");
    expect(res.reason).toContain("before the pickup deadline");
  });

  it("S3: routes category 'other' to needs_review", () => {
    const res = evaluateSafetyRules(
      {
        category: "other",
        storageCategory: "ambient",
        packagedSealed: true,
        useBy: "2026-10-20T12:00:00.000Z",
        pickupDeadline: deadline,
      },
      now
    );
    expect(res.status).toBe("needs_review");
    expect(res.ruleId).toBe("S3");
  });

  it("S4: routes chilled, frozen, hot_held to needs_review", () => {
    for (const storage of ["chilled", "frozen", "hot_held"] as const) {
      const res = evaluateSafetyRules(
        {
          category: "dairy_eggs",
          storageCategory: storage,
          packagedSealed: true,
          useBy: "2026-10-20T12:00:00.000Z",
          pickupDeadline: deadline,
        },
        now
      );
      expect(res.status).toBe("needs_review");
      expect(res.ruleId).toBe("S4");
      expect(res.reason).toContain("Temperature-controlled");
    }
  });

  it("S5: routes unpackaged items to needs_review", () => {
    const res = evaluateSafetyRules(
      {
        category: "bakery",
        storageCategory: "ambient",
        packagedSealed: false,
        useBy: "2026-10-20T12:00:00.000Z",
        pickupDeadline: deadline,
      },
      now
    );
    expect(res.status).toBe("needs_review");
    expect(res.ruleId).toBe("S5");
    expect(res.reason).toContain("Unpackaged");
  });

  it("S6: routes missing use_by to needs_review", () => {
    const res = evaluateSafetyRules(
      {
        category: "bakery",
        storageCategory: "ambient",
        packagedSealed: true,
        useBy: null,
        pickupDeadline: deadline,
      },
      now
    );
    expect(res.status).toBe("needs_review");
    expect(res.ruleId).toBe("S6");
    expect(res.reason).toContain("No use-by");
  });

  it("S7: routes ambient packaged items in approved categories to eligible_by_rules", () => {
    for (const cat of ["bakery", "packaged_dry", "produce", "beverages"]) {
      const res = evaluateSafetyRules(
        {
          category: cat,
          storageCategory: "ambient",
          packagedSealed: true,
          useBy: "2026-10-20T12:00:00.000Z",
          pickupDeadline: deadline,
        },
        now
      );
      expect(res.status).toBe("eligible_by_rules");
      expect(res.ruleId).toBe("S7");
    }
  });

  it("S8: catch-all routes cooked_meals to needs_review", () => {
    const res = evaluateSafetyRules(
      {
        category: "cooked_meals",
        storageCategory: "ambient",
        packagedSealed: true,
        useBy: "2026-10-20T12:00:00.000Z",
        pickupDeadline: deadline,
      },
      now
    );
    expect(res.status).toBe("needs_review");
    expect(res.ruleId).toBe("S8");
  });
});
