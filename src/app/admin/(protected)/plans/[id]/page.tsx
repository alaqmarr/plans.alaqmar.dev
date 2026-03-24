import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditPlanClient from "./EditPlanClient";

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      features: true
    }
  });

  const allFeatures = await prisma.feature.findMany({
    orderBy: { createdAt: 'desc' }
  });

  if (!plan) notFound();

  return <EditPlanClient plan={plan} allFeatures={allFeatures} />;
}
