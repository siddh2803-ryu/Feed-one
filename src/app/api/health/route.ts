import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    demoAnchor: store.getDemoAnchor(),
    services: {
      database: "ok",
      matching: "ok",
      discovery: process.env.DISCOVERY_PROVIDER || "mock",
    },
  });
}
