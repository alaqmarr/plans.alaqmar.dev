import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicTrackerClient from "./PublicTrackerClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { trackingLink: id },
    select: { name: true, plan: { select: { name: true } } }
  });

  if (!client) {
    return {
      title: "Portal Not Found",
    };
  }

  return {
    title: `${client.name} | Tracking Portal`,
    description: `Live project tracking and invoicing panel for ${client.name} - ${client.plan.name} plan.`,
    openGraph: {
      title: `${client.name} | Project Tracking`,
      description: `Access your live project tracking and invoicing panel here.`,
      siteName: "The Web Sensei",
      type: "website",
    },
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { trackingLink: id },
    include: {
      plan: {
        include: {
          features: {
            include: {
              feature: true
            }
          }
        }
      }
    }
  });

  if (!client) {
    notFound();
  }

  const settings = await prisma.appSettings.findFirst();

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <PublicTrackerClient
          client={client}
          settings={{
            upiId: settings?.upiId || "",
            bankAccountName: settings?.bankAccountName || "",
            bankAccountNumber: settings?.bankAccountNumber || "",
            bankIfsc: settings?.bankIfsc || ""
          }}
        />
      </div>
    </div>
  );
}
