import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  const runs = store.getDiscoveryRuns();
  return NextResponse.json({ data: runs });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "coordinator") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Coordinator access required." } },
        { status: 403 }
      );
    }

    const { query, location } = await req.json();
    if (!query || query.trim().length < 3) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Query must be at least 3 characters." } },
        { status: 422 }
      );
    }

    const run = store.createDiscoveryRun(query, location);
    return NextResponse.json({ data: run }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to start discovery." } },
      { status: 400 }
    );
  }
}
