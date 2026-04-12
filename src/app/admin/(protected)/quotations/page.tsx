import prisma from "@/lib/prisma";
import QuotationsClient from "./QuotationsClient";
import Link from "next/link";
import { FileText } from "lucide-react";

export default async function QuotationsPage() {
    const plans = await prisma.plan.findMany({
        include: {
            features: {
                include: {
                    feature: true
                }
            }
        }
    });

    const settings = await prisma.appSettings.findFirst();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-space text-3xl font-bold tracking-tighter text-white">
                    Quotations Generator
                </h1>
                <Link
                    href="/admin/quotations/history"
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-sm font-outfit text-zinc-300 transition-colors"
                >
                    <FileText size={16} /> View Saved Quotes
                </Link>
            </div>
            <QuotationsClient 
                plans={plans} 
                adminSignatureUrl={settings?.adminSignatureUrl}
                adminSignatoryName={settings?.adminSignatoryName}
            />
        </div>
    );
}
