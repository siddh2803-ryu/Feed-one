import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  const allOffers = store.getOffers();

  // Lazy expiry check
  store.applyExpiries(new Date().toISOString());

  // Recipient sees offers sent to their organisation
  const relevantOffers =
    user.role === "coordinator"
      ? allOffers
      : allOffers.filter((o) => o.recipientId === user.recipientId);

  // Attach donation snapshot to each offer for rendering
  const enriched = relevantOffers.map((o) => ({
    ...o,
    donation: store.getDonation(o.donationId),
  }));

  return NextResponse.json({ data: enriched });
}
