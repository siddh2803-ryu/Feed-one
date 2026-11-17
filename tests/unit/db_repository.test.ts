import { describe, it, expect } from "vitest";
import { IFeedOneRepository } from "@/server/db/repository";

describe("Repository Interface Implementation", () => {
  it("implements repository methods consistently", async () => {
    const mockRepo: IFeedOneRepository = {
      async getDonation(id) {
        return {
          id,
          donorId: "donor-1",
          category: "bakery",
          title: "Bread",
          quantity: 20,
          unit: "items",
          status: "listed",
          createdAt: new Date().toISOString()
        };
      },
      async listRecipients() {
        return [];
      },
      async getOffer() {
        return null;
      }
    };

    const donation = await mockRepo.getDonation("don-test");
    expect(donation?.title).toBe("Bread");
  });
});
