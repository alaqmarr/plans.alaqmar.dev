import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Return & Refund Policy | Alaqmar" };

export default function RefundPolicy() {
  return (
    <div className="relative pt-32 pb-24 px-4 max-w-4xl mx-auto z-10 selection:bg-indigo-500/30">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

      <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-orange-400 mb-8 transition-colors font-outfit text-sm uppercase tracking-[0.2em] font-bold">
        <ArrowLeft size={16} className="mr-2" /> Back to Home
      </Link>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Return & Refund Policy</h1>
        <p className="font-space text-orange-400 text-sm mb-12 uppercase tracking-widest">Last Updated: March 2026</p>

        <div className="space-y-8 text-zinc-300 leading-relaxed max-w-none prose-p:mb-4 prose-h2:font-outfit prose-h2:text-2xl prose-h2:font-bold prose-h2:text-white prose-h2:mb-4 prose-h2:mt-10">
          <p>At Alaqmar, we specialize in offering custom digital services, bespoke software development, and non-tangible infrastructure deployment. Due to the irreversible nature of digital labor and intellectual property transfer, our return and refund policy is strict and definitive.</p>

          <h2>1. No Refunds</h2>
          <p className="font-bold text-white border-l-4 border-orange-500 pl-4 bg-orange-500/10 p-3 rounded-r-lg">All sales are final. We do not offer refunds, partial refunds, or credits for any software development services, custom plans, hosting costs, or milestone payments once work has commenced or a payment stage has been cleared.</p>

          <h2>2. No Returns</h2>
          <p>Because the products delivered are digital applications and deployed custom codebases, they cannot be physically or practically "returned". Acceptance of a developmental milestone or final deployment strictly indicates the completion of that non-returnable phase.</p>

          <h2>3. Service Acceptance</h2>
          <p>By proceeding with our developmental plans and initiating payment, you categorically accept this strict no-refund policy, acknowledging that you are purchasing bespoke development time, labor, and digital infrastructure rendering traditional retail refund mechanisms inapplicable.</p>
        </div>
      </div>
    </div>
  );
}
