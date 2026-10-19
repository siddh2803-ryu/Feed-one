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

    if (!can(user, "decline_offer", { recipientId: offer.recipientId })) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Forbidden to decline this offer." } },
        { status: 403 }
      );
    }

    const { reason, note } = await req.json();
    const declined = store.declineOffer(params.id, reason, note);

    return NextResponse.json({ data: declined });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to decline offer." } },
      { status: 400 }
    );
  }
}
