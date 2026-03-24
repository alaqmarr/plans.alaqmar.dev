import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PlanDetailClient from "./PlanDetailClient";

export async function generateStaticParams() {
  const plans = await prisma.plan.findMany({ select: { id: true } });
  return plans.map((plan) => ({ id: plan.id }));
}

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      features: {
        include: { feature: true }
      }
    }
  });

  if (!plan) notFound();

  const settings = await prisma.appSettings.findFirst();

  return (
    <PlanDetailClient
      plan={plan}
      whatsappNumber={settings?.whatsappNumber || process.env.WHATSAPP_NUMBER || ""}
      contactEmail={settings?.contactEmail || process.env.CONTACT_EMAIL || ""}
    />
  );
}
