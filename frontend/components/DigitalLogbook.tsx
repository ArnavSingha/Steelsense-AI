import React from 'react';
import { BookOpen, Check, Play, Pause, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DigitalLogbookProps {
  logs: Array<{
    time: string;
    asset: string;
    action: string;
    status: string;
  }>;
}

export default function DigitalLogbook({ logs }: DigitalLogbookProps) {
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('complete') || s.includes('approved') || s.includes('accepted') || s.includes('acknowledged')) {
      return { icon: Check, color: "text-[#10b981]" };
    }
    if (s.includes('progress') || s.includes('expedite') || s.includes('transit')) {
      return { icon: Play, color: "text-[#00f0ff]" };
    }
    return { icon: Pause, color: "text-[#ffb800]" };
  };

  return (
    <div className="glass-panel-premium flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Digital Logbook</h2>
        </div>
        <span className="label-caps text-zinc-500">Execution Tracking</span>
      </div>
      
      <div className="p-4 flex-1 overflow-auto max-h-[300px] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[400px] lg:min-w-0">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)]">
              <th className="py-2 label-caps text-zinc-500 text-[10px]">Time</th>
              <th className="py-2 label-caps text-zinc-500 text-[10px]">Asset</th>
              <th className="py-2 label-caps text-zinc-500 text-[10px]">Action</th>
              <th className="py-2 label-caps text-zinc-500 text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.slice().reverse().map((log, idx) => {
              const { icon: Icon, color } = getStatusConfig(log.status);
              return (
                <motion.tr 
                  key={idx} 
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="border-b border-[rgba(255,255,255,0.03)] transition-colors group cursor-default"
                >
                  <td className="py-3 data-md text-zinc-400 text-xs font-mono">{log.time}</td>
                  <td className="py-3 text-xs font-bold text-white">{log.asset}</td>
                  <td className="py-3 text-xs text-zinc-300 font-medium">{log.action}</td>
                  <td className="py-3">
                    <span className={`label-caps flex items-center gap-1 text-[9px] ${color}`}>
                      <Icon className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
