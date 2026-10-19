import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const recipient = store.getRecipient(params.id);
  if (!recipient) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Recipient not found." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: recipient });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const updates = await req.json();

    const role = user.role === "coordinator" ? "coordinator" : "recipient";
    const updated = store.updateRecipientProfile(params.id, updates, role);

    return NextResponse.json({ data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to update recipient." } },
      { status: 400 }
    );
  }
}
