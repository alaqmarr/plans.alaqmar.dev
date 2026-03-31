"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTicket(data: {
  clientId: string;
  subject: string;
  description: string;
  priority?: string;
  createdBy?: string;
}) {
  const ticket = await prisma.ticket.create({
    data: {
      clientId: data.clientId,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "normal",
      createdBy: data.createdBy || "admin",
    },
  });

  // Add the description as the first message
  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      sender: data.createdBy || "admin",
      message: data.description,
    },
  });

  revalidatePath("/admin/tickets");
  return { success: true, ticket };
}

export async function getTickets() {
  return await prisma.ticket.findMany({
    include: {
      client: true,
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getClientTickets(clientId: string) {
  return await prisma.ticket.findMany({
    where: { clientId },
    include: {
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTicketById(id: string) {
  return await prisma.ticket.findUnique({
    where: { id },
    include: {
      client: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function updateTicketStatus(id: string, status: string) {
  await prisma.ticket.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${id}`);
  return { success: true };
}

export async function addTicketMessage(data: {
  ticketId: string;
  sender: string;
  message: string;
}) {
  await prisma.ticketMessage.create({ data });
  // Touch the ticket to update updatedAt
  await prisma.ticket.update({
    where: { id: data.ticketId },
    data: {},
  });
  revalidatePath(`/admin/tickets/${data.ticketId}`);
  revalidatePath("/admin/tickets");
  return { success: true };
}
