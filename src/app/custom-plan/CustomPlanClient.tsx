"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Send, ShoppingCart, Briefcase, Check, X, Download } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import CostBreakdownChart from "@/components/CostBreakdownChart";
import { exportReactElementToPdf } from "@/lib/pdfGenerator";
import PrintableQuote from "@/components/pdf/PrintableQuote";

export default function CustomPlanClient({ items, contactEmail, whatsappNumber }: { items: any[], contactEmail: string, whatsappNumber: string }) {
  const [cart, setCart] = useState<{item: any, quantity: number}[]>([]);
  const [tenure, setTenure] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, cartItem) => {
      const itemTotal = cartItem.item.price * cartItem.quantity;
      return sum + (cartItem.item.isOneTime ? itemTotal : itemTotal * tenure);
    }, 0);
  }, [cart, tenure]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find(i => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.item.id !== itemId);
    });
  };

  const selectedCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleEnquiry = async (e: React.FormEvent, viaEmail: boolean) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return alert("Name and Email are required");

    const planSummary = cart.map(c => `${c.item.name} (x${c.quantity})`).join(", ");
    const interest = `Custom Plan for ${tenure} Year${tenure > 1 ? 's' : ''}: ${planSummary}`;

    if (!viaEmail && whatsappNumber) {
      const msg = `Hi! I'm interested in building a custom app.\n\nMy Details:\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nSelected Tenure: ${tenure} Year${tenure > 1 ? 's' : ''}\nSelected Items:\n${planSummary}\n\nEstimated Total: ₹${totalAmount.toLocaleString('en-IN')}\n\nMessage: ${formData.message}`;
      const num = whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plan: interest,
          totalAmount
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setCart([]);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert("Failed to send email enquiry.");
      }
    } catch {
      alert("Error sending enquiry.");
    } finally {
      setSubmitting(false);
      setShowCheckout(false);
    }
  };

  return (
    <div className="relative pt-32 pb-24 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start selection:bg-indigo-500/30">
      
      {/* Ambient Mesh Backgrounds */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Left Column: Items Selection */}
      <div className="flex-1 w-full relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
          <h1 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Custom Plan</span></h1>
          <p className="font-outfit text-zinc-400 text-lg">Select the components you need for your project. Our system will instantly calculate your estimated investment.</p>
        </motion.div>

        {items.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900 rounded-3xl border border-zinc-800">
            <Briefcase size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Items Available</h3>
            <p className="text-zinc-400">Custom items have not been configured yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, i) => {
              const cartItem = cart.find(c => c.item.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id} 
                  className={`p-6 rounded-2xl transition-all duration-300 relative overflow-hidden group border ${qty > 0 ? "bg-indigo-950/20 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]" : "bg-zinc-900/50 backdrop-blur-md border-white/5"} hover:-translate-y-1 hover:border-zinc-700`}
                >
                  {/* Subtle Card Ambient Gradients */}
                  <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px] pointer-events-none mix-blend-screen transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${qty > 0 ? 'bg-indigo-500/40' : 'bg-white/10'}`}></div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h3 className="font-outfit text-xl font-bold text-white tracking-tight leading-tight">{item.name}</h3>
                      <p className="font-space text-indigo-400 font-bold mt-1 tracking-wide">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  {item.description && <p className="text-zinc-400 text-sm h-10 line-clamp-2 leading-relaxed mb-6">{item.description}</p>}
                  
                  <div className="flex items-center justify-between mt-auto relative z-10">
                    {qty > 0 ? (
                      <div className="flex items-center gap-4 bg-zinc-950/80 px-2 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex justify-center items-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"><Minus size={14}/></button>
                        <span className="font-space font-bold text-white w-4 text-center">{qty}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 flex justify-center items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"><Plus size={14}/></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(item)}
                        className="font-outfit w-full py-3 bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold tracking-wide rounded-xl transition-colors flex justify-center items-center gap-2 border border-white/5 backdrop-blur-sm"
                      >
                        <Plus size={18} /> Add Component
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Cart & Checkout */}
      <div className="w-full lg:w-96 sticky top-32 shrink-0 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* subtle interior glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[64px] pointer-events-none mix-blend-screen opacity-20 bg-indigo-500"></div>
          <div className="mb-6 relative z-10">
            <h3 className="font-outfit text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-[0.2em]">Plan Tenure</h3>
            <div className="flex bg-zinc-950/50 backdrop-blur-md p-1 rounded-xl border border-white/5">
              <input
                type="number"
                min="1"
                className="font-space w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600 font-bold text-center text-xl"
                value={tenure}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setTenure(isNaN(val) ? 1 : Math.max(1, val));
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5 relative z-10">
            <ShoppingCart className="text-indigo-400" size={24} />
            <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">Your Package</h2>
            {selectedCount > 0 && (
              <span className="ml-auto bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">{selectedCount}</span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="text-zinc-500 text-center py-12">
              <p>Your custom plan is empty.</p>
              <p className="text-sm mt-2">Select components to start building.</p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(({item, quantity}) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex justify-between items-center bg-zinc-950/40 backdrop-blur-sm p-3.5 rounded-xl border border-white/5"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="font-outfit text-white text-sm font-bold tracking-wide truncate">{item.name}</p>
                        <p className="font-space text-zinc-500 text-xs mt-1">₹{(item.price * tenure).toLocaleString('en-IN')} x {quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-space text-indigo-400 font-bold text-sm">₹{(item.price * quantity * tenure).toLocaleString('en-IN')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>

              <div className="pt-6 border-t border-white/5 relative z-10">
                <div className="flex justify-between items-end mb-8">
                  <span className="font-outfit text-zinc-400 font-bold text-[11px] uppercase tracking-[0.2em]">Estimated Total</span>
                  <span className="font-space text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="font-outfit w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold tracking-widest uppercase text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-indigo-400/30 cursor-pointer"
                >
                  Proceed to Enquiry
                </button>

                <button
                  onClick={async () => {
                    const btn = document.getElementById("dl-quote-btn");
                    const origText = btn ? btn.innerHTML : "";
                    if (btn) btn.innerHTML = '<span class="animate-pulse flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</span>';
                    try {
                      await exportReactElementToPdf(
                        <PrintableQuote cart={cart} tenure={tenure} totalAmount={totalAmount} />, 
                        `THE_WEB_SENSEI_Quote_${Date.now()}.pdf`
                      );
                    } finally {
                      if (btn) btn.innerHTML = origText;
                    }
                  }}
                  id="dl-quote-btn"
                  className="font-outfit w-full py-3 mt-3 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl font-bold tracking-wider uppercase text-xs transition-colors flex items-center justify-center gap-2 border border-white/5 cursor-pointer"
                >
                  <Download size={16} /> Download Quote PDF
                </button>

                <CostBreakdownChart cart={cart} tenure={tenure} totalAmount={totalAmount} />
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Checkout Modal Overlay */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 max-w-lg w-full rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setShowCheckout(false)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8 pr-12">
                <h3 className="font-outfit text-4xl font-extrabold text-white tracking-tight mb-2">Finalize Enquiry</h3>
                <p className="font-outfit text-zinc-400">Provide your details to initiate this custom build. Tenure: <span className="text-white font-bold">{tenure} Year{tenure > 1 && 's'}</span>. Total estimate: <span className="font-space text-indigo-400 font-bold tracking-wide">₹{totalAmount.toLocaleString('en-IN')}</span></p>
              </div>

              {success ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-8 rounded-3xl text-center">
                  <Check size={48} className="mx-auto mb-4 text-emerald-500" />
                  <h4 className="font-outfit text-2xl font-bold mb-2">Enquiry Sent!</h4>
                  <p className="font-outfit text-sm opacity-80">We've received your custom plan requirements and will be in touch shortly.</p>
                </div>
              ) : (
                <form className="space-y-4">
                  <div>
                    <input required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600" placeholder="Full Name *" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <input required type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600" placeholder="Email Address *" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <input type="tel" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all h-32 resize-none placeholder:text-zinc-600" placeholder="Any specific requirements or questions?" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-zinc-800">
                    <button 
                      type="button"
                      onClick={(e) => handleEnquiry(e, true)}
                      disabled={submitting}
                      className="font-outfit flex justify-center items-center gap-2 py-4 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50 border border-white/5"
                    >
                      {submitting ? "Sending..." : <><Send size={16}/> Send Email</>}
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleEnquiry(e, false)}
                      disabled={submitting}
                      className="font-outfit flex justify-center items-center gap-2 py-4 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors disabled:opacity-50"
                    >
                      <WhatsAppIcon size={16}/> WhatsApp
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
