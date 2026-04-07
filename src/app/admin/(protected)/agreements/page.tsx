import { getAllAgreements } from "@/app/actions/agreements";
import prisma from "@/lib/prisma";
import AgreementsListClient from "./AgreementsListClient";

export const metadata = { title: "Agreements | Admin" };
export const dynamic = "force-dynamic";

export default async function AgreementsPage() {
  const [agreements, allClients] = await Promise.all([
    getAllAgreements(),
    prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  // Clients without an agreement yet
  const agreedClientIds = new Set(agreements.map((a: any) => a.clientId));
  const clientsWithoutAgreement = allClients.filter((c) => !agreedClientIds.has(c.id));

  return <AgreementsListClient agreements={agreements} clientsWithoutAgreement={clientsWithoutAgreement} />;
}
