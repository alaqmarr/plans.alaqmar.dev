import prisma from "@/lib/prisma";
import ItemsClient from "./ItemsClient";

export default async function ItemsPage() {
  const items = await prisma.customItem.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl">
        <h1 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight text-white">Manage Custom Plan Items</h1>
      </div>
      <ItemsClient initialItems={items} />
    </div>
  );
}
