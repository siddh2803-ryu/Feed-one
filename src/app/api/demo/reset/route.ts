import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function POST() {
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Demo reset is disabled in production." } },
      { status: 403 }
    );
  }

  store.resetDemo();
  return NextResponse.json({
    data: {
      success: true,
      message: "Demo dataset reset successfully.",
      demoAnchor: store.getDemoAnchor(),
    },
  });
}
