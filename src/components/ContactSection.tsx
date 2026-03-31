"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, Mail, Phone, User } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import toast from "react-hot-toast";

interface ContactSectionProps {
  contactEmail?: string;
  whatsappNumber?: string;
}

export default function ContactSection({ contactEmail, whatsappNumber }: ContactSectionProps) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (viaEmail: boolean) => {
    if (!formData.name || !formData.email) return toast.error("Name and Email are required");

    if (!viaEmail && whatsappNumber) {
      const msg = `Hi! I'd like to get in touch.\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`;
      const num = whatsappNumber.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, plan: "General Enquiry" }),
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
      } else toast.error("Failed to send. Please try again.");
    } catch {
      toast.error("Error sending message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-4 overflow-hidden z-10">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/8 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-outfit text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-3">Contact</p>
          <h2 className="font-outfit text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {"Get In Touch".split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <p className="font-outfit text-zinc-400 text-lg max-w-xl mx-auto">Have a project in mind? Let's bring your vision to life.</p>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-12 rounded-3xl text-center"
          >
            <Check size={48} className="mx-auto mb-4 text-emerald-500" />
            <h4 className="font-outfit text-2xl font-bold mb-2">Message Sent!</h4>
            <p className="font-outfit text-sm opacity-80">We've received your enquiry and will be in touch shortly.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/30 relative overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] pointer-events-none mix-blend-screen bg-indigo-500/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 relative z-10">
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  required
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600 font-outfit"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  required
                  type="email"
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600 font-outfit"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="relative mb-5">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="tel"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600 font-outfit"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <textarea
              className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all h-32 resize-none placeholder:text-zinc-600 font-outfit mb-8 relative z-10"
              placeholder="Tell us about your project..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="font-outfit flex justify-center items-center gap-2 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50 border border-white/5 cursor-pointer"
              >
                {submitting ? "Sending..." : <><Send size={16} /> Send Email</>}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="font-outfit flex justify-center items-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <WhatsAppIcon size={16} /> WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
