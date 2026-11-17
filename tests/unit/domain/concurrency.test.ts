import { describe, it, expect } from "vitest";

describe("Simulated Concurrency & Offer Race Guards", () => {
  it("prevents double-acceptance of single offer", async () => {
    let offerStatus = "sent";
    let acceptCount = 0;

    async function attemptAccept() {
      if (offerStatus === "sent") {
        offerStatus = "accepted";
        acceptCount++;
        return { success: true };
      }
      return { success: false, error: "OFFER_ALREADY_RESOLVED" };
    }

    const [res1, res2] = await Promise.all([attemptAccept(), attemptAccept()]);
    expect(acceptCount).toBe(1);
    expect(res1.success !== res2.success).toBe(true);
  });
});
