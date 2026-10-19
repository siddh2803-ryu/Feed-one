import React from "react";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Feed One Food Rescue Coordination",
  description:
    "Privacy Policy for Feed One, detailing data handling, contact disclosure constraints, and recipient confidentiality standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      {/* Page Header */}
      <div className="border-b border-border pb-6 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-brand-subtle text-brand text-xs font-semibold border border-brand/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Data Governance and Contact Disclosure</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">
          Privacy Policy
        </h1>
        <p className="text-xs text-foreground-muted">
          Last revised: October 19, 2026. Effective immediately across the Feed One platform.
        </p>
      </div>

      {/* Overview Notice */}
      <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Lock className="w-4 h-4 text-brand" />
          <span>Core Privacy Principle: Two-Phase Contact Disclosure</span>
        </div>
        <p className="text-xs text-foreground-muted leading-relaxed">
          Feed One connects commercial food donors with community charities and emergency relief organisations. To safeguard the privacy and physical security of all participants, exact facility addresses, direct telephone numbers, and contact names remain confidential during candidate ranking and offer dispatch. Direct contact credentials are unsealed only after both parties mutually confirm an operational offer.
        </p>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 text-xs text-foreground-muted leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">1</span>
            <span>Information We Collect</span>
          </h2>
          <p>
            Feed One collects operational information strictly necessary to compute constraint feasibility and manage food rescue handoffs:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Donor Profiles:</strong> Business legal name, verified facility address, physical dispatch instructions, authorised representative name, phone number, and operating hours.
            </li>
            <li>
              <strong className="text-foreground">Donation Listings:</strong> Food category, packaging format, quantity (in discrete item counts or kilograms), storage condition requirements, preparation timestamp, safe consumption deadline, and allergen disclosures.
            </li>
            <li>
              <strong className="text-foreground">Recipient Organisation Records:</strong> Organisation legal structure, designated intake coordinators, vehicle and collection capabilities, accepted food categories, cold-chain storage capacity, and recurring collection availability windows.
            </li>
            <li>
              <strong className="text-foreground">Discovery Intelligence:</strong> Public directory entries and publicly available contact points identified during supervised coordinator discovery scans.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">2</span>
            <span>How Contact Information is Disclosed</span>
          </h2>
          <p>
            We strictly enforce architectural boundaries around personal and facility contact disclosure:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
              <span className="font-bold text-foreground block">Pre-Confirmation Phase</span>
              <p className="text-[11px]">
                Recipients reviewing an incoming offer see only the donor generic business name, general locality, approximate straight-line distance, and food specifications. Exact street numbers, access codes, and phone numbers are redacted.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-surface border border-border space-y-1.5">
              <span className="font-bold text-foreground block">Mutual Acceptance Phase</span>
              <p className="text-[11px]">
                When a recipient accepts an offer before the expiration deadline, the system issues a verified pickup pass revealing the exact pickup address, gate instructions, and telephone number directly to both parties.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">3</span>
            <span>Deterministic Matching and Algorithmic Non-Discrimination</span>
          </h2>
          <p>
            Feed One does not sell, broker, or monetize user data. Matching outcomes are evaluated through deterministic constraint satisfaction algorithms (Constraints C1 to C6). Donor listings are never matched based on socioeconomic profiling, arbitrary preferential bias, or unverified black-box scoring. All exclusion criteria are exposed transparently to participants with auditable justification summaries.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">4</span>
            <span>Data Retention and Audit Trails</span>
          </h2>
          <p>
            To fulfill regulatory food safety tracking requirements, immutable event logs are maintained for every listing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Handoff Verification:</strong> Timestamps of offer generation, recipient response, physical collection, and final delivery are recorded permanently for health inspection audits.
            </li>
            <li>
              <strong className="text-foreground">Cancelled Transactions:</strong> Listings cancelled due to safety non-compliance, temperature violations, or missed deadlines retain an unalterable operational reason code.
            </li>
            <li>
              <strong className="text-foreground">Purge Rights:</strong> Organisations may request complete deletion of deactivated operational accounts, excluding transactional audit trails required by public health statutes.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">5</span>
            <span>Security Measures</span>
          </h2>
          <p>
            All network communication requires TLS 1.3 encryption. Operational databases enforce row-level security controls, ensuring donor and recipient personnel only access records relevant to active geographic service zones. Session credentials utilize cryptographically signed tokens with strict expiration thresholds.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-surface-muted flex items-center justify-center text-[11px] font-mono text-foreground font-bold">6</span>
            <span>Contact and Inquiries</span>
          </h2>
          <p>
            For privacy inquiries, audit disclosures, or data deletion requests, contact the Feed One Data Governance Officer at:
          </p>
          <div className="p-3 rounded-lg bg-surface border border-border font-mono text-[11px] text-foreground">
            privacy@feedone.org
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-border flex items-center justify-between text-xs">
        <Link href="/" className="text-brand hover:underline font-semibold">
          Return to Platform Home
        </Link>
        <Link href="/terms" className="text-foreground-muted hover:text-foreground">
          View Terms and Conditions
        </Link>
      </div>
    </div>
  );
}
