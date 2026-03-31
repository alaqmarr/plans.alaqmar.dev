import prisma from "@/lib/prisma";
import NewInvoiceClient from "./NewInvoiceClient";

export const metadata = {
  title: "Create Invoice | Admin",
};

export const dynamic = 'force-dynamic';

export default async function NewInvoicePage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const settings = await prisma.appSettings.findFirst();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">Create Invoice</h1>
          <p className="font-outfit text-zinc-400 mt-1">Select a client and instantly generate a professional billing document.</p>
        </div>
      </div>

      <NewInvoiceClient clients={clients} settings={settings} />
    </>
  );
}
