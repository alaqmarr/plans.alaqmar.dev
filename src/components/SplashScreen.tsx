"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket } from "lucide-react";

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (typeof window !== "undefined" && !sessionStorage.getItem("splash-shown")) {
      setShow(true);
      sessionStorage.setItem("splash-shown", "1");
      const timer = setTimeout(() => setShow(false), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] bg-zinc-950 flex items-center justify-center"
        >
          {/* Background glow */}
          <div className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30"
            >
              <Rocket size={32} className="text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-space text-3xl font-bold text-white tracking-tight"
            >
              THE WEB SENSEI
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
              className="h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
