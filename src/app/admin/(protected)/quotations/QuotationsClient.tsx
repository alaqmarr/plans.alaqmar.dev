"use client";

import { useState, useMemo } from "react";
import { Copy, Plus, Trash2, Download, RefreshCw, Save } from "lucide-react";
import toast from "react-hot-toast";
import { downloadQuotationPdf } from "@/lib/pdfGenerator";
import { createQuotation } from "@/app/actions/quotations";
import { useRouter } from "next/navigation";

interface QuoteItem {
    id: string;
    description: string;
    basePrice: number;
    discountPercent: number;
    finalPrice: number;
}

export default function QuotationsClient({ 
    plans, 
    adminSignatureUrl, 
    adminSignatoryName 
}: { 
    plans: any[],
    adminSignatureUrl?: string | null,
    adminSignatoryName?: string | null
}) {
    const router = useRouter();

    const [clientName, setClientName] = useState("");
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [advanceAmount, setAdvanceAmount] = useState<number>(0);
    const [tenureYears, setTenureYears] = useState<number>(1);
    const [paymentTerms, setPaymentTerms] = useState<{name: string; percent: number}[]>([]);

    const [items, setItems] = useState<QuoteItem[]>([]);
    const [quoteNumber] = useState(`Q-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    const [isSaving, setIsSaving] = useState(false);

    const activePlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

    const doGenerate = (planToUse: any, targetTotal: number, targetAdvance: number) => {
        if (!planToUse) return;
        if (!targetTotal || !targetAdvance) return;

        const includedFeatures = planToUse.features?.filter((pf: any) => pf.isIncluded) || [];
        if (includedFeatures.length === 0) return toast.error("Plan has no included features");

        const tenure = planToUse.tenureYears || 1;

        let serverIdx = includedFeatures.findIndex((pf: any) => {
            const name = (pf.feature?.name || "").toLowerCase();
            return name.includes('server') || name.includes('hosting') || name.includes('advance');
        });
        if (serverIdx === -1) serverIdx = 0;

        const newItems: QuoteItem[] = [];

        const serverFeature = includedFeatures[serverIdx];
        const serverFp = serverFeature.feature?.price || 0;
        const serverBasePrice = serverFeature.feature?.isOneTime ? serverFp : serverFp * tenure;

        newItems.push({
            id: Math.random().toString(36).substr(2, 9),
            description: serverFeature.feature?.name || "Server / Advance",
            basePrice: serverBasePrice > 0 ? serverBasePrice : targetAdvance,
            discountPercent: serverBasePrice > 0 ? Number(Math.max(0, (((serverBasePrice - targetAdvance) / serverBasePrice) * 100)).toFixed(2)) : 0,
            finalPrice: targetAdvance
        });

        const remainingFeatures = includedFeatures.filter((_: any, idx: number) => idx !== serverIdx);
        const remainingTotal = Math.max(0, targetTotal - targetAdvance);

        const totalRemainingBasePrices = remainingFeatures.reduce((sum: number, pf: any) => {
            const fp = pf.feature?.price || 0;
            return sum + (pf.feature?.isOneTime ? fp : fp * tenure);
        }, 0);

        let tempFinalSum = 0;

        remainingFeatures.forEach((pf: any, idx: number) => {
            const isLast = (idx === remainingFeatures.length - 1);
            const fp = pf.feature?.price || 0;
            let itemBasePrice = pf.feature?.isOneTime ? fp : fp * tenure;

            if (itemBasePrice === 0) {
                itemBasePrice = totalRemainingBasePrices > 0 ? 0 : (remainingTotal / remainingFeatures.length);
            }

            const allocatedFinal = isLast 
                ? Math.max(0, remainingTotal - tempFinalSum) 
                : Math.round((itemBasePrice / (totalRemainingBasePrices || 1)) * remainingTotal);
            
            tempFinalSum += allocatedFinal;

            let finalBase = itemBasePrice;
            if (allocatedFinal > finalBase) {
                finalBase = allocatedFinal;
            }

            const actualDiscount = finalBase > 0 ? ((finalBase - allocatedFinal) / finalBase) * 100 : 0;

            newItems.push({
                id: Math.random().toString(36).substr(2, 9),
                description: pf.feature?.name || "Feature",
                basePrice: finalBase,
                discountPercent: Number(actualDiscount.toFixed(2)),
                finalPrice: allocatedFinal
            });
        });

        setItems(newItems);
    };

    const handleGenerate = () => {
        if (!activePlan) return toast.error("Select a plan first");
        if (!totalPrice || !advanceAmount) return toast.error("Enter Total and Advance Amounts");
        doGenerate(activePlan, totalPrice, advanceAmount);
    };

    const handleItemChange = (id: string, field: keyof QuoteItem, value: string) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            const numValue = parseFloat(value) || 0;
            let { basePrice, discountPercent, finalPrice } = item;

            if (field === 'basePrice') {
                basePrice = numValue;
                finalPrice = Math.round(basePrice * (1 - discountPercent / 100));
            } else if (field === 'discountPercent') {
                discountPercent = numValue;
                finalPrice = Math.round(basePrice * (1 - discountPercent / 100));
            } else if (field === 'finalPrice') {
                finalPrice = numValue;
                discountPercent = basePrice > 0 ? Number((((basePrice - finalPrice) / basePrice) * 100).toFixed(2)) : 0;
            } else if (field === 'description') {
                return { ...item, description: value };
            }

            return { ...item, basePrice, discountPercent, finalPrice };
        }));
    };

    const addItem = () => {
        setItems(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            description: "New Service",
            basePrice: 0,
            discountPercent: 0,
            finalPrice: 0
        }]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const subtotal = items.reduce((acc, curr) => acc + curr.basePrice, 0);
    const grandTotal = items.reduce((acc, curr) => acc + curr.finalPrice, 0);
    const totalDiscount = subtotal - grandTotal;

    const handleExport = async () => {
        if (!clientName) return toast.error("Please enter a client name");
        if (items.length === 0) return toast.error("Generate or add items first");

        const calculatedPaymentTerms = paymentTerms.map(term => ({
            name: term.name,
            percent: term.percent,
            amount: grandTotal * (term.percent / 100)
        }));

        const data = {
            quoteNumber,
            date: new Date(),
            clientName,
            planName: activePlan?.name || "Custom Plan",
            items,
            subtotal,
            totalDiscount,
            grandTotal,
            tenureYears,
            paymentTerms: calculatedPaymentTerms,
            contact: {
                phone: "+91 96184 43558",
                email: "info@alaqmar.dev",
                website: "https://alaqmar.dev"
            },
            adminSignatureUrl,
            adminSignatoryName
        };

        try {
            await downloadQuotationPdf(data, `Quotation-${clientName.replace(/\s+/g, '-')}-${quoteNumber}.pdf`);
            toast.success("Quotation downloaded successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate PDF");
        }
    };

    const handleSaveToDB = async () => {
        if (!clientName) return toast.error("Please enter a client name");
        if (items.length === 0) return toast.error("Generate or add items first");

        setIsSaving(true);
        try {
            const res = await createQuotation({
                quoteNumber,
                clientName,
                planName: activePlan?.name || "Custom Plan",
                totalAmount: grandTotal,
                advanceAmount,
                items: JSON.stringify(items),
                tenureYears,
                paymentTerms: JSON.stringify(paymentTerms)
            });
            if (res.success) {
                toast.success("Quotation saved successfully!");
                router.refresh();
            } else {
                toast.error("Error saving: " + res.error);
            }
        } catch {
            toast.error("Failed to save quotation");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Settings Panel */}
            <div className="lg:col-span-1 border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 relative shadow-xl space-y-6">
                <h3 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500">Parameters</h3>

                <div>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Quote Number</label>
                    <input
                        type="text"
                        readOnly
                        value={quoteNumber}
                        className="w-full bg-zinc-950/30 border border-white/5 rounded-xl px-4 py-3 text-zinc-400 font-outfit"
                    />
                </div>

                <div>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Client Name</label>
                    <input
                        type="text"
                        value={clientName} onChange={e => setClientName(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-outfit"
                    />
                </div>

                <div>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Select Reference Plan</label>
                    <select
                        value={selectedPlanId} onChange={e => {
                            setSelectedPlanId(e.target.value);
                            const p = plans.find(plan => plan.id === e.target.value);
                            if (p) {
                                const tenure = p.tenureYears || 1;
                                const basePrice = p.features?.filter((pf: any) => pf.isIncluded).reduce((sum: number, pf: any) => {
                                    const fp = pf.feature?.price || 0;
                                    return sum + (pf.feature?.isOneTime ? fp : fp * tenure);
                                }, 0) || 0;
                                const offerPrice = p.discountPrice || p.price || basePrice;
                                const initialTotal = offerPrice > 0 ? offerPrice : basePrice;

                                setTotalPrice(initialTotal);
                                setTenureYears(tenure);
                                try {
                                    const terms = JSON.parse(p.paymentTerms || "[]");
                                    setPaymentTerms(terms);
                                    const advanceTerm = terms.find((t: any) => t.name.toLowerCase().includes('advance')) || terms[0];
                                    if (advanceTerm) {
                                        const initialAdvance = initialTotal * (advanceTerm.percent / 100);
                                        setAdvanceAmount(initialAdvance);
                                        
                                        // Auto generate immediately
                                        doGenerate(p, initialTotal, initialAdvance);
                                    }
                                } catch(err) {
                                    console.error("Failed to parse terms");
                                }
                            }
                        }}
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-outfit"
                    >
                        <option value="">-- Custom (No Plan) --</option>
                        {plans.map(p => {
                            const tenure = p.tenureYears || 1;
                            const basePrice = p.features?.filter((pf: any) => pf.isIncluded).reduce((sum: number, pf: any) => {
                                const fp = pf.feature?.price || 0;
                                return sum + (pf.feature?.isOneTime ? fp : fp * tenure);
                            }, 0) || 0;
                            const offerPrice = p.discountPrice || p.price || basePrice;

                            return (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Base: ₹{basePrice.toLocaleString('en-IN')} | Offered: ₹{offerPrice.toLocaleString('en-IN')})
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Total Price</label>
                    <input
                        type="number"
                        value={totalPrice || ""} onChange={e => setTotalPrice(parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50 transition-all font-outfit"
                    />
                </div>

                <div>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Advance (Server Price)</label>
                    <input
                        type="number"
                        value={advanceAmount ? advanceAmount.toFixed(0) : ""} onChange={e => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-amber-400 font-bold focus:outline-none focus:border-amber-500/50 transition-all font-outfit"
                    />
                </div>

                <div>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Tenure (Years)</label>
                    <input
                        type="number"
                        value={tenureYears} onChange={e => setTenureYears(parseInt(e.target.value) || 1)}
                        className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all font-outfit"
                    />
                </div>

                <div className="bg-zinc-950/30 border border-white/5 rounded-xl p-4">
                     <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Payment Structure</label>
                     {paymentTerms.length > 0 ? (
                         <div className="space-y-2">
                             {paymentTerms.map((t, i) => (
                                 <div key={i} className="flex justify-between text-xs text-zinc-400 font-outfit bg-white/5 px-3 py-2 rounded-lg">
                                     <span>{t.name}</span>
                                     <span className="font-bold text-white">{t.percent}%</span>
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="text-xs text-zinc-600 font-outfit">Select a plan to load.</div>
                     )}
                </div>

                <button
                    onClick={handleGenerate}
                    className="w-full py-3.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-xl font-outfit text-sm font-bold uppercase tracking-widest transition-all border border-indigo-500/30 flex justify-center items-center gap-2"
                >
                    <RefreshCw size={16} /> Auto-Generate
                </button>
            </div>

            {/* Editor Panel */}
            <div className="lg:col-span-3 border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 relative shadow-xl overflow-hidden flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500">Quotation Items</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={addItem}
                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-widest border border-indigo-500/30 flex items-center gap-2 transition-all"
                        >
                            <Plus size={14} /> Add Row
                        </button>
                        <button
                            onClick={handleSaveToDB}
                            disabled={isSaving}
                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-widest border border-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={14} /> {isSaving ? "Saving..." : "Save to DB"}
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2 transition-all"
                        >
                            <Download size={14} /> Export PDF
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="w-full min-w-[600px]">
                        {/* Header */}
                        <div className="flex gap-4 p-3 border-b border-white/10 text-xs font-outfit font-bold uppercase tracking-widest text-zinc-500">
                            <div className="flex-[2]">Service / Description</div>
                            <div className="flex-1 text-right">Base Price (₹)</div>
                            <div className="flex-1 text-right">Discount (%)</div>
                            <div className="flex-1 text-right border-l border-white/10 pl-4 border-dashed">Final Price (₹)</div>
                            <div className="w-10"></div>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-white/5">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-3 items-center group">
                                    <div className="flex-[2]">
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                            rows={1}
                                            className="w-full bg-zinc-950/50 border border-transparent hover:border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500/50 font-outfit text-sm resize-none whitespace-pre-wrap break-words"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={item.basePrice}
                                            onChange={(e) => handleItemChange(item.id, 'basePrice', e.target.value)}
                                            className="w-full bg-zinc-950/50 border border-transparent hover:border-white/10 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500/50 font-outfit text-sm text-right font-medium"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={item.discountPercent}
                                            step="0.01"
                                            onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                                            className="w-full bg-red-950/30 border border-transparent hover:border-red-500/30 rounded-lg px-3 py-2 text-red-400 focus:outline-none focus:border-red-500/50 font-outfit text-sm text-right font-medium"
                                        />
                                    </div>
                                    <div className="flex-1 pl-4 border-l border-white/5 border-dashed">
                                        <input
                                            type="number"
                                            value={item.finalPrice}
                                            onChange={(e) => handleItemChange(item.id, 'finalPrice', e.target.value)}
                                            className="w-full bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-3 py-2 text-emerald-400 focus:outline-none focus:border-emerald-500/50 font-outfit text-sm text-right font-bold"
                                        />
                                    </div>
                                    <div className="w-10 flex justify-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-zinc-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="py-20 text-center text-zinc-500 font-outfit text-sm">
                                    No items generated yet. Select a plan and click Auto-Generate, or manually Add Row.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Totals Section */}
                {items.length > 0 && (
                    <div className="pt-6 mt-6 border-t border-white/10 bg-zinc-950/50 -m-6 p-6">
                        <div className="flex flex-col items-end space-y-2 font-outfit text-sm">
                            <div className="flex justify-between w-64 text-zinc-400">
                                <span>Subtotal:</span>
                                <span className="font-medium text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between w-64 text-red-400">
                                    <span>Total Discount:</span>
                                    <span className="font-medium">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between w-64 pt-3 border-t border-white/10 text-emerald-400">
                                <span className="font-bold text-lg">Grand Total:</span>
                                <span className="font-bold text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="flex justify-between w-64 pt-2 mt-2 border-t border-dashed border-white/5 text-xs text-amber-500">
                                <span className="uppercase tracking-widest font-bold">Target Total:</span>
                                <span className="font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className={`text-xs ${(grandTotal === totalPrice) ? "text-emerald-500" : "text-amber-500/70"} pt-1`}>
                                {grandTotal === totalPrice ? "Matches Target Perfectly ✓" : `Difference: ₹${(grandTotal - totalPrice).toLocaleString('en-IN')}`}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
