import { format } from "date-fns";

export default function PrintableComparison({ plans, allFeatures }: { plans: any[], allFeatures: any[] }) {
  // Map features to their plans for easy lookup
  const planFeatures = new Map<string, any>();
  plans.forEach(plan => {
    plan.features.forEach((pf: any) => {
      planFeatures.set(`${plan.id}-${pf.featureId}`, pf);
    });
  });

  return (
    <div className="bg-white text-black p-10 min-h-[1100px] flex flex-col relative w-full font-outfit">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-indigo-500 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight uppercase">THE WEB SENSEI</h1>
          <p className="text-sm font-bold text-zinc-500 tracking-widest mt-1 uppercase">Plan Comparison Matrix</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-sm font-medium">Date: {format(new Date(), "dd MMM, yyyy")}</p>
        </div>
      </div>

      <div className="w-full bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden mb-12">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-zinc-200 bg-zinc-100">
              <th className="p-4 text-left font-bold text-zinc-600 uppercase tracking-widest text-xs w-[30%] border-r border-zinc-200">
                Features & Modules
              </th>
              {plans.map(plan => (
                <th key={plan.id} className="p-4 text-center font-bold border-r border-zinc-200 last:border-0 w-[min-content] bg-white">
                  <div className="text-sm text-zinc-800 uppercase tracking-wider mb-2">{plan.name}</div>
                  <div className="font-outfit font-extrabold text-indigo-600 text-lg">
                    {plan.discountPrice ? `₹${plan.discountPrice.toLocaleString('en-IN')}` : `₹${plan.price.toLocaleString('en-IN')}`}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map(feature => {
              // Hide feature if none of the generated plans have it
              const usedInAny = plans.some(plan => planFeatures.has(`${plan.id}-${feature.id}`));
              if (!usedInAny) return null;

              return (
                <tr key={feature.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50">
                  <td className="p-4 text-sm font-bold text-zinc-700 border-r border-zinc-100">
                    {feature.name}
                  </td>
                  {plans.map(plan => {
                    const pf = planFeatures.get(`${plan.id}-${feature.id}`);
                    const isUpgraded = pf?.upgradedById;
                    
                    return (
                      <td key={plan.id} className="p-4 text-center border-r border-zinc-100 last:border-0">
                        {pf ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 ${isUpgraded ? 'bg-indigo-50 text-indigo-600' : ''}`}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            {pf.customValue && <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mt-2">{pf.customValue}</div>}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-zinc-50 text-zinc-300">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-10 border-t border-zinc-200 text-center">
        <p className="text-xs font-medium text-zinc-500 mb-1">Pricing strictly subject to final custom requirements.</p>
        <div className="bg-indigo-900 text-white font-bold tracking-widest text-[10px] uppercase py-2 w-full absolute bottom-0 left-0 text-center">
          THE WEB SENSEI | thewebsensei.in
        </div>
      </div>
    </div>
  );
}
