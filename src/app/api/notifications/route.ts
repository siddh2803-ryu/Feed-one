import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  const notifs = store.getNotifications(user.recipientId || user.donorId || undefined);
  return NextResponse.json({ data: notifs });
}

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (id) {
      store.markNotificationRead(id);
    }
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Failed to mark notification read." } },
      { status: 400 }
    );
  }
}
