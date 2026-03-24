"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createItem(data: { name: string; description?: string; price: number }) {
  const item = await prisma.customItem.create({ data });
  revalidatePath("/admin/items");
  return { success: true, item };
}

export async function updateItem(id: string, data: any) {
  const item = await prisma.customItem.update({ where: { id }, data });
  revalidatePath("/admin/items");
  return { success: true, item };
}

export async function deleteItem(id: string) {
  await prisma.customItem.delete({ where: { id } });
  revalidatePath("/admin/items");
  return { success: true };
}

export async function importFeaturesToItems() {
  const features = await prisma.feature.findMany();
  if (!features.length) return { success: false, message: "No features found to import." };

  const existingItems = await prisma.customItem.findMany();
  const existingNames = new Set(existingItems.map(i => i.name.toLowerCase()));

  const itemsToCreate = features
    .filter(f => !existingNames.has(f.name.toLowerCase()))
    .map(f => ({
      name: f.name,
      description: f.description || "",
      price: f.price || 0,
      isOneTime: f.isOneTime || false,
    }));

  if (itemsToCreate.length > 0) {
    await prisma.customItem.createMany({ data: itemsToCreate });
    revalidatePath("/admin/items");
    revalidatePath("/custom-plan");
    return { success: true, count: itemsToCreate.length, message: `Successfully imported ${itemsToCreate.length} new items!` };
  }

  return { success: false, message: "All features already exist in Custom Items. Nothing to import." };
}
