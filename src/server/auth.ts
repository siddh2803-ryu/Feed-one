/**
 * Feed One Server: Session & Demo Persona Resolver
 * Traceability: PRD §5.1, D11
 */

import { cookies, headers } from "next/headers";
import { AuthUser } from "./authz";
import { DEMO_PERSONAS } from "@/lib/personas";

export async function getCurrentUser(): Promise<AuthUser> {
  const cookieStore = cookies();
  const headerStore = headers();

  const userKey =
    headerStore.get("x-demo-user-id") ||
    cookieStore.get("feedone_persona")?.value ||
    "donor";

  const persona = DEMO_PERSONAS[userKey] || DEMO_PERSONAS.donor;

  return {
    id: persona.id,
    role: persona.role,
    donorId: persona.donorId,
    recipientId: persona.recipientId,
    isDemo: true,
  };
}
