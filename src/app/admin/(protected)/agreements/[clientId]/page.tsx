import { getOrCreateAgreement } from "@/app/actions/agreements";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AgreementDetailClient from "./AgreementDetailClient";

export const dynamic = "force-dynamic";

export default async function AgreementDetailPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;

  const settings = await prisma.appSettings.findFirst();
  const agreement = await getOrCreateAgreement(clientId).catch(() => null);

  if (!agreement) notFound();

  return (
    <AgreementDetailClient
      agreement={agreement}
      settings={settings}
    />
  );
}
