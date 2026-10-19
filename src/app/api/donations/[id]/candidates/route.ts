import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const matchRun = store.getLatestMatchRun(params.id);

  if (!matchRun) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No match run found for this donation." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: matchRun });
}
