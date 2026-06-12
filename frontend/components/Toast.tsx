"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertTriangle className="w-5 h-5 text-[#ff3d00]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#ffb800]" />,
    info: <Info className="w-5 h-5 text-[#00f0ff]" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    error: 'border-[#ff3d00]/30 bg-[#ff3d00]/5',
    warning: 'border-[#ffb800]/30 bg-[#ffb800]/5',
    info: 'border-[#00f0ff]/30 bg-[#00f0ff]/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 min-w-[300px] p-4 rounded-xl border ${borders[type]} backdrop-blur-md shadow-lg pointer-events-auto`}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-zinc-200">{message}</p>
      <button onClick={() => onClose(id)} className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Global Toast Manager
let toastIdCounter = 0;
let addToastCallback: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void = () => {};

export const toast = {
  success: (msg: string, duration?: number) => addToastCallback({ message: msg, type: 'success', duration }),
  error: (msg: string, duration?: number) => addToastCallback({ message: msg, type: 'error', duration }),
  warning: (msg: string, duration?: number) => addToastCallback({ message: msg, type: 'warning', duration }),
  info: (msg: string, duration?: number) => addToastCallback({ message: msg, type: 'info', duration })
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  useEffect(() => {
    addToastCallback = (toastProps) => {
      const id = `toast-${toastIdCounter++}`;
      setToasts(prev => [...prev, { ...toastProps, id }]);
    };
  }, []);

  const handleClose = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <Toast key={t.id} {...t} onClose={handleClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}
