import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { reason } = await req.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: { code: "REASON_REQUIRED", message: "Cancellation reason is mandatory." } },
        { status: 422 }
      );
    }

    const cancelled = store.cancelDonation(
      params.id,
      reason,
      user.role === "coordinator" ? "coordinator" : "donor"
    );

    return NextResponse.json({ data: cancelled });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to cancel donation." } },
      { status: 400 }
    );
  }
}
