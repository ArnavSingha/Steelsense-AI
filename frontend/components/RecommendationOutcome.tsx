import React, { useEffect, useState } from 'react';
import { ActivitySquare, Zap, BarChart3 } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

function Counter({ from, to, duration = 2, prefix = "", suffix = "" }: { from: number, to: number, duration?: number, prefix?: string, suffix?: string }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => `${prefix}${Math.round(latest * 10) / 10}${suffix}`);

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
}

export default function RecommendationOutcome() {
  return (
    <div className="glass-panel-premium flex flex-col h-full overflow-hidden relative">
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ffb800] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>

      <div className="p-3 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <ActivitySquare className="w-4 h-4 text-[#ffb800]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Executive Impact Summary</h2>
        </div>
        <span className="label-caps text-zinc-500">Live Demo Run</span>
      </div>
      
      <div className="flex-1 p-3 flex flex-col gap-3 z-10">
        <div className="grid grid-cols-2 gap-3 h-1/2">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#121315] border border-[rgba(255,184,0,0.2)] rounded p-3 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb800] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="pl-3">
               <span className="data-lg text-white block mb-0.5">
                 <Counter from={0} to={14} suffix=" hrs" />
               </span>
               <span className="label-caps text-zinc-400 block mb-0.5">Downtime Prevented</span>
               <span className="text-[10px] text-[#00f0ff] font-medium">+2 hrs vs last month</span>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#121315] border border-[rgba(16,185,129,0.2)] rounded p-3 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="pl-3">
               <span className="data-lg text-white block mb-0.5">
                 <Counter from={0} to={3.2} prefix="₹" suffix="L" />
               </span>
               <span className="label-caps text-zinc-400 block mb-0.5">Cost Saved</span>
               <span className="text-[10px] text-[#10b981] font-medium">Predictive Actions</span>
            </div>
          </motion.div>
        </div>

        {/* Executive Summary Block */}
        <motion.div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded p-3 h-1/2 flex items-start gap-3">
          <div className="p-2 bg-[rgba(255,255,255,0.05)] rounded mt-1">
            <BarChart3 className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="w-full">
            <h3 className="label-caps text-white mb-2">Expected Benefits</h3>
            <div className="text-xs text-zinc-300 font-medium space-y-1.5">
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div> Reduced unplanned downtime</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div> Faster root-cause identification</div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div> Better spare-part readiness</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
