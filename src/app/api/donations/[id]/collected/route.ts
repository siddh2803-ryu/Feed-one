import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { occurredAt } = await req.json().catch(() => ({}));

    const role =
      user.role === "donor"
        ? "donor"
        : user.role === "recipient"
        ? "recipient"
        : "donor";

    const donation = store.recordCollected(
      params.id,
      occurredAt || new Date().toISOString(),
      role
    );

    return NextResponse.json({ data: donation });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to record collection." } },
      { status: 400 }
    );
  }
}
