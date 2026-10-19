/**
 * Unit Tests: Authorization Policy Matrix
 * Traceability: PRD §5.2
 */

import { describe, it, expect } from "vitest";
import { can, AuthUser } from "@/server/authz";

describe("Authorization Policy Matrix (PRD §5.2)", () => {
  const donorUser: AuthUser = {
    id: "user-donor-1",
    role: "donor",
    donorId: "donor-org-1",
  };

  const otherDonorUser: AuthUser = {
    id: "user-donor-2",
    role: "donor",
    donorId: "donor-org-2",
  };

  const recipientUser: AuthUser = {
    id: "user-recip-1",
    role: "recipient",
    recipientId: "recip-org-1",
  };

  const coordinatorUser: AuthUser = {
    id: "user-coord-1",
    role: "coordinator",
  };

  it("permits donor to create and manage own donations", () => {
    expect(can(donorUser, "create_donation")).toBe(true);
    expect(
      can(donorUser, "edit_donation", { donorId: "donor-org-1" })
    ).toBe(true);
    expect(
      can(donorUser, "send_offer", { donorId: "donor-org-1" })
    ).toBe(true);

    // Cannot edit or send offers for other donor's donation
    expect(
      can(otherDonorUser, "edit_donation", { donorId: "donor-org-1" })
    ).toBe(false);
    expect(
      can(otherDonorUser, "send_offer", { donorId: "donor-org-1" })
    ).toBe(false);
  });

  it("forbids donor from accepting offers or recording delivery", () => {
    expect(can(donorUser, "accept_offer")).toBe(false);
    expect(can(donorUser, "record_delivered")).toBe(false);
    expect(can(donorUser, "review_safety")).toBe(false);
  });

  it("permits recipient to accept offer and record delivery only when targeted/accepted", () => {
    // Targeted recipient can accept offer
    expect(
      can(recipientUser, "accept_offer", { recipientId: "recip-org-1" })
    ).toBe(true);
    expect(
      can(recipientUser, "accept_offer", { recipientId: "recip-org-other" })
    ).toBe(false);

    // Accepted recipient can record delivery
    expect(
      can(recipientUser, "record_delivered", {
        acceptedRecipientId: "recip-org-1",
      })
    ).toBe(true);
    expect(
      can(recipientUser, "record_delivered", {
        acceptedRecipientId: "recip-org-other",
      })
    ).toBe(false);
  });

  it("permits coordinator to review safety and manage directory", () => {
    expect(can(coordinatorUser, "review_safety")).toBe(true);
    expect(can(coordinatorUser, "manage_directory")).toBe(true);
    expect(can(coordinatorUser, "operational_correction")).toBe(true);
    expect(can(coordinatorUser, "create_donation")).toBe(false);
  });
});
