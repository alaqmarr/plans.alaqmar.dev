"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: {
  clientId: string;
  milestoneName: string;
  amount: number;
  fileUrl: string;
}) {
  // Check if an invoice for this exact milestone already exists, to prevent duplicates
  const existing = await prisma.invoice.findFirst({
    where: { clientId: data.clientId, milestoneName: data.milestoneName }
  });

  if (existing) {
    await prisma.invoice.delete({ where: { id: existing.id } });
  }

  // Generate professional Invoice Number: TWS-{YEAR}-{COUNT}
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const nextId = (count + 1).toString().padStart(3, '0');
  const invoiceNumber = `TWS-${year}-${nextId}`;

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
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
