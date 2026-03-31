"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolver({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(value);
    }
    setTimeout(() => {
      setOptions(null);
      setResolver(null);
    }, 300);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => handleClose(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${options.destructive ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                   <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-outfit font-bold text-white mb-2">{options.title || "Confirm Action"}</h3>
                <p className="text-zinc-400 text-sm font-outfit mb-8 leading-relaxed">{options.message}</p>
                
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handleClose(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-zinc-300 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors font-outfit"
                  >
                    {options.cancelLabel || "Cancel"}
                  </button>
                  <button
                    onClick={() => handleClose(true)}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white transition-all font-outfit shadow-lg ${options.destructive ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'}`}
                  >
                    {options.confirmLabel || "Confirm"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
