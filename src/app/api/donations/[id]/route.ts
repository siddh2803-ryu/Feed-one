import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  const donation = store.getDonation(params.id);

  if (!donation) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Donation not found." } },
      { status: 404 }
    );
  }

  // Lazy expiry check (D15)
  store.applyExpiries(new Date().toISOString(), { donationId: params.id });

  const refreshedDonation = store.getDonation(params.id)!;
  const matchRun = store.getLatestMatchRun(params.id);
  const pendingOffer = store.getPendingOfferForDonation(params.id);
  const events = store.getLifecycleEvents(params.id);

  // Check privacy rules: contacts revealed only if confirmed or coordinator (D26)
  const isConfirmedOrLater =
    refreshedDonation.status === "confirmed" ||
    refreshedDonation.status === "collected" ||
    refreshedDonation.status === "delivered";

  const isOwner = user.donorId === refreshedDonation.donorId;
  const isCoordinator = user.role === "coordinator";
  const canSeeFullAddress = isOwner || isCoordinator || isConfirmedOrLater;

  return NextResponse.json({
    data: {
      donation: refreshedDonation,
      matchRun,
      pendingOffer,
      events,
      privacy: {
        canSeeFullAddress,
      },
    },
  });
}

export async function PATCH(
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

    if (donation.donorId !== user.donorId && user.role !== "coordinator") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not permitted to edit this donation." } },
        { status: 403 }
      );
    }

    // Locked once offer is sent (D16)
    if (
      donation.status === "awaiting_confirmation" ||
      donation.status === "confirmed" ||
      donation.status === "collected" ||
      donation.status === "delivered"
    ) {
      return NextResponse.json(
        {
          error: {
            code: "LOCKED_STATE",
            message: "Donation cannot be edited while an offer is active or confirmed.",
          },
        },
        { status: 409 }
      );
    }

    const updates = await req.json();
    const updated = store.updateDonation(params.id, updates, user.role as any);

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: err.message || "Failed to edit donation." } },
      { status: 500 }
    );
  }
}
