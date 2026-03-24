import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const plansCount = await prisma.plan.count();
  const featuresCount = await prisma.feature.count();

  return (
    <div className="space-y-8">
      <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-white">Dashboard Summary</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-2xl hover:border-indigo-500/50 transition-colors">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/40 transition-colors"></div>
          <h3 className="font-outfit text-zinc-400 font-bold text-sm uppercase tracking-widest mb-4">Total Plans</h3>
          <p className="font-space text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 leading-none">{plansCount}</p>
        </div>
        
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-2xl hover:border-blue-500/50 transition-colors">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/40 transition-colors"></div>
          <h3 className="font-outfit text-zinc-400 font-bold text-sm uppercase tracking-widest mb-4">Total Features</h3>
          <p className="font-space text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 leading-none">{featuresCount}</p>
        </div>
      </div>
    </div>
  );
}
