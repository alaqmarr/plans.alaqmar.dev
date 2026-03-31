import prisma from "@/lib/prisma";
import TicketsClient from "./TicketsClient";

export const metadata = {
  title: "Tickets | Admin",
};

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      client: true,
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">Support Tickets</h1>
          <p className="font-outfit text-zinc-400 mt-1">Manage client support requests and issues.</p>
        </div>
      </div>

      <TicketsClient tickets={tickets} clients={clients} />
    </>
  );
}
