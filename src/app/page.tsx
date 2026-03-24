import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const plans = await prisma.plan.findMany({
    orderBy: { price: 'asc' },
    include: {
      features: {
        include: {
          feature: true
        }
      }
    }
  });

  const settings = await prisma.appSettings.findFirst();

  return (
    <HomeClient 
      plans={plans} 
      whatsappNumber={settings?.whatsappNumber || process.env.WHATSAPP_NUMBER || ""}
      contactEmail={settings?.contactEmail || process.env.CONTACT_EMAIL || ""}
    />
  );
}
