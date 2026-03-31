import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Terms of Service | THE WEB SENSEI" };

export default function TermsOfService() {
  return (
    <div className="relative pt-32 pb-24 px-4 max-w-4xl mx-auto z-10 selection:bg-indigo-500/30">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-rose-400 mb-8 transition-colors font-outfit text-sm uppercase tracking-[0.2em] font-bold">
        <ArrowLeft size={16} className="mr-2" /> Back to Home
      </Link>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Terms of Service</h1>
        <p className="font-space text-rose-400 text-sm mb-12 uppercase tracking-widest">Last Updated: March 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed max-w-none prose-p:mb-4 prose-h2:font-outfit prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mb-4 prose-h2:mt-10">
          <p>These Terms of Service ("Terms") constitute a legally binding agreement made between you and THE WEB SENSEI, governed by the laws of India, including the <strong>Indian Contract Act, 1872</strong> and the <strong>Information Technology Act, 2000</strong>. By accessing our platform or engaging our digital development services, you agree to be bound by these Terms.</p>

          <h2>1. Service Engagement</h2>
          <p>We provide custom web development, deployment, and ongoing technical maintenance based on finalized plans. All project scopes, features, and tenures are legally established upon payment of the initially agreed milestone (Advance).</p>

          <h2>2. Explicit 3rd Party Liability Disclaimer</h2>
          <p>You acknowledge that our custom web solutions integrate and rely heavily upon third-party services, APIs, and platforms (including but not limited to Hosting Providers like Vercel/AWS, Payment Gateways like Razorpay/Stripe, WhatsApp Business APIs, and external databases).</p>
          <p className="font-bold text-white border-l-4 border-rose-500 pl-4 bg-rose-500/10 p-3 rounded-r-lg">We strictly disclaim all liability for any damages, downtime, data breaches, or loss of business resulting from outages, policy changes, or failures of these external third-party services. We operate as an integrator and developer, and accept no responsibility for damages originating outside our directly controlled infrastructure.</p>

          <h2>3. Intellectual Property Rights</h2>
          <p>Unless clearly stipulated otherwise in a final developmental contract, standard proprietary logic, libraries, and frameworks utilized to build your solution remain our sole intellectual property. You are granted an exclusive license to utilize the finished software for its intended purpose upon full and final settlement of all payment stages.</p>

          <h2>4. Dispute Resolution & Jurisdiction</h2>
          <p>Any dispute arising out of or in connection with these terms, including any question regarding its existence, validity, or termination, shall be subject to the exclusive jurisdiction of the competent courts located in India.</p>

        </div>
      </div>
    </div>
  );
}
