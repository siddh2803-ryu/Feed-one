import { describe, it, expect } from "vitest";
import { DonationListingSchema } from "@/lib/validation/donations";

describe("API Validation Schemas", () => {
  it("validates valid donation listings successfully", () => {
    const valid = {
      category: "bakery",
      title: "Fresh Bagels",
      quantity: 50,
      unit: "items",
      availableFrom: "2026-10-19T10:00:00Z",
      pickupDeadline: "2026-10-19T14:00:00Z",
      storageCategory: "ambient",
      packagedSealed: true,
    };
    const res = DonationListingSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects invalid negative quantities", () => {
    const invalid = {
      category: "bakery",
      title: "Fresh Bagels",
      quantity: -5,
      unit: "items",
      availableFrom: "2026-10-19T10:00:00Z",
      pickupDeadline: "2026-10-19T14:00:00Z",
      storageCategory: "ambient",
      packagedSealed: true,
    };
    const res = DonationListingSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
