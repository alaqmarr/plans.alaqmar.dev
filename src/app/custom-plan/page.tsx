import prisma from "@/lib/prisma";
import CustomPlanClient from "./CustomPlanClient";

export const metadata = {
  title: "Create Custom Plan | THE WEB SENSEI",
  description: "Build your own custom development plan by selecting individual technical components.",
};

export default async function CustomPlanPage() {
  const items = await prisma.customItem.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  const settings = await prisma.appSettings.findFirst();

  return (
    <CustomPlanClient 
      items={items} 
      contactEmail={settings?.contactEmail || process.env.CONTACT_EMAIL || ""}
      whatsappNumber={settings?.whatsappNumber || process.env.WHATSAPP_NUMBER || ""}
    />
  );
}
