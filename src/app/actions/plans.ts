"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlan(data: {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  tenureYears: number;
  paymentTerms: string;
  validity?: string;
  isPopular?: boolean;
  featureIds?: string[];
}) {
  const { featureIds, ...planData } = data;
  const plan = await prisma.plan.create({ 
    data: {
      ...planData,
      ...(featureIds && featureIds.length > 0 ? {
        features: {
          create: featureIds.map((featureId) => ({ featureId, isIncluded: true }))
        }
      } : {})
    }
  });
  revalidatePath("/admin/plans");
  revalidatePath("/");
  return { success: true, plan };
}

export async function updatePlan(id: string, data: any) {
  const plan = await prisma.plan.update({ where: { id }, data });
  revalidatePath("/admin/plans");
  revalidatePath("/");
  return { success: true, plan };
}

export async function deletePlan(id: string) {
  await prisma.plan.delete({ where: { id } });
  revalidatePath("/admin/plans");
  revalidatePath("/");
  return { success: true };
}
