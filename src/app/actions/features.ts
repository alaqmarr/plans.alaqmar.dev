"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFeature(data: { name: string; description?: string; price: number; isOneTime?: boolean; upgradedById?: string | null }) {
  const feature = await prisma.feature.create({ data });
  revalidatePath("/admin/features");
  return { success: true, feature };
}

export async function updateFeature(id: string, data: any) {
  const feature = await prisma.feature.update({ where: { id }, data });
  revalidatePath("/admin/features");
  return { success: true, feature };
}

export async function deleteFeature(id: string) {
  await prisma.feature.delete({ where: { id } });
  revalidatePath("/admin/features");
  return { success: true };
}

export async function togglePlanFeature(planId: string, featureId: string, isIncluded: boolean) {
  const existing = await prisma.planFeature.findUnique({
    where: { planId_featureId: { planId, featureId } },
  });

  if (existing) {
    await prisma.planFeature.update({
      where: { planId_featureId: { planId, featureId } },
      data: { isIncluded },
    });
  } else {
    await prisma.planFeature.create({
      data: { planId, featureId, isIncluded },
    });
  }
  
  revalidatePath("/admin/plans");
  revalidatePath("/");
  return { success: true };
}
