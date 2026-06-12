import React from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendationConfidence() {
  const criteria = [
    "Historical Match Found",
    "Maintenance Evidence Found",
    "Sensor Trend Confirmed",
    "Failure Propagation Verified"
  ];

  return (
    <div className="glass-panel-premium flex flex-col h-full border-[#00f0ff] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#00f0ff] opacity-[0.05] blur-2xl rounded-full pointer-events-none"></div>

      <div className="p-3 border-b border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">System Confidence</h2>
        </div>
        <span className="label-caps bg-[rgba(0,240,255,0.1)] text-[#00f0ff] border border-[#00f0ff] px-2 py-0.5 rounded">HIGH</span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col justify-center z-10">
        <div className="space-y-2.5">
          {criteria.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center gap-2 text-xs font-medium text-zinc-300"
            >
              <CheckCircle2 className="w-4 h-4 text-[#10b981] drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
