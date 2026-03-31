"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Smartphone, Building2, CreditCard, Copy, Link as LinkIcon, BadgeCheck } from "lucide-react";

export default function PublicTrackerClient({ client, settings }: { client: any; settings: any }) {
  let paymentStructure: any[] = [];
  try { paymentStructure = JSON.parse(client.paymentStructure || "[]"); } catch {}

  const currentDueIdx = paymentStructure.findIndex(s => !s.isPaid);
  const totalPaid = paymentStructure.filter(s => s.isPaid).reduce((sum, s) => sum + s.amount, 0);
  const totalAmount = client.offeredPrice;
  const progressPercent = Math.min(100, Math.round((totalPaid / totalAmount) * 100)) || 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  const isCompleted = currentDueIdx === -1;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Profile */}
      <div className="text-center space-y-4">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Welcome, {client.name}
        </h1>
        <p className="font-outfit text-zinc-400 max-w-2xl mx-auto text-lg">
          Track the development progress and payment milestones for your <strong className="text-white">{client.plan?.name}</strong>.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="text-xs font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-2">Total Paid</div>
          <div className="text-3xl font-outfit font-extrabold text-white mb-4">₹{totalPaid.toLocaleString('en-IN')} <span className="text-base text-zinc-500 font-medium">/ ₹{totalAmount.toLocaleString('en-IN')}</span></div>
          
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex items-center">
          <div>
            <div className="text-xs font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-2">Status</div>
            {isCompleted ? (
              <div className="flex items-center gap-3 text-emerald-400">
                <BadgeCheck size={36} />
                <span className="font-outfit text-2xl font-bold">Payments Complete</span>
              </div>
            ) : (
              <div className="font-outfit text-2xl font-bold text-white">
                Next Installment: <span className="text-amber-400">₹{paymentStructure[currentDueIdx]?.amount.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Payment Timeline */}
        <div className="lg:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative shadow-2xl">
          <h3 className="font-outfit text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
            <CreditCard className="text-indigo-400" /> Milestone Tracker
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-white/5 before:to-transparent">
            {paymentStructure.map((step, idx) => {
              const isPaid = step.isPaid;
              const isActive = idx === currentDueIdx;

              return (
                <div key={idx} className={`relative flex gap-6 ${isActive ? 'opacity-100' : isPaid ? 'opacity-70' : 'opacity-40'}`}>
                  {/* Dot */}
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full border-4 border-[#121214] shrink-0 z-10 transition-colors
                    ${isPaid ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                    {isPaid ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-outfit font-bold text-white text-lg">{step.name}</h4>
                        <div className={`font-outfit font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                           ₹{step.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      
                      {isPaid ? (
                        <div className="flex items-center justify-between mt-4">
                          <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-bold uppercase tracking-wider">Paid</span>
                          {step.screenshotUrl && (
                            <a href={step.screenshotUrl} target="_blank" rel="noreferrer" className="text-xs font-outfit text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
                              <LinkIcon size={14} /> View Receipt
                            </a>
                          )}
                        </div>
                      ) : isActive && (
                        <div className="mt-5 pt-5 border-t border-white/5 animate-in fade-in">
                          <p className="text-sm font-outfit text-zinc-400 mb-4">Please transfer the due amount using any preferred UPI app or manual bank transfer below to unlock the next milestone.</p>
                          
                          {settings.upiId ? (
                            <a 
                              href={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.bankAccountName || "Alaqmar IT Solutions")}&am=${step.amount}&cu=INR`}
                              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-xl font-outfit font-bold rounded-xl transition-all shadow-lg shadow-[#4285F4]/20"
                            >
                              <Smartphone size={18} /> Pay ₹{step.amount} via UPI App
                            </a>
                          ) : (
                            <div className="text-xs font-outfit text-amber-500">UPI payment not configured. Use bank details.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank & Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative shadow-2xl">
            <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
              <Building2 className="text-indigo-400" /> Bank Transfer
            </h3>
            
            <div className="space-y-4">
              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">Account Name</div>
                  <div className="font-outfit font-medium text-white">{settings.bankAccountName || "Alaqmar IT Solutions"}</div>
                </div>
                <button onClick={() => handleCopy(settings.bankAccountName || "Alaqmar IT Solutions")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>

              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">Account Number</div>
                  <div className="font-outfit font-medium text-white text-lg tracking-wider">{settings.bankAccountNumber || "Not configured"}</div>
                </div>
                <button onClick={() => handleCopy(settings.bankAccountNumber || "")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>

              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">IFSC Code</div>
                  <div className="font-outfit font-medium text-white tracking-widest uppercase">{settings.bankIfsc || "Not configured"}</div>
                </div>
                <button onClick={() => handleCopy(settings.bankIfsc || "")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>
              
              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">UPI ID</div>
                  <div className="font-outfit font-medium text-indigo-400">{settings.upiId || "Not configured"}</div>
                </div>
                <button onClick={() => handleCopy(settings.upiId || "")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>
            </div>
            
            <p className="text-xs font-outfit text-zinc-500 mt-6 leading-relaxed">
              If you pay manually via Bank IMPS/NEFT, please Whatsapp the screenshot to the team so we can update your tracking portal.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
