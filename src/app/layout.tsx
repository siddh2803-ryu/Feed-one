import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { DemoBanner } from "@/components/feedone/DemoBanner";
import { RoleSwitcher } from "@/components/feedone/RoleSwitcher";
import { getCurrentUser } from "@/server/auth";

export const metadata: Metadata = {
  title: "Feed One | Intelligent Food Rescue & Coordination",
  description:
    "AI-assisted, constraint-based food rescue coordination platform connecting surplus-food donors with eligible recipients.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="bg-bg text-foreground min-h-screen flex flex-col antialiased">
        {/* Demo Mode Banner (FR-ACC-03) */}
        <DemoBanner />

        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-brand-on font-bold text-sm shadow-xs group-hover:bg-brand-hover transition-colors">
                  1
                </div>
                <span className="font-bold text-lg tracking-tight font-display text-foreground">
                  Feed One
                </span>
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
              <RoleSwitcher currentPersona={user.role === "donor" ? "donor" : user.role === "coordinator" ? "coordinator" : "recipient_b"} />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Accessible Footer */}
        <footer className="border-t border-border bg-surface py-6 text-center text-xs text-foreground-muted">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>Feed One Platform — AI-assisted, constraint-based food rescue coordination</div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/demo" className="hover:underline">
                Demo Personas
              </Link>
              <Link href="/coordinator/settings" className="hover:underline">
                Safety Rules S1–S8
              </Link>
              <Link href="/impact" className="hover:underline">
                Honest Metrics
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
