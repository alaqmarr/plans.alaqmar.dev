import { getInvoices } from "@/app/actions/invoices";
import InvoicesClient from "./InvoicesClient";

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
      </div>

      <InvoicesClient invoices={invoices} />
    </>
  );
}
