import prisma from "@/lib/prisma";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      plan: true
    }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl">
        <h1 className="font-outfit text-3xl md:text-3xl font-extrabold tracking-tight text-white">Client Messages</h1>
      </div>

      <MessagesClient clients={clients} />
    </div>
  );
}
