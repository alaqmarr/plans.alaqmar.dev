"use client";

import { useState } from "react";
import { Download, Trash2, Eye, X, Search, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { downloadQuotationPdf } from "@/lib/pdfGenerator";
import { deleteQuotation } from "@/app/actions/quotations";
import { useRouter } from "next/navigation";

interface Props {
    quotations: any[];
    adminSignatureUrl?: string | null;
    adminSignatoryName?: string | null;
}

export default function HistoryClient({ quotations, adminSignatureUrl, adminSignatoryName }: Props) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [viewQuote, setViewQuote] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const filtered = quotations.filter(q =>
        q.clientName.toLowerCase().includes(search.toLowerCase()) ||
        q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
        q.planName.toLowerCase().includes(search.toLowerCase())
    );

    const handleDownload = async (q: any) => {
        try {
            let items: any[] = [];
            try { items = JSON.parse(q.items); } catch { }

            let terms: any[] = [];
            try { terms = JSON.parse(q.paymentTerms || "[]"); } catch { }

            const subtotal = items.reduce((acc: number, curr: any) => acc + (curr.basePrice || 0), 0);
            const grandTotal = items.reduce((acc: number, curr: any) => acc + (curr.finalPrice || 0), 0);
            const totalDiscount = subtotal - grandTotal;

            const calculatedPaymentTerms = terms.map((term: any) => ({
                name: term.name,
                percent: term.percent,
                amount: grandTotal * (term.percent / 100)
            }));

            const data = {
                quoteNumber: q.quoteNumber,
                date: new Date(q.createdAt),
                clientName: q.clientName,
                planName: q.planName,
                items,
                subtotal,
                totalDiscount,
                grandTotal,
                tenureYears: q.tenureYears || 1,
                paymentTerms: calculatedPaymentTerms,
                contact: {
                    phone: "+91 96184 43558",
                    email: "info@alaqmar.dev",
                    website: "https://alaqmar.dev"
                },
                adminSignatureUrl,
                adminSignatoryName
            };

            await downloadQuotationPdf(data, `Quotation-${q.clientName.replace(/\s+/g, '-')}-${q.quoteNumber}.pdf`);
            toast.success("PDF downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate PDF");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quotation?")) return;
        setIsDeleting(id);
        try {
            const res = await deleteQuotation(id);
            if (res.success) {
                toast.success("Quotation deleted");
                router.refresh();
            } else {
                toast.error("Failed to delete: " + res.error);
            }
        } catch {
            toast.error("Failed to delete quotation");
        } finally {
            setIsDeleting(null);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <>
            {/* Search Bar */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by client name, quote number, or plan..."
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Quotations</p>
                    <p className="font-space text-3xl font-bold text-white">{quotations.length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Total Value</p>
                    <p className="font-space text-3xl font-bold text-emerald-400">
                        ₹{quotations.reduce((s: number, q: any) => s + (q.totalAmount || 0), 0).toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                    <p className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Unique Clients</p>
                    <p className="font-space text-3xl font-bold text-indigo-400">
                        {new Set(quotations.map((q: any) => q.clientName.toLowerCase())).size}
                    </p>
                </div>
            </div>

            {/* Quotations List */}
            {filtered.length === 0 ? (
                <div className="border border-white/5 bg-zinc-900/50 rounded-2xl p-16 text-center">
                    <p className="font-outfit text-zinc-500">No quotations found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((q: any) => {
                        let items: any[] = [];
                        try { items = JSON.parse(q.items); } catch { }
                        const subtotal = items.reduce((acc: number, curr: any) => acc + (curr.basePrice || 0), 0);

                        return (
                            <div
                                key={q.id}
                                className="border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 hover:border-white/10 transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                                    {/* Left side: Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-outfit text-xs font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                                                {q.quoteNumber}
                                            </span>
                                            <span className="font-outfit text-xs text-zinc-500 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(q.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className="font-outfit text-lg font-bold text-white truncate">{q.clientName}</h3>
                                        <p className="font-outfit text-sm text-zinc-500 mt-0.5">
                                            Plan: <span className="text-zinc-300">{q.planName}</span>
                                            <span className="mx-2 text-zinc-700">·</span>
                                            {items.length} item{items.length !== 1 ? 's' : ''}
                                            {q.tenureYears > 1 && (
                                                <>
                                                    <span className="mx-2 text-zinc-700">·</span>
                                                    {q.tenureYears} years
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    {/* Middle: Prices */}
                                    <div className="flex items-center gap-6">
                                        {subtotal > q.totalAmount && (
                                            <div className="text-right">
                                                <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600">Base</p>
                                                <p className="font-space text-sm text-zinc-500 line-through">₹{subtotal.toLocaleString('en-IN')}</p>
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <p className="font-outfit text-[10px] uppercase tracking-widest text-emerald-500">Total</p>
                                            <p className="font-space text-lg font-bold text-emerald-400">₹{q.totalAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setViewQuote(q)}
                                            className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/20 transition-all"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(q)}
                                            className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all"
                                            title="Download PDF"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            disabled={isDeleting === q.id}
                                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {viewQuote && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewQuote(null)}>
                    <div
                        className="bg-zinc-900 border border-white/10 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl border-b border-white/5 p-6 flex items-center justify-between z-10 rounded-t-3xl">
                            <div>
                                <h2 className="font-outfit text-xl font-bold text-white">{viewQuote.clientName}</h2>
                                <p className="font-outfit text-sm text-zinc-500 mt-0.5">
                                    {viewQuote.quoteNumber} · {viewQuote.planName} · {formatDate(viewQuote.createdAt)}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(viewQuote)}
                                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-emerald-500/30 flex items-center gap-2 transition-all"
                                >
                                    <Download size={14} /> PDF
                                </button>
                                <button
                                    onClick={() => setViewQuote(null)}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {(() => {
                                let items: any[] = [];
                                try { items = JSON.parse(viewQuote.items); } catch { }
                                let terms: any[] = [];
                                try { terms = JSON.parse(viewQuote.paymentTerms || "[]"); } catch { }

                                const subtotal = items.reduce((acc: number, curr: any) => acc + (curr.basePrice || 0), 0);
                                const grandTotal = items.reduce((acc: number, curr: any) => acc + (curr.finalPrice || 0), 0);
                                const totalDiscount = subtotal - grandTotal;

                                return (
                                    <>
                                        {/* Items Table */}
                                        <div className="border border-white/5 rounded-2xl overflow-hidden mb-6">
                                            <div className="flex gap-4 p-4 bg-zinc-800/50 text-xs font-outfit font-bold uppercase tracking-widest text-zinc-500 border-b border-white/5">
                                                <div className="flex-[2]">Service</div>
                                                <div className="flex-1 text-right">Base Price</div>
                                                <div className="flex-1 text-right">Discount</div>
                                                <div className="flex-1 text-right">Final Price</div>
                                            </div>
                                            <div className="divide-y divide-white/5">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex gap-4 p-4 items-center">
                                                        <div className="flex-[2] font-outfit text-sm text-white">{item.description}</div>
                                                        <div className="flex-1 text-right font-outfit text-sm text-zinc-400">
                                                            ₹{(item.basePrice || 0).toLocaleString('en-IN')}
                                                        </div>
                                                        <div className="flex-1 text-right font-outfit text-sm text-red-400">
                                                            {(item.discountPercent || 0).toFixed(1)}%
                                                        </div>
                                                        <div className="flex-1 text-right font-outfit text-sm font-bold text-emerald-400">
                                                            ₹{(item.finalPrice || 0).toLocaleString('en-IN')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Totals */}
                                        <div className="flex flex-col items-end space-y-2 font-outfit text-sm mb-6">
                                            <div className="flex justify-between w-72 text-zinc-400">
                                                <span>Subtotal:</span>
                                                <span className="font-medium text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            {totalDiscount > 0 && (
                                                <div className="flex justify-between w-72 text-red-400">
                                                    <span>Total Discount:</span>
                                                    <span className="font-medium">-₹{totalDiscount.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between w-72 pt-3 border-t border-white/10 text-emerald-400">
                                                <span className="font-bold text-lg">Grand Total:</span>
                                                <span className="font-bold text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        {/* Payment Terms */}
                                        {terms.length > 0 && (
                                            <div className="border border-white/5 rounded-2xl p-5 mb-6">
                                                <h4 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Payment Structure</h4>
                                                <div className="space-y-2">
                                                    {terms.map((t: any, i: number) => (
                                                        <div key={i} className="flex justify-between text-sm font-outfit bg-white/5 px-4 py-2.5 rounded-xl">
                                                            <span className="text-zinc-400">{t.name} <span className="text-zinc-600">({t.percent}%)</span></span>
                                                            <span className="font-bold text-white">₹{Math.round(grandTotal * t.percent / 100).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                                                <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Tenure</p>
                                                <p className="font-outfit text-sm text-white font-bold">{viewQuote.tenureYears || 1} Year{(viewQuote.tenureYears || 1) > 1 ? 's' : ''}</p>
                                            </div>
                                            <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4">
                                                <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Advance Amount</p>
                                                <p className="font-outfit text-sm text-amber-400 font-bold">₹{(viewQuote.advanceAmount || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
