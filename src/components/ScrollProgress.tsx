"use client";

import { motion, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/setup")) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left z-[100]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
