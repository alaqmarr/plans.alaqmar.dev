import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import ClientsTable from "./ClientsTable";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      plan: true
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl">
        <h1 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight text-white">Manage Clients</h1>
        <Link 
          href="/admin/clients/new" 
          className="font-outfit flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl transition-all font-bold uppercase tracking-widest text-xs md:text-sm shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <Plus size={18} />
          Create Client
        </Link>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
