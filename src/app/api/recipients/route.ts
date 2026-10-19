import { NextResponse } from "next/server";
import { store } from "@/server/db/store";

export async function GET() {
  const recipients = store.getRecipients();
  return NextResponse.json({ data: recipients });
}
