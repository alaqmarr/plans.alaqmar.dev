"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createQuotation(data: {
  quoteNumber: string;
  clientName: string;
  planName: string;
  totalAmount: number;
  advanceAmount: number;
  items: string;
  tenureYears: number;
  paymentTerms: string;
}) {
  try {
    const quote = await prisma.quotation.create({
      data: {
        quoteNumber: data.quoteNumber,
        clientName: data.clientName,
        planName: data.planName,
        totalAmount: data.totalAmount,
        advanceAmount: data.advanceAmount,
        items: data.items,
        tenureYears: data.tenureYears,
        paymentTerms: data.paymentTerms,
      },
    });

    // Optional: try matching clientName to an existing client
    // We do a loose match if they happen to share the same name
    const existingClient = await prisma.client.findFirst({
      where: { name: { equals: data.clientName, mode: "insensitive" } },
    });

    if (existingClient) {
      await prisma.quotation.update({
        where: { id: quote.id },
        data: { clientId: existingClient.id },
      });
    }

    revalidatePath("/admin/quotations");
    revalidatePath("/admin/quotations/history");
    return { success: true, id: quote.id };
  } catch (error: any) {
    console.error("Failed to save quotation:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteQuotation(id: string) {
  try {
    await prisma.quotation.delete({
      where: { id },
    });

    revalidatePath("/admin/quotations/history");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete quotation:", error);
    return { success: false, error: error.message };
  }
}
