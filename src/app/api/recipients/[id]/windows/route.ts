import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const { windows } = await req.json();

    if (!Array.isArray(windows)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Windows must be an array." } },
        { status: 422 }
      );
    }

    const role = user.role === "coordinator" ? "coordinator" : "recipient";
    const updated = store.updateRecipientProfile(
      params.id,
      { collectionWindows: windows },
      role
    );

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to update windows." } },
      { status: 400 }
    );
  }
}
