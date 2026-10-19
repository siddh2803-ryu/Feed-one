import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";
import { can } from "@/server/authz";

export async function GET() {
  const user = await getCurrentUser();
  const allDonations = store.getDonations();

  // Donor sees own donations, coordinator sees all
  const filtered =
    user.role === "coordinator"
      ? allDonations
      : allDonations.filter((d) => d.donorId === user.donorId);

  return NextResponse.json({ data: filtered });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!can(user, "create_donation")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only donors can create donations." } },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Basic validation
    if (!body.category || !body.title || !body.quantity || !body.unit || !body.pickupDeadline) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Missing mandatory fields." } },
        { status: 422 }
      );
    }

    const availableFrom = body.availableFrom || new Date().toISOString();
    if (new Date(body.pickupDeadline).getTime() <= new Date(availableFrom).getTime()) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "Pickup deadline must be after available-from time.",
          },
        },
        { status: 422 }
      );
    }

    const donation = store.createDonation({
      donorId: user.donorId || "d0000000-0000-4000-8000-000000000001",
      pickupLocationId: body.pickupLocationId || "l0000000-0000-4000-8000-000000000001",
      category: body.category,
      title: body.title,
      description: body.description || "",
      quantity: Number(body.quantity),
      unit: body.unit,
      unitLabel: body.unitLabel || body.unit,
      availableFrom,
      pickupDeadline: body.pickupDeadline,
      pickupInstructions: body.pickupInstructions,
      lat: body.lat ?? 12.9716,
      lng: body.lng ?? 77.5946,
      storageCategory: body.storageCategory || "ambient",
      packagedSealed: Boolean(body.packagedSealed),
      preparedAt: body.preparedAt || new Date().toISOString(),
      useBy: body.useBy || null,
      allergenNotes: body.allergenNotes,
      attestedAt: new Date().toISOString(),
      status: "listed",
      isDemo: true,
    });

    const matchRun = store.getLatestMatchRun(donation.id);

    return NextResponse.json(
      {
        data: {
          donation,
          matchRun,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: err.message || "Failed to create donation." } },
      { status: 500 }
    );
  }
}
