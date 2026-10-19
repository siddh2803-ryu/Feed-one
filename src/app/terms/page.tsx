import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Feed One Food Rescue Coordination",
  description:
    "Terms and Conditions governing donor listings, recipient commitments, safety verification, and liability for Feed One.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      {/* Page Header */}
      <div className="border-b border-border pb-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-subtle text-brand text-xs font-semibold border border-brand/20">
          <Scale className="w-3.5 h-3.5" />
          <span>Operational Agreement and Safety Standards</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          Terms and Conditions
        </h1>
        <p className="text-xs text-foreground-muted">
          Last revised: October 19, 2026. Effective for all registered donors, recipients, and operating personnel.
        </p>
      </div>

      {/* Scope Alert */}
      <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>Binding Feasibility and Food Safety Covenant</span>
        </div>
        <p className="text-xs text-foreground-muted leading-relaxed">
          Feed One operates as a constraint-based food rescue coordination utility. By submitting a surplus donation or accepting a rescue dispatch offer, participating organisations agree to adhere strictly to food hygiene standards, timely collection commitments, and mandatory physical verification procedures at the point of handover.
        </p>
      </div>

      {/* Detailed Agreement Sections */}
      <div className="space-y-8 text-xs text-foreground-muted leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">1</span>
            <span>Donor Warranties and Attestations</span>
          </h2>
          <p>
            Commercial food donors listing surplus inventory on Feed One represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Accurate Declarations:</strong> All listed quantities, packaging conditions, preparation times, and use-by limits accurately reflect the physical state of the food.
            </li>
            <li>
              <strong className="text-foreground">Storage Integrity:</strong> Food has been stored, cooled, or frozen in accordance with applicable municipal food hygiene regulations until the moment of pickup.
            </li>
            <li>
              <strong className="text-foreground">Allergen and Ingredient Notice:</strong> Known priority allergens (including gluten, dairy, peanuts, tree nuts, soy, and eggs) are communicated clearly on packages or listing descriptions.
            </li>
            <li>
              <strong className="text-foreground">Good Faith Donation:</strong> All donations are offered free of charge in good faith under applicable Good Samaritan food donation protection statutes.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">2</span>
            <span>Recipient Commitments and Logistics</span>
          </h2>
          <p>
            Recipient charitable organisations receiving and accepting dispatch offers agree to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Strict Collection Adherence:</strong> Maintain transport readiness to collect confirmed donations within the designated operating window before the pickup deadline expires.
            </li>
            <li>
              <strong className="text-foreground">Capacity Verification:</strong> Confirm sufficient vehicle space, volunteer personnel, and onsite refrigeration before accepting an allocation.
            </li>
            <li>
              <strong className="text-foreground">Zero Resale Policy:</strong> Food received through the Feed One platform must be distributed directly to community members experiencing food insecurity at zero cost, with zero resale or commercial reuse.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">3</span>
            <span>Mandatory Physical Handover Verification</span>
          </h2>
          <p>
            Algorithmic feasibility screening (Constraints C1 to C6 and Safety Rules S1 to S8) provides preliminary routing eligibility. It does not replace physical inspection. At the moment of physical exchange:
          </p>
          <div className="p-3.5 rounded-lg bg-surface border border-border space-y-2">
            <p className="font-semibold text-foreground">
              Inspection and Refusal Protocol:
            </p>
            <p>
              The recipient representative must examine packaging integrity, visual appearance, temperature status, and odor before loading items. Either party retains the absolute right to cancel the handover without penalty if food conditions fail basic sensory inspection or exceed safe thermal parameters.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">4</span>
            <span>Offer Lifecycles and Expirations</span>
          </h2>
          <p>
            Feed One enforces sequential offer dispatching with hard deadlines to prevent inventory hoarding and food degradation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Sequential Offers:</strong> Offers are extended to candidate recipients one organisation at a time, governed by explicit respond-by windows (typically 15 to 30 minutes).
            </li>
            <li>
              <strong className="text-foreground">Automatic Expiry:</strong> Offers not accepted prior to expiration return automatically to the candidate pool for routing to the next feasible recipient.
            </li>
            <li>
              <strong className="text-foreground">Late Offer Guard:</strong> The system prohibits dispatching offers when the available window until final pickup falls below the minimum viable response threshold.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">5</span>
            <span>Platform Role and Limitation of Liability</span>
          </h2>
          <p>
            Feed One is a digital coordination and dispatch infrastructure platform. Feed One does not operate transport fleets, store food inventory, or employ food testing personnel. To the maximum extent permitted under applicable law, Feed One disclaims liability for transit delays, equipment failures, thermal deviations outside platform custody, or indirect losses arising from voluntary participation in food redistribution activities.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">6</span>
            <span>Termination and Suspension</span>
          </h2>
          <p>
            Coordinators may immediately suspend access for organisations that repeatedly fail to attend confirmed pickups, misrepresent food condition or safety attestations, or violate community dignity standards during field operations.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">7</span>
            <span>Governing Law and Modifications</span>
          </h2>
          <p>
            These Terms are governed by regional food recovery statutes and commercial liability regulations. We may update operational parameters as safety standards evolve. Continued participation following notice of revision constitutes acceptance.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-border flex items-center justify-between text-xs">
        <Link href="/" className="text-brand hover:underline font-semibold">
          Return to Platform Home
        </Link>
        <Link href="/privacy" className="text-foreground-muted hover:text-foreground">
          View Privacy Policy
        </Link>
      </div>
    </div>
  );
}
