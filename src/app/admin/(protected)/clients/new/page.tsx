import prisma from "@/lib/prisma";
import NewClientClient from "./NewClientClient";

export default async function NewClientPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl">
        <h1 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight text-white">Add New Client</h1>
      </div>

      <NewClientClient plans={plans} />
    </div>
  );
}
