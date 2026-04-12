"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CheckSquare, Package, Settings, LogOut, Layers, Users, MessageCircle, FileText, TicketCheck, ScrollText, Calculator } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Clients", href: "/admin/clients", icon: Users },
    { name: "Messages", href: "/admin/messages", icon: MessageCircle },
    { name: "Invoices", href: "/admin/invoices", icon: FileText },
    { name: "Quotations", href: "/admin/quotations", icon: Calculator },
    { name: "Agreements", href: "/admin/agreements", icon: ScrollText },
    { name: "Tickets", href: "/admin/tickets", icon: TicketCheck },
    { name: "Fixed Plans", href: "/admin/plans", icon: Package },
    { name: "Global Features", href: "/admin/features", icon: CheckSquare },
    { name: "Custom Items", href: "/admin/items", icon: Layers },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      <div className="p-6 border-b border-white/5">
        <h2 className="font-space text-2xl font-bold tracking-tight bg-gradient-to-br from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Plans Admin
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`font-outfit text-[13px] uppercase tracking-widest font-bold flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all border ${isActive
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:border-white/10"
                }`}
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="font-outfit text-[13px] font-bold uppercase tracking-widest flex items-center gap-3 px-4 py-3.5 w-full text-left text-zinc-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent hover:text-red-400 rounded-xl transition-all"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
