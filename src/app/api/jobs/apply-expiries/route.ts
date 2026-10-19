import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function POST(req: Request) {
  const secretHeader = req.headers.get("x-job-secret");
  const expectedSecret = process.env.JOB_SECRET || "feed-one-local-job-secret";

  if (secretHeader && secretHeader !== expectedSecret) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid job secret." } },
      { status: 401 }
    );
  }

  const result = store.applyExpiries(new Date().toISOString());

  return NextResponse.json({
    data: {
      success: true,
      timestamp: new Date().toISOString(),
      expiredOffersCount: result.expiredOffersCount,
      expiredDonationsCount: result.expiredDonationsCount,
    },
  });
}
