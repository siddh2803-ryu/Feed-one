/**
 * Feed One: Deterministic Seed Data Generator
 * Traceability: Ref §13.1, PRD Appendix A, D11, D14, D17, D18, D21, D29
 *
 * All demo entities are flagged `is_demo = true` and visibly labeled "(demo)".
 * Positioning uses fixed km offsets from configured REGION_CENTER_LAT/LNG.
 * Timings anchor relative to DEMO_ANCHOR (current time rounded to next 5 min).
 */

export interface SeedCoordinate {
  lat: number;
  lng: number;
}

export function computeOffsetCoordinate(
  centerLat: number,
  centerLng: number,
  northKm: number,
  eastKm: number
): SeedCoordinate {
  const lat = centerLat + northKm / 111.32;
  const lng = centerLng + eastKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  return {
    lat: Math.round(lat * 100000) / 100000,
    lng: Math.round(lng * 100000) / 100000,
  };
}

export function computeDemoAnchor(now: Date = new Date()): Date {
  const anchor = new Date(now);
  const minutes = anchor.getMinutes();
  const remainder = 5 - (minutes % 5);
  anchor.setMinutes(minutes + remainder, 0, 0);
  return anchor;
}

export function getZonedTimeParts(date: Date, timezone: string = "UTC") {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short",
  });
  const parts = formatter.formatToParts(date);
  let hour = "00",
    minute = "00",
    weekday = "Mon";
  for (const p of parts) {
    if (p.type === "hour") hour = p.value === "24" ? "00" : p.value;
    if (p.type === "minute") minute = p.value;
    if (p.type === "weekday") weekday = p.value;
  }
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    timeStr: `${hour}:${minute}`,
    dayOfWeek: weekdayMap[weekday] ?? 0,
  };
}

export function buildZonedWindows(
  startDate: Date,
  endDate: Date,
  timezone: string = "UTC",
  provenance: string = "seeded_demo"
) {
  const start = getZonedTimeParts(startDate, timezone);
  const end = getZonedTimeParts(endDate, timezone);

  if (start.dayOfWeek === end.dayOfWeek && start.timeStr < end.timeStr) {
    return [
      {
        dayOfWeek: start.dayOfWeek,
        startTime: start.timeStr,
        endTime: end.timeStr,
        provenance,
      },
    ];
  }

  // Crosses midnight
  return [
    {
      dayOfWeek: start.dayOfWeek,
      startTime: start.timeStr,
      endTime: "23:59",
      provenance,
    },
    {
      dayOfWeek: end.dayOfWeek,
      startTime: "00:00",
      endTime: end.timeStr,
      provenance,
    },
  ];
}

export function generateSeedData(
  centerLat: number = 12.9716,
  centerLng: number = 77.5946,
  now: Date = new Date(),
  timezone: string = process.env.REGION_TIMEZONE || "Asia/Kolkata"
) {
  const anchor = computeDemoAnchor(now);

  const bakeryLoc = computeOffsetCoordinate(centerLat, centerLng, 0, 0);
  const recipALoc = computeOffsetCoordinate(centerLat, centerLng, 2.5, 0);
  const recipBLoc = computeOffsetCoordinate(centerLat, centerLng, 0, 4.2);
  const recipCLoc = computeOffsetCoordinate(centerLat, centerLng, -1.1, 0);
  const leadDLoc = computeOffsetCoordinate(centerLat, centerLng, 0, -3.0);

  // Calculate windows relative to DEMO_ANCHOR (Appendix A)
  // Recipient A: anchor + 0.5h to anchor + 2.5h
  const recipAWindows = buildZonedWindows(
    new Date(anchor.getTime() + 30 * 60000),
    new Date(anchor.getTime() + 150 * 60000),
    timezone
  );

  // Recipient B: anchor + 1.0h to anchor + 2.5h
  const recipBWindows = buildZonedWindows(
    new Date(anchor.getTime() + 60 * 60000),
    new Date(anchor.getTime() + 150 * 60000),
    timezone
  );

  // Recipient C: anchor - 10.0h to anchor - 6.0h
  const recipCWindows = buildZonedWindows(
    new Date(anchor.getTime() - 600 * 60000),
    new Date(anchor.getTime() - 360 * 60000),
    timezone
  );

  const donor = {
    id: "d0000000-0000-4000-8000-000000000001",
    name: "Demo Bakery (demo)",
    donorType: "bakery",
    contactName: "Alex Baker",
    contactPhone: "+00 0000 000 001",
    contactEmail: "alex@example.org",
    verificationStatus: "coordinator_verified",
    isDemo: true,
    location: {
      id: "l0000000-0000-4000-8000-000000000001",
      label: "Main Shop",
      addressText: "10 Bakery Lane, Central (demo)",
      locality: "Central Market",
      lat: bakeryLoc.lat,
      lng: bakeryLoc.lng,
      isDefault: true,
    },
  };

  const recipients = [
    {
      id: "r0000000-0000-4000-8000-000000000001",
      name: "Recipient A (demo)",
      orgType: "community_kitchen",
      recordType: "seeded_demo",
      verificationStatus: "coordinator_verified",
      lat: recipALoc.lat,
      lng: recipALoc.lng,
      locality: "North Quarter",
      serviceRadiusKm: 10,
      acceptedCategories: ["bakery", "produce", "packaged_dry"],
      capacityItems: 15, // fails bread C2
      capacityKg: null,
      canCollect: null, // unknown C4
      isDemo: true,
      windows: recipAWindows,
      provenance: {
        accepted_categories: { level: "seeded_demo" },
        capacity_items: { level: "seeded_demo" },
        location: { level: "seeded_demo" },
      },
    },
    {
      id: "r0000000-0000-4000-8000-000000000002",
      name: "Recipient B (demo)",
      orgType: "shelter",
      recordType: "seeded_demo",
      verificationStatus: "coordinator_verified",
      lat: recipBLoc.lat,
      lng: recipBLoc.lng,
      locality: "East Haven",
      serviceRadiusKm: 10,
      acceptedCategories: [
        "bakery",
        "packaged_dry",
        "produce",
        "cooked_meals",
        "dairy_eggs",
      ],
      capacityItems: 50,
      capacityKg: 30,
      canCollect: true,
      isDemo: true,
      windows: recipBWindows,
      provenance: {
        accepted_categories: { level: "seeded_demo" },
        capacity_items: { level: "seeded_demo" },
        can_collect: { level: "seeded_demo" },
        collection_windows: { level: "seeded_demo" },
        location: { level: "seeded_demo" },
      },
    },
    {
      id: "r0000000-0000-4000-8000-000000000003",
      name: "Recipient C (demo)",
      orgType: "ngo",
      recordType: "seeded_demo",
      verificationStatus: "coordinator_verified",
      lat: recipCLoc.lat,
      lng: recipCLoc.lng,
      locality: "South Park",
      serviceRadiusKm: 10,
      acceptedCategories: ["bakery", "produce"],
      capacityItems: 60,
      capacityKg: null,
      canCollect: true,
      isDemo: true,
      windows: recipCWindows,
      provenance: {
        accepted_categories: { level: "seeded_demo" },
        capacity_items: { level: "seeded_demo" },
        can_collect: { level: "seeded_demo" },
        collection_windows: { level: "seeded_demo" },
        location: { level: "seeded_demo" },
      },
    },
    {
      id: "r0000000-0000-4000-8000-000000000004",
      name: "Community Pantry (demo lead)",
      orgType: "other",
      recordType: "lead",
      verificationStatus: "unverified",
      lat: leadDLoc.lat,
      lng: leadDLoc.lng,
      locality: "West Ward",
      serviceRadiusKm: null,
      acceptedCategories: null,
      capacityItems: null,
      capacityKg: null,
      canCollect: null,
      isDemo: true,
      windows: [],
      publicOpeningHours: "Mon to Sat 10:00 to 19:00",
      provenance: {
        location: { level: "public_source" },
        public_opening_hours: { level: "public_source" },
      },
      websiteUrl: "https://example.org/community-pantry",
    },
  ];

  return {
    anchor: anchor.toISOString(),
    donor,
    recipients,
  };
}
