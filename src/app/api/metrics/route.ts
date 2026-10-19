import { NextResponse } from "next/server";
import { store } from "@/server/db/store";
import { calculateMetrics, DonationMetricRecord } from "@/domain/metrics/calculator";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = (url.searchParams.get("scope") as "demo" | "real" | "all") || "demo";

  const allDonations = store.getDonations();
  const metricRecords: DonationMetricRecord[] = allDonations.map((d) => {
    const events = store.getLifecycleEvents(d.id);
    const hadAcceptedOffer = events.some((e) => e.eventType === "offer_accepted");

    return {
      id: d.id,
      unit: d.unit,
      quantity: d.quantity,
      status: d.status,
      isDemo: d.isDemo,
      createdAt: d.createdAt,
      confirmedAt: d.confirmedAt,
      deliveredAt: d.deliveredAt,
      expiredAt: d.expiredAt,
      cancelledAt: d.cancelledAt,
      statusReason: d.statusReason,
      hadAcceptedOffer,
    };
  });

  const summary = calculateMetrics(metricRecords, scope);
  return NextResponse.json({ data: summary });
}
