import prisma from "@/lib/prisma";
import NewPlanClient from "./NewPlanClient";

export default async function NewPlanPage() {
  const allFeatures = await prisma.feature.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <NewPlanClient allFeatures={allFeatures} />;
}
