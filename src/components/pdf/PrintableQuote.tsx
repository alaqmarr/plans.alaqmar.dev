import { format } from "date-fns";

export default function PrintableQuote({
  cart,
  tenure,
  totalAmount,
  formData
}: {
  cart: any[],
  tenure: number,
  totalAmount: number,
  formData?: any
}) {
  return (
    <div className="p-10 min-h-[1100px] flex flex-col relative w-full font-outfit" style={{ backgroundColor: '#ffffff', color: '#000000' }}>

      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-indigo-500 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-900 tracking-tight uppercase">THE WEB SENSEI</h1>
          <p className="text-sm font-bold text-zinc-500 tracking-widest mt-1 uppercase">Custom Plan Quote</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-sm font-medium">Date: {format(new Date(), "dd MMM, yyyy")}</p>
          <p className="text-zinc-500 text-sm font-medium">Validity: 30 Days</p>
        </div>
      </div>

      {/* Client Info (If provided) */}
      {formData?.name && (
        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 block">Prepared For</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-lg text-zinc-800">{formData.name}</p>
              {formData.email && <p className="text-sm text-zinc-600 font-medium">{formData.email}</p>}
              {formData.phone && <p className="text-sm text-zinc-600 font-medium">{formData.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Development Tenure</p>
              <p className="font-bold text-indigo-600 text-xl">{tenure} Months</p>
            </div>
          </div>
        </div>
      )}

      {/* Quote Summary Table */}
      <h3 className="text-xl font-bold text-zinc-800 mb-4 tracking-tight border-b border-zinc-200 pb-2">Project Scope & Features</h3>

      <div className="flex-1">
        <div className="rounded-xl border border-zinc-200 overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-zinc-600 text-xs uppercase tracking-widest">
                <th className="py-4 px-6 font-bold w-1/2 border-b border-zinc-200">Modules / Features</th>
                <th className="py-4 px-6 font-bold text-center border-b border-zinc-200">Qty</th>
                <th className="py-4 px-6 font-bold text-right border-b border-zinc-200">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700">
              {cart.map((c, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm">{c.item.name}</div>
                    {c.item.isOneTime && <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full mt-1 inline-block">One-Time Fee</span>}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-sm">{c.quantity}</td>
                  <td className="py-4 px-6 text-right font-medium text-sm">₹{c.item.price.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Subtotals */}
        <div className="flex justify-end pt-4">
          <div className="w-1/2 max-w-[400px]">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">Total Investment</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-4xl font-extrabold text-indigo-700 tracking-tight">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-10 border-t border-zinc-200 text-center">
        <p className="text-xs font-medium text-zinc-500 mb-1">This is an estimated quote and not a binding contract. Final pricing may vary based on project scope.</p>
        <p className="text-xs font-medium text-zinc-500 mb-4">All prices are in Indian Rupees (INR). Taxes may apply as per applicable laws.</p>
        <div className="bg-indigo-900 text-white font-bold tracking-widest text-[10px] uppercase py-2 w-full absolute bottom-0 left-0 text-center">
          THE WEB SENSEI | https://alaqmar.dev
        </div>
      </div>
    </div>
  );
}
