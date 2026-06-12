"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Bell, 
  Map, 
  Server, 
  Stethoscope, 
  ClipboardList, 
  MessageSquare, 
  Package, 
  FileText, 
  Network, 
  BookOpen, 
  Settings, 
  Factory,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Automatically close sidebar when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(6,182,212,0.1)] text-[#06b6d4] border border-[rgba(6,182,212,0.2)]"
      : "flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors";
  };

  return (
    <>
      {/* Floating Toggle Shutter Button (Visible when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open Sidebar"
            className="fixed top-4 left-4 z-40 p-3 rounded-lg border bg-[#0a0b0d]/90 border-zinc-800 text-zinc-400 hover:text-white backdrop-blur-md transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-[#06b6d4]/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Shutter Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm z-40 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Slide-out Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed top-0 left-0 bottom-0 w-64 border-r border-[#3f3f46] bg-[#09090b] flex flex-col z-50 shadow-[8px_0_30px_rgba(0,0,0,0.7)]"
          >
            {/* Shutter Header inside the Drawer */}
            <div className="p-4 flex items-center justify-between border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <Factory className="text-[#06b6d4] w-7 h-7 animate-pulse" />
                <h1 className="text-lg font-bold tracking-wider text-white">ForgeMind<span className="text-[#06b6d4]">AI</span></h1>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Sidebar"
                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
              <Link href="/" className={getLinkClass("/")}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium text-sm">War Room</span>
              </Link>
              <Link href="/alerts" className={getLinkClass("/alerts")}>
                <Bell className="w-5 h-5" />
                <span className="font-medium text-sm">Alerts</span>
              </Link>
              <Link href="/heatmap" className={getLinkClass("/heatmap")}>
                <Map className="w-5 h-5" />
                <span className="font-medium text-sm">Risk Heatmap</span>
              </Link>
              <Link href="/equipment" className={getLinkClass("/equipment")}>
                <Server className="w-5 h-5" />
                <span className="font-medium text-sm">Equipment</span>
              </Link>
              <Link href="/diagnosis" className={getLinkClass("/diagnosis")}>
                <Stethoscope className="w-5 h-5" />
                <span className="font-medium text-sm">AI Diagnosis</span>
              </Link>
              <Link href="/work-orders" className={getLinkClass("/work-orders")}>
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium text-sm">Work Orders</span>
              </Link>
              <Link href="/chat" className={getLinkClass("/chat")}>
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium text-sm">AI Chat</span>
              </Link>
              <Link href="/spare-parts" className={getLinkClass("/spare-parts")}>
                <Package className="w-5 h-5" />
                <span className="font-medium text-sm">Spare Parts</span>
              </Link>
              <Link href="/reports" className={getLinkClass("/reports")}>
                <FileText className="w-5 h-5" />
                <span className="font-medium text-sm">Reports</span>
              </Link>
              <Link href="/knowledge-graph" className={getLinkClass("/knowledge-graph")}>
                <Network className="w-5 h-5" />
                <span className="font-medium text-sm">Knowledge Graph</span>
              </Link>
              <Link href="/knowledge" className={getLinkClass("/knowledge")}>
                <BookOpen className="w-5 h-5" />
                <span className="font-medium text-sm">Knowledge Base</span>
              </Link>
            </nav>

            <div className="p-4 border-t border-zinc-800/80">
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-[#18181b] transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-medium text-sm">Settings</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
