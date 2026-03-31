import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import TicketDetailClient from "./TicketDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id }, select: { subject: true } });
  return { title: ticket ? `${ticket.subject} | Tickets` : "Ticket Not Found" };
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) notFound();

  return <TicketDetailClient ticket={ticket} />;
}
