import React from "react";
import Link from "next/link";
import { Package, Inbox, Shield, BarChart3 } from "lucide-react";

export function MobileNav() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around py-2 z-40">
      <Link href="/donor" className="flex flex-col items-center gap-1 text-[10px] text-foreground-muted hover:text-foreground">
        <Package className="w-4 h-4" />
        <span>Donor</span>
      </Link>
      <Link href="/recipient" className="flex flex-col items-center gap-1 text-[10px] text-foreground-muted hover:text-foreground">
        <Inbox className="w-4 h-4" />
        <span>Recipient</span>
      </Link>
      <Link href="/coordinator" className="flex flex-col items-center gap-1 text-[10px] text-foreground-muted hover:text-foreground">
        <Shield className="w-4 h-4" />
        <span>Coordinator</span>
      </Link>
      <Link href="/impact" className="flex flex-col items-center gap-1 text-[10px] text-foreground-muted hover:text-foreground">
        <BarChart3 className="w-4 h-4" />
        <span>Impact</span>
      </Link>
    </div>
  );
}
