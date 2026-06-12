import React from 'react';
import { Microscope, BrainCircuit, History, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeepExplanationProps {
  activeAsset: string;
}

export default function DeepExplanation({ activeAsset }: DeepExplanationProps) {
  const explanationMap: Record<string, {
    features: Array<{ name: string; weight: number; color: string; glow: string }>;
    history: Array<{ id: string; desc: string; match: string; color: string; border: string }>;
    drivers: Array<{ text: string; color: string; bg: string; border: string }>;
  }> = {
    "MOTOR-4": {
      features: [
        { name: "Vibration Feature Weight", weight: 42, color: "bg-[#ff3d00]", glow: "glow-red" },
        { name: "Temp Feature Weight", weight: 28, color: "bg-[#ffb800]", glow: "glow-amber" }
      ],
      history: [
        { id: "Case FR-2025-110", desc: "Similar: Equipment, Sensor Pattern", match: "89% Match", color: "text-[#00f0ff]", border: "border-[#00f0ff]" },
        { id: "Case WO-2024-042", desc: "Similar: Failure Mode", match: "74% Match", color: "text-[#ffb800]", border: "border-[#ffb800]" }
      ],
      drivers: [
        { text: "High Vibration Velocity", color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]" },
        { text: "Coolant Pressure Drop", color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
        { text: "Age: 4.2 Years", color: "text-zinc-300", bg: "bg-[rgba(255,255,255,0.05)]", border: "border-[rgba(255,255,255,0.1)]" }
      ]
    },
    "COOLING-CS01": {
      features: [
        { name: "Flow Rate Weight", weight: 55, color: "bg-[#ff3d00]", glow: "glow-red" },
        { name: "Fluid Pressure Weight", weight: 35, color: "bg-[#ffb800]", glow: "glow-amber" }
      ],
      history: [
        { id: "Case FR-2024-089", desc: "Similar: Flow Drop, Pressure Drop", match: "92% Match", color: "text-[#00f0ff]", border: "border-[#00f0ff]" },
        { id: "Case WO-2025-012", desc: "Similar: Contamination Profile", match: "68% Match", color: "text-[#ffb800]", border: "border-[#ffb800]" }
      ],
      drivers: [
        { text: "Suspended Particulates", color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]" },
        { text: "Filter Blockage", color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
        { text: "Tube Scaling", color: "text-zinc-300", bg: "bg-[rgba(255,255,255,0.05)]", border: "border-[rgba(255,255,255,0.1)]" }
      ]
    },
    "GEARBOX-GB02": {
      features: [
        { name: "Oil Level Weight", weight: 48, color: "bg-[#ff3d00]", glow: "glow-red" },
        { name: "Vibration Weight", weight: 32, color: "bg-[#ffb800]", glow: "glow-amber" }
      ],
      history: [
        { id: "Case FR-2023-142", desc: "Similar: Gasket Failure", match: "81% Match", color: "text-[#00f0ff]", border: "border-[#00f0ff]" },
        { id: "Case WO-2024-219", desc: "Similar: Low Oil Telemetry", match: "70% Match", color: "text-[#ffb800]", border: "border-[#ffb800]" }
      ],
      drivers: [
        { text: "Output Shaft Seal Leak", color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]" },
        { text: "Low Lubricant Level", color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
        { text: "Mechanical Gear Pitting", color: "text-zinc-300", bg: "bg-[rgba(255,255,255,0.05)]", border: "border-[rgba(255,255,255,0.1)]" }
      ]
    },
    "PRESS-HP02": {
      features: [
        { name: "Pressure Weight", weight: 10, color: "bg-[#00f0ff]", glow: "" },
        { name: "Temp Weight", weight: 5, color: "bg-[#00f0ff]", glow: "" }
      ],
      history: [],
      drivers: [
        { text: "All Parameters Nominal", color: "text-[#10b981]", bg: "bg-[rgba(16,185,129,0.1)]", border: "border-[rgba(16,185,129,0.3)]" }
      ]
    },
    "CONVEYOR-C01": {
      features: [
        { name: "Motor Temp Weight", weight: 12, color: "bg-[#00f0ff]", glow: "" },
        { name: "Belt Speed Weight", weight: 8, color: "bg-[#00f0ff]", glow: "" }
      ],
      history: [
        { id: "Case WO-2025-304", desc: "Similar: Roller Wear", match: "62% Match", color: "text-[#ffb800]", border: "border-[#ffb800]" }
      ],
      drivers: [
        { text: "Minor Belt Friction", color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
        { text: "Normal Operating Age", color: "text-zinc-300", bg: "bg-[rgba(255,255,255,0.05)]", border: "border-[rgba(255,255,255,0.1)]" }
      ]
    }
  };

  const activeExp = explanationMap[activeAsset] || explanationMap["MOTOR-4"];

  return (
    <div className="glass-panel-premium flex flex-col h-full border-[#00f0ff] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#00f0ff] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>

      <div className="p-4 border-b border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Microscope className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Deep Explanation Mode</h2>
        </div>
        <span className="label-caps text-[#00f0ff] bg-[rgba(0,240,255,0.1)] px-2 py-0.5 rounded animate-pulse">Transparent AI</span>
      </div>
      
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar z-10">
        {/* ML Signals */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-[#121315] border border-[rgba(255,255,255,0.05)] rounded p-4 flex flex-col gap-3">
          <h3 className="label-caps text-zinc-400 flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5" /> Random Forest Signals
          </h3>
          <div className="space-y-2">
            {activeExp.features.map((f, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">{f.name}</span>
                  <span className="font-mono text-zinc-300 font-bold">{f.weight}%</span>
                </div>
                <div className="w-full bg-[rgba(255,255,255,0.05)] h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${f.color} ${f.glow}`} style={{ width: `${f.weight}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Historical Context */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-[#121315] border border-[rgba(255,255,255,0.05)] rounded p-4 flex flex-col gap-3">
          <h3 className="label-caps text-zinc-400 flex items-center gap-2">
            <History className="w-3.5 h-3.5" /> Historical Matches
          </h3>
          <div className="flex flex-col gap-2">
            {activeExp.history.length === 0 ? (
              <div className="text-xs text-zinc-500 italic mt-4 text-center">No historical failure matches found.</div>
            ) : (
              activeExp.history.map((h, idx) => (
                <div key={idx} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded p-2 flex justify-between items-center">
                  <div>
                    <span className="block text-xs font-medium text-white mb-0.5">{h.id}</span>
                    <span className="block text-[10px] text-zinc-500 font-mono">{h.desc}</span>
                  </div>
                  <span className={`label-caps bg-opacity-10 px-1.5 py-0.5 rounded border text-[10px] ${h.color} ${h.border}`}>
                    {h.match}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Risk Contributors */}
        <motion.div whileHover={{ scale: 1.01 }} className="col-span-1 md:col-span-2 bg-[#121315] border border-[rgba(255,255,255,0.05)] shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded p-4">
           <h3 className="label-caps text-[#ffb800] flex items-center gap-2 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> Risk Drivers
          </h3>
          <div className="flex gap-2 flex-wrap">
            {activeExp.drivers.map((d, idx) => (
              <span key={idx} className={`text-xs px-2 py-1 rounded border ${d.color} ${d.bg} ${d.border}`}>
                {d.text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
