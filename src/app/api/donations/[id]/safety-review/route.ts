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
        { error: { code: "FORBIDDEN", message: "Only coordinators can review food safety." } },
        { status: 403 }
      );
    }

    const { decision, note } = await req.json();

    if (!decision || (decision !== "eligible_by_review" && decision !== "blocked")) {
      return NextResponse.json(
        { error: { code: "VALIDATION_FAILED", message: "Valid decision required ('eligible_by_review' or 'blocked')." } },
        { status: 422 }
      );
    }

    if (!note || note.trim().length === 0) {
      return NextResponse.json(
        { error: { code: "NOTE_REQUIRED", message: "Justification note is mandatory." } },
        { status: 422 }
      );
    }

    const donation = store.reviewSafety(params.id, decision, note, user.id);
    return NextResponse.json({ data: donation });
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: err.message || "Failed to submit review." } },
      { status: 400 }
    );
  }
}
