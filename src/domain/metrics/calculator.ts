/**
 * Feed One Domain: Honest Impact Metrics Calculator
 * Traceability: Ref §15, PRD §7.7, BR-MET, D4, Q7
 *
 * Honest reporting principle: Computes metrics only from recorded events.
 * Never outputs estimated meals, CO2 avoided, or fabricated economic claims.
 */

export interface DonationMetricRecord {
  id: string;
  unit: "items" | "kg";
  quantity: number;
  status: string;
  isDemo: boolean;
  createdAt: string;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
  expiredAt?: string | null;
  cancelledAt?: string | null;
  statusReason?: string | null;
  hadAcceptedOffer?: boolean;
}

export interface MetricSummary {
  scope: "demo" | "real" | "all";
  donationsListed: number;
  donationsDelivered: number;
  foodRedistributedItems: number;
  foodRedistributedKg: number;
  meanTimeToConfirmedMatchMinutes: number | null;
  medianTimeToConfirmedMatchMinutes: number | null;
  unsuccessfulOutcomes: {
    pickupExpiredNeverConfirmed: number;
    pickupExpiredConfirmedNotCollected: number;
    cancelledByReason: Record<string, number>;
  };
}

export function calculateMetrics(
  donations: DonationMetricRecord[],
  scope: "demo" | "real" | "all" = "all"
): MetricSummary {
  // Apply data-scope filtering
  const filtered = donations.filter((d) => {
    if (scope === "demo") return d.isDemo;
    if (scope === "real") return !d.isDemo;
    return true;
  });

  const donationsListed = filtered.length;

  const deliveredDonations = filtered.filter((d) => d.status === "delivered");
  const donationsDelivered = deliveredDonations.length;

  let foodRedistributedItems = 0;
  let foodRedistributedKg = 0;

  for (const d of deliveredDonations) {
    if (d.unit === "items") {
      foodRedistributedItems += d.quantity;
    } else if (d.unit === "kg") {
      foodRedistributedKg += d.quantity;
    }
  }

  // Calculate time to confirmed match
  const matchDurationsMinutes: number[] = [];
  for (const d of filtered) {
    if (d.confirmedAt) {
      const created = new Date(d.createdAt).getTime();
      const confirmed = new Date(d.confirmedAt).getTime();
      if (confirmed >= created) {
        matchDurationsMinutes.push((confirmed - created) / 60000);
      }
    }
  }

  let meanTimeToConfirmedMatchMinutes: number | null = null;
  let medianTimeToConfirmedMatchMinutes: number | null = null;

  if (matchDurationsMinutes.length > 0) {
    const sum = matchDurationsMinutes.reduce((acc, v) => acc + v, 0);
    meanTimeToConfirmedMatchMinutes =
      Math.round((sum / matchDurationsMinutes.length) * 10) / 10;

    matchDurationsMinutes.sort((a, b) => a - b);
    const mid = Math.floor(matchDurationsMinutes.length / 2);
    medianTimeToConfirmedMatchMinutes =
      matchDurationsMinutes.length % 2 !== 0
        ? Math.round(matchDurationsMinutes[mid] * 10) / 10
        : Math.round(
            ((matchDurationsMinutes[mid - 1] + matchDurationsMinutes[mid]) / 2) *
              10
          ) / 10;
  }

  // Unsuccessful outcomes
  let pickupExpiredNeverConfirmed = 0;
  let pickupExpiredConfirmedNotCollected = 0;
  const cancelledByReason: Record<string, number> = {};

  for (const d of filtered) {
    if (d.status === "pickup_expired") {
      if (d.hadAcceptedOffer) {
        pickupExpiredConfirmedNotCollected++;
      } else {
        pickupExpiredNeverConfirmed++;
      }
    } else if (d.status === "cancelled") {
      const reason = d.statusReason || "unspecified";
      cancelledByReason[reason] = (cancelledByReason[reason] || 0) + 1;
    }
  }

  return {
    scope,
    donationsListed,
    donationsDelivered,
    foodRedistributedItems: Math.round(foodRedistributedItems),
    foodRedistributedKg: Math.round(foodRedistributedKg * 10) / 10,
    meanTimeToConfirmedMatchMinutes,
    medianTimeToConfirmedMatchMinutes,
    unsuccessfulOutcomes: {
      pickupExpiredNeverConfirmed,
      pickupExpiredConfirmedNotCollected,
      cancelledByReason,
    },
  };
}
