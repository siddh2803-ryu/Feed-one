import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoBanner } from "@/components/feedone/DemoBanner";
import { RoleSwitcher } from "@/components/feedone/RoleSwitcher";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Feed One | Production Food Rescue Coordination",
  description:
    "Feasibility-first, constraint-based food rescue coordination platform connecting surplus food donors with verified recipient organisations.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="bg-bg text-foreground min-h-screen flex flex-col antialiased">
        {/* Demo Mode Banner (FR-ACC-03) */}
        <DemoBanner />

        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-brand-on font-bold text-sm shadow-xs group-hover:bg-brand-hover transition-colors">
                  1
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight font-display text-foreground leading-none">
                    Feed One
                  </span>
                  <span className="text-[10px] text-foreground-muted font-medium tracking-tight">
                    Food Rescue Infrastructure
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-foreground-muted">
                <Link
                  href="/donor"
                  className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-surface-muted transition-colors"
                >
                  Donor
                </Link>
                <Link
                  href="/recipient"
                  className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-surface-muted transition-colors"
                >
                  Recipient
                </Link>
                <Link
                  href="/coordinator"
                  className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-surface-muted transition-colors"
                >
                  Coordinator
                </Link>
                <Link
                  href="/impact"
                  className="px-3 py-1.5 rounded-md hover:text-foreground hover:bg-surface-muted transition-colors"
                >
                  Impact
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <RoleSwitcher
                currentPersona={
                  user.role === "donor"
                    ? "donor"
                    : user.role === "coordinator"
                    ? "coordinator"
                    : "recipient_b"
                }
              />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Production Footer */}
        <footer className="border-t border-border bg-surface mt-auto text-xs text-foreground-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Col 1: Platform Overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-brand flex items-center justify-center text-brand-on font-bold text-xs">
                    1
                  </div>
                  <span className="font-bold text-sm text-foreground font-display">
                    Feed One
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted leading-relaxed">
                  Deterministic, feasibility-first surplus food dispatch. Evaluating operational constraints, cold-chain safety rules, and confirmed collection windows.
                </p>
              </div>

              {/* Col 2: Operational Portals */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Operational Portals
                </h4>
                <ul className="space-y-1 text-[11px]">
                  <li>
                    <Link href="/donor" className="hover:text-brand hover:underline">
                      Donor Dispatch Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/recipient" className="hover:text-brand hover:underline">
                      Recipient Response Inbox
                    </Link>
                  </li>
                  <li>
                    <Link href="/coordinator" className="hover:text-brand hover:underline">
                      Coordinator Command Center
                    </Link>
                  </li>
                  <li>
                    <Link href="/impact" className="hover:text-brand hover:underline">
                      Honest Impact Metrics
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Architecture and Safety
                </h4>
                <ul className="space-y-1 text-[11px]">
                  <li>
                    <Link href="/coordinator/settings" className="hover:text-brand hover:underline">
                      Safety Rules S1 to S8
                    </Link>
                  </li>
                  <li>
                    <Link href="/coordinator/directory" className="hover:text-brand hover:underline">
                      Directory Provenance Hierarchy
                    </Link>
                  </li>
                  <li>
                    <Link href="/coordinator/discovery" className="hover:text-brand hover:underline">
                      Public Web Discovery Queue
                    </Link>
                  </li>
                  <li>
                    <Link href="/demo" className="hover:text-brand hover:underline">
                      Demo Persona Switcher
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 4: Compliance & Legal */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Compliance and Legal
                </h4>
                <ul className="space-y-1 text-[11px]">
                  <li>
                    <Link href="/privacy" className="hover:text-brand hover:underline font-medium text-foreground">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-brand hover:underline font-medium text-foreground">
                      Terms and Conditions
                    </Link>
                  </li>
                  <li>
                    <span className="text-[11px] text-foreground-muted">
                      Two-Phase Contact Disclosure (D26)
                    </span>
                  </li>
                  <li>
                    <span className="text-[11px] text-foreground-muted">
                      No Fabricated Carbon Claims (BR-MET)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
              <div>
                Feed One Platform: Feasibility-first food rescue coordination utility.
              </div>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:underline">
                  Terms
                </Link>
                <span>•</span>
                <Link href="/impact" className="hover:underline">
                  Verified Data
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
