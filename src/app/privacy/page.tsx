import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Privacy Policy | Alaqmar" };

export default function PrivacyPolicy() {
  return (
    <div className="relative pt-32 pb-24 px-4 max-w-4xl mx-auto z-10 selection:bg-indigo-500/30">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-indigo-400 mb-8 transition-colors font-outfit text-sm uppercase tracking-[0.2em] font-bold">
        <ArrowLeft size={16} className="mr-2" /> Back to Home
      </Link>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Privacy Policy</h1>
        <p className="font-space text-indigo-400 text-sm mb-12 uppercase tracking-widest">Last Updated: March 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed max-w-none prose-p:mb-4 prose-h2:font-outfit prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mb-4 prose-h2:mt-10">
          <p>This Privacy Policy applies to the collection, receipt, storage, usage, processing, disclosure, transfer, and protection of your personal information (including sensitive personal data or information) in compliance with the <strong>Information Technology Act, 2000</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 ("SPDI Rules")</strong> of India.</p>

          <h2>1. Collection of Information</h2>
          <p>We collect information directly from you when you submit enquiries, register for an account, or engage us for software development services. This includes personal identifiers such as Name, Email Address, Phone Number, and business requirements.</p>

          <h2>2. Use of Information</h2>
          <p>The information collected is strictly utilized to provide you with accurate custom development quotes, deploy your services, manage your account, and maintain statutory business communications. We do not sell your personal data to third parties.</p>

          <h2>3. Third-Party Integrations</h2>
          <p>Our platform may utilize third-party infrastructure (e.g., Vercel, payment gateways, WhatsApp API, transactional email providers) to deliver services. While we ensure adequate confidentiality terms with these providers, any data routed through them is governed by their respective privacy policies.</p>

          <h2>4. Data Security</h2>
          <p>We employ reasonable security practices and procedures that are commensurate with the information assets being protected to prevent unauthorized access, maintain data accuracy, and ensure the correct use of information.</p>

          <h2>5. User Rights & Grievance Officer</h2>
          <p>If you find any discrepancies in your personal data or have grievances relating to data processing, please contact our Grievance Officer through our designated contact channels. We will endeavor to address them within 30 days as mandated by the IT Act, 2000.</p>

        </div>
      </div>
    </div>
  );
}
