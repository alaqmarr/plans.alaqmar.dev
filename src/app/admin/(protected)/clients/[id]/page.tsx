import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientDetailClient from "./ClientDetailClient";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      plan: true
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl gap-4">
        <div>
          <h1 className="font-outfit text-3xl md:text-3xl font-extrabold tracking-tight text-white">{client.name}</h1>
          <p className="font-outfit text-zinc-400 text-sm mt-1">{client.plan?.name} • ₹{client.offeredPrice.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <ClientDetailClient client={client} />
    </div>
  );
}
