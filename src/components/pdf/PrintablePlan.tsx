import { format } from "date-fns";

export default function PrintablePlan({ plan }: { plan: any }) {
  const isCustom = !plan.price;

  return (
    <div className="bg-white text-black p-10 min-h-[1100px] flex flex-col relative w-full font-outfit">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-indigo-500 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight uppercase">THE WEB SENSEI</h1>
          <p className="text-sm font-bold text-zinc-500 tracking-widest mt-1 uppercase">{plan.name} - Plan Details</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-sm font-medium">Date: {format(new Date(), "dd MMM, yyyy")}</p>
          <p className="text-zinc-500 text-sm font-medium">Validity: 30 Days</p>
        </div>
      </div>

      <div className="flex gap-8 mb-10">
        <div className="flex-1 bg-zinc-50 border border-zinc-200 p-8 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2">Plan Details</h2>
          <h3 className="text-3xl font-bold text-zinc-900 mb-4">{plan.name} Package</h3>
          
          <div className="mt-6 border-t border-zinc-200 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Investment</h4>
            {isCustom ? (
               <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">Custom Deal</span>
            ) : (
              <div className="flex gap-4 items-baseline">
                <span className="text-4xl font-extrabold text-indigo-700 tracking-tight">
                  ₹{(plan.discountPrice || plan.price).toLocaleString('en-IN')}
                </span>
                {plan.discountPrice && (
                  <span className="text-lg text-zinc-400 line-through decoration-zinc-300">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Features List */}
      <h3 className="text-xl font-bold text-zinc-800 mb-6 tracking-tight border-b border-zinc-200 pb-2">Included Modules & Features</h3>
      
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {plan.features.map((pf: any, i: number) => {
            const isUpgraded = !!pf.upgradedById;
            return (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${isUpgraded ? 'bg-indigo-50 border border-indigo-100' : 'bg-transparent border border-zinc-100'}`}>
                <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded-full shrink-0 ${isUpgraded ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-zinc-700">{pf.feature.name}</span>
                  {isUpgraded && <span className="text-[9px] ml-2 font-bold uppercase font-outfit tracking-widest bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full relative -top-px">Upgraded</span>}
                  {pf.customValue && (
                    <p className="text-xs text-zinc-500 mt-1 font-medium bg-white px-2 py-0.5 rounded border border-zinc-200 block w-max">{pf.customValue}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-16 pt-10 border-t border-zinc-200 text-center relative z-10">
        <p className="text-xs font-medium text-zinc-500 mb-1">This is a plan summary and not a binding contract. Final pricing may vary.</p>
        <p className="text-xs font-medium text-zinc-500 mb-4">All prices are in Indian Rupees (INR). Taxes may apply as per applicable laws.</p>
        <div className="bg-indigo-900 text-white font-bold tracking-widest text-[10px] uppercase py-2 w-full absolute bottom-0 left-0 text-center">
          THE WEB SENSEI | thewebsensei.in
        </div>
      </div>
      
    </div>
  );
}
