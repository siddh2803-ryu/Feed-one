import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchRun = store.runMatchingForDonation(params.id, "manual");
    return NextResponse.json({ data: matchRun });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to re-match candidates." } },
      { status: 400 }
    );
  }
}
