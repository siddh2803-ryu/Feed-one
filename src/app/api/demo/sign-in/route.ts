import { NextResponse } from "next/server";
import { DEMO_PERSONAS } from "@/lib/personas";

export async function POST(req: Request) {
  try {
    const { personaKey } = await req.json();
    if (!personaKey || !DEMO_PERSONAS[personaKey]) {
      return NextResponse.json(
        { error: { code: "INVALID_PERSONA", message: "Persona not found." } },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      data: { success: true, persona: DEMO_PERSONAS[personaKey] },
    });

    response.cookies.set("feedone_persona", personaKey, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid request payload." } },
      { status: 400 }
    );
  }
}
