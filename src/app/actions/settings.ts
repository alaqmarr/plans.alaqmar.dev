"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(data: { 
  contactEmail?: string; 
  whatsappNumber?: string;
  upiId?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  adminSignatureUrl?: string;
  adminSignatoryName?: string;
}) {
  const settings = await prisma.appSettings.findFirst();

  if (settings) {
    await prisma.appSettings.update({
      where: { id: settings.id },
      data,
    });
  } else {
    await prisma.appSettings.create({
      data,
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}
