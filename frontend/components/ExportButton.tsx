import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from './Toast';

export default function ExportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type: 'pdf' | 'csv') => {
    // In a real app, this would trigger an API call or generate a blob.
    // For the hackathon demo, we simulate a download.
    toast.success(`Generating ${type.toUpperCase()} Report for Current Shift...`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-xs font-semibold text-white"
      >
        <Download className="w-4 h-4" /> Export Report
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-56 bg-[#121315] border border-[rgba(255,255,255,0.1)] rounded shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden"
          >
            <button 
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left text-sm text-zinc-300 hover:text-white border-b border-[rgba(255,255,255,0.05)]"
            >
              <FileText className="w-4 h-4 text-[#ff3d00]" /> 
              <span>
                <span className="block font-semibold">PDF Executive Summary</span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">Downtime risk & mitigation</span>
              </span>
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left text-sm text-zinc-300 hover:text-white"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#10b981]" /> 
              <span>
                <span className="block font-semibold">CSV Sensor Dump</span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">Raw telemetry (Last 24h)</span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
