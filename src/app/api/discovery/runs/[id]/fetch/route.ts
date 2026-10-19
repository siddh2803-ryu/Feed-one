import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { getCurrentUser } from "@/server/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "coordinator") {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Coordinator access required." } },
        { status: 403 }
      );
    }

    const { urls } = await req.json();
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Select at least 1 URL to fetch." } },
        { status: 422 }
      );
    }

    const run = store.fetchDiscoveryUrls(params.id, urls);
    return NextResponse.json({ data: run });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to fetch URLs." } },
      { status: 400 }
    );
  }
}
