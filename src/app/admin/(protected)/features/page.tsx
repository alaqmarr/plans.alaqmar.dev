import prisma from "@/lib/prisma";
import FeaturesClient from "./FeaturesClient";

export default async function FeaturesPage() {
  const features = await prisma.feature.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl">
        <h1 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight text-white">Manage Global Features</h1>
      </div>
      <FeaturesClient initialFeatures={features} />
    </div>
  );
}
