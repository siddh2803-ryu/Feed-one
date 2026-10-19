import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (user.role !== "coordinator") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Coordinator access required." } },
      { status: 403 }
    );
  }

  const queue = store.getSafetyQueue();
  return NextResponse.json({ data: queue });
}
