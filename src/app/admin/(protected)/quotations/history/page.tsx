import prisma from "@/lib/prisma";
import HistoryClient from "./HistoryClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function QuotationHistoryPage() {
    const quotations = await prisma.quotation.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            client: true
        }
    });

    const settings = await prisma.appSettings.findFirst();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/quotations" className="text-zinc-500 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="font-space text-3xl font-bold tracking-tighter text-white">
                            Saved Quotations
                        </h1>
                    </div>
                </div>
            </div>
            
            <HistoryClient 
                quotations={quotations} 
                adminSignatureUrl={settings?.adminSignatureUrl}
                adminSignatoryName={settings?.adminSignatoryName}
            />
        </div>
    );
}
