import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";
import { can } from "@/server/authz";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const offer = store.getOffer(params.id);

    if (!offer) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Offer not found." } },
        { status: 404 }
      );
    }

    if (!can(user, "accept_offer", { recipientId: offer.recipientId })) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Forbidden to accept this offer." } },
        { status: 403 }
      );
    }

    const { plannedPickupAt } = await req.json();
    const accepted = store.acceptOffer(
      params.id,
      plannedPickupAt || new Date().toISOString()
    );

    return NextResponse.json({ data: accepted });
  } catch (err: any) {
    const code = err.message || "INTERNAL";
    const status = code === "OFFER_EXPIRED" ? 409 : 400;

    return NextResponse.json(
      { error: { code, message: err.message || "Failed to accept offer." } },
      { status }
    );
  }
}
