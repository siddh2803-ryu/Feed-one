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
    const donation = store.getDonation(params.id);

    if (!donation) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Donation not found." } },
        { status: 404 }
      );
    }

    if (!can(user, "send_offer", { donorId: donation.donorId })) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not permitted to send offer." } },
        { status: 403 }
      );
    }

    const { recipientId, matchCandidateId, acknowledgeUnknowns } = await req.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Recipient ID is required." } },
        { status: 422 }
      );
    }

    // Check candidate eligibility in latest run (D13)
    const latestRun = store.getLatestMatchRun(params.id);
    const candidate = latestRun?.candidates.find((c) => c.recipientId === recipientId);

    if (!candidate || candidate.group === "excluded" || candidate.isLead) {
      return NextResponse.json(
        {
          error: {
            code: "CANDIDATE_NOT_OFFERABLE",
            message: "Cannot send offer to excluded candidates or unverified leads.",
          },
        },
        { status: 409 }
      );
    }

    const offer = store.createOffer(
      params.id,
      recipientId,
      matchCandidateId || candidate.recipientId,
      acknowledgeUnknowns
    );

    return NextResponse.json({ data: offer }, { status: 201 });
  } catch (err: any) {
    const code = err.message || "INTERNAL";
    const status =
      code === "OFFER_ALREADY_PENDING" || code === "TOO_LATE_FOR_OFFER"
        ? 409
        : 400;

    return NextResponse.json(
      { error: { code, message: err.message || "Failed to create offer." } },
      { status }
    );
  }
}
