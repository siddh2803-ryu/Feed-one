import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "recipient" && user.role !== "coordinator") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Only recipient can record delivery." } },
        { status: 403 }
      );
    }

    const { occurredAt, note } = await req.json().catch(() => ({}));

    const donation = store.recordDelivered(
      params.id,
      occurredAt || new Date().toISOString(),
      note
    );

    return NextResponse.json({ data: donation });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to record delivery." } },
      { status: 400 }
    );
  }
}
