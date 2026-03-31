import prisma from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const settings = await prisma.appSettings.findFirst();

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 px-8 relative shadow-2xl">
        <h1 className="font-outfit text-3xl md:text-4xl font-extrabold tracking-tight text-white">App Settings</h1>
      </div>
      <SettingsClient 
        initialSettings={{
          contactEmail: settings?.contactEmail || process.env.CONTACT_EMAIL || "",
          whatsappNumber: settings?.whatsappNumber || process.env.WHATSAPP_NUMBER || "",
          upiId: settings?.upiId || "",
          bankAccountName: settings?.bankAccountName || "",
          bankAccountNumber: settings?.bankAccountNumber || "",
          bankIfsc: settings?.bankIfsc || "",
        }} 
      />
    </div>
  );
}
