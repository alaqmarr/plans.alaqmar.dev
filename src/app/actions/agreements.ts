"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAgreementText } from "@/lib/agreementGenerator";

export async function getOrCreateAgreement(clientId: string) {
  const existing = await prisma.agreement.findUnique({
    where: { clientId },
    include: { client: { include: { plan: { include: { features: { include: { feature: true } } } } } } },
  });
  if (existing) return existing;

  // Generate from plan
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { plan: { include: { features: { include: { feature: true } } } } },
  });
  if (!client) throw new Error("Client not found");

  const agreementText = generateAgreementText(
    { name: client.name, email: client.email },
    client.plan,
    client.offeredPrice,
    new Date(),
    client.paymentStructure as string | null
  );

  return await prisma.agreement.create({
    data: { clientId, agreementText },
    include: { client: { include: { plan: { include: { features: { include: { feature: true } } } } } } },
  });
}

export async function getAgreementByClientId(clientId: string) {
  return await prisma.agreement.findUnique({
    where: { clientId },
    include: { client: { include: { plan: true } } },
  });
}

export async function getAllAgreements() {
  return await prisma.agreement.findMany({
    include: { client: { include: { plan: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminSignAgreement(agreementId: string) {
  const settings = await prisma.appSettings.findFirst();
  if (!settings?.adminSignatureUrl) throw new Error("Admin signature not uploaded yet. Please upload it in Settings.");

  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      adminSignatureUrl: settings.adminSignatureUrl,
      adminSignatoryName: settings.adminSignatoryName || "AL AQMAR",
      adminSignedAt: new Date(),
    },
  });

  revalidatePath("/admin/agreements");
  return { success: true };
}

export async function verifyClientSignature(agreementId: string) {
  await prisma.agreement.update({
    where: { id: agreementId },
    data: { adminVerified: true, adminVerifiedAt: new Date() },
  });
  revalidatePath("/admin/agreements");
  return { success: true };
}

export async function rejectClientSignature(agreementId: string) {
  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      clientSignatureUrl: null,
      clientSignatoryName: null,
      clientSignedAt: null,
      adminVerified: false,
      adminVerifiedAt: null,
    },
  });
  revalidatePath("/admin/agreements");
  return { success: true };
}

export async function uploadClientSignature(agreementId: string, url: string, signatoryName: string) {
  await prisma.agreement.update({
    where: { id: agreementId },
    data: {
      clientSignatureUrl: url,
      clientSignatoryName: signatoryName,
      clientSignedAt: new Date(),
      adminVerified: false, // requires re-verification after new upload
      adminVerifiedAt: null,
    },
  });
  revalidatePath(`/track`);
  return { success: true };
}

export async function regenerateAgreementText(agreementId: string) {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    include: { client: { include: { plan: { include: { features: { include: { feature: true } } } } } } },
  });
  if (!agreement) throw new Error("Agreement not found");

  const { client } = agreement;
  const dateToUse = agreement.agreementDate || agreement.createdAt;
  const agreementText = generateAgreementText(
    { name: client.name, email: client.email },
    client.plan,
    client.offeredPrice,
    dateToUse,
    client.paymentStructure as string | null
  );

  await prisma.agreement.update({ 
    where: { id: agreementId }, 
    data: { 
      agreementText,
      // Clear signatures because the terms have changed
      adminSignatureUrl: null,
      adminSignatoryName: null,
      adminSignedAt: null,
      clientSignatureUrl: null,
      clientSignatoryName: null,
      clientSignedAt: null,
      adminVerified: false,
      adminVerifiedAt: null
    } 
  });
  revalidatePath("/admin/agreements");
  return { success: true };
}

export async function updateAgreementDate(agreementId: string, dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error("Invalid date");
  await prisma.agreement.update({
    where: { id: agreementId },
    data: { agreementDate: date },
  });
  
  // Also regenerate text so the new date populates in the actual document content
  await regenerateAgreementText(agreementId);
  
  revalidatePath("/admin/agreements");
  return { success: true };
}
