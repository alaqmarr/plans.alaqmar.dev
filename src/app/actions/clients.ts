"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(data: {
  name: string;
  email?: string;
  phoneNumbers: string[];
  planId: string;
  offeredPrice: number;
  paymentStructure: string; // JSON string
}) {
  const baseSlug = data.name.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const trackingLink = `${baseSlug}-${randomSuffix}`;

  const client = await prisma.client.create({ 
    data: {
      ...data,
      trackingLink
    }
  });
  revalidatePath("/admin/clients");
  return { success: true, client };
}

export async function updateClient(id: string, data: any) {
  const client = await prisma.client.update({ where: { id }, data });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  return { success: true, client };
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clients");
  return { success: true };
}
