/**
 * Feed One: Demo Personas Definition (Client-Safe)
 * Traceability: PRD §5.1, D11
 */

export interface DemoPersona {
  id: string;
  key: string;
  name: string;
  role: "donor" | "recipient" | "coordinator";
  donorId?: string;
  recipientId?: string;
  description: string;
  targetPath: string;
}

export const DEMO_PERSONAS: Record<string, DemoPersona> = {
  donor: {
    id: "d0000000-0000-4000-8000-000000000001",
    key: "donor",
    name: "Demo Bakery (demo)",
    role: "donor",
    donorId: "d0000000-0000-4000-8000-000000000001",
    description: "Bakery donor listing fresh surplus bread & baked goods",
    targetPath: "/donor",
  },
  recipient_b: {
    id: "r0000000-0000-4000-8000-000000000002",
    key: "recipient_b",
    name: "Recipient B (demo)",
    role: "recipient",
    recipientId: "r0000000-0000-4000-8000-000000000002",
    description: "Shelter with capacity 50 items and evening collection window",
    targetPath: "/recipient",
  },
  recipient_a: {
    id: "r0000000-0000-4000-8000-000000000001",
    key: "recipient_a",
    name: "Recipient A (demo)",
    role: "recipient",
    recipientId: "r0000000-0000-4000-8000-000000000001",
    description: "Community kitchen with limited capacity (15 items)",
    targetPath: "/recipient",
  },
  recipient_c: {
    id: "r0000000-0000-4000-8000-000000000003",
    key: "recipient_c",
    name: "Recipient C (demo)",
    role: "recipient",
    recipientId: "r0000000-0000-4000-8000-000000000003",
    description: "NGO closest to donor (1.1km) but with morning-only window",
    targetPath: "/recipient",
  },
  coordinator: {
    id: "c0000000-0000-4000-8000-000000000001",
    key: "coordinator",
    name: "Demo Coordinator (demo)",
    role: "coordinator",
    description: "Platform operator overseeing safety review & discovery",
    targetPath: "/coordinator",
  },
};
