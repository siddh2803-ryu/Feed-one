import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Lazy expiry check
  store.applyExpiries(new Date().toISOString());

  const offer = store.getOffer(params.id);
  if (!offer) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Offer not found." } },
      { status: 404 }
    );
  }

  const donation = store.getDonation(offer.donationId);

  return NextResponse.json({
    data: {
      offer,
      donation,
    },
  });
}
