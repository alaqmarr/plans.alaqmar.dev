"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: {
  clientId: string;
  milestoneName: string;
  amount: number;
  fileUrl: string;
  invoiceNumber?: string;
}) {
  // Check if an invoice for this exact milestone already exists, to prevent duplicates
  const existing = await prisma.invoice.findFirst({
    where: { clientId: data.clientId, milestoneName: data.milestoneName }
  });

  if (existing) {
    await prisma.invoice.delete({ where: { id: existing.id } });
  }

  // Use provided invoiceNumber or generate a unique one
  const invoiceNumber = data.invoiceNumber || `TWS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  const invoice = await prisma.invoice.create({
    data: {
      clientId: data.clientId,
      milestoneName: data.milestoneName,
      amount: data.amount,
      fileUrl: data.fileUrl,
      invoiceNumber
    }
  });
  
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/clients/${data.clientId}`);
  return { success: true, invoice };
}

export async function getInvoices() {
  return await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' },
  });
}
