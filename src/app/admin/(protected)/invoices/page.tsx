import { getInvoices } from "@/app/actions/invoices";
import InvoicesClient from "./InvoicesClient";
import Link from "next/link";

export const metadata = {
  title: "Invoices | Admin",
};

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">Invoices</h1>
          <p className="font-outfit text-zinc-400 mt-1">View and manage uploaded official invoices.</p>
        </div>
        <Link 
          href="/admin/invoices/new" 
          className="font-outfit text-xs font-bold uppercase tracking-widest bg-white text-black px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors shadow-xl shadow-white/5 flex items-center gap-2"
        >
          Create Invoice
        </Link>
      </div>

      <InvoicesClient invoices={invoices} />
    </>
  );
}
