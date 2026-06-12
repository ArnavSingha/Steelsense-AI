import React from 'react';
import { Search, Database, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface EvidencePanelProps {
  activeAsset: string;
}

export default function EvidencePanel({ activeAsset }: EvidencePanelProps) {
  const contextMap: Record<string, Array<{
    docId: string;
    text: string;
    isAlert: boolean;
  }>> = {
    "MOTOR-4": [
      { docId: "SOP-LUB-001", text: "If vibration velocity exceeds 4.5 mm/s on motor casing, check primary shaft alignment immediately to prevent bearing housing fatigue.", isAlert: false },
      { docId: "WO-2025-1001", text: "Previous failure of COOLING-CS01 caused secondary overheating in MOTOR-4 due to insufficient coolant pressure.", isAlert: true }
    ],
    "COOLING-CS01": [
      { docId: "SOP-COOL-102", text: "Cooling fluid flow rate below 15 L/min will fail to dissipate heat from secondary loops, leading to rapid motor degradation.", isAlert: true },
      { docId: "SOP-CHEM-088", text: "Suspended particulate contamination above 200 ppm indicates filter blockages or pipe scaling.", isAlert: false }
    ],
    "GEARBOX-GB02": [
      { docId: "SOP-GB-334", text: "Vibration above 3.5 mm/s on transmission gears usually points to wear on output shaft seals or gear teeth pitting.", isAlert: false },
      { docId: "SOP-LUB-012", text: "Do not operate gearbox below 50% oil level. Lubrication failure will cause immediate gear weld.", isAlert: true }
    ],
    "PRESS-HP02": [
      { docId: "SOP-HYD-501", text: "Main hydraulic press operating pressure should remain between 140 and 160 Bar during active extrusion cycles.", isAlert: false },
      { docId: "WO-2026-004", text: "Last seal replacement performed on 2026-01-20. Current status is fully nominal.", isAlert: false }
    ],
    "CONVEYOR-C01": [
      { docId: "SOP-CONV-003", text: "Conveyor belt velocity should align with feed rate. Motor temperatures above 65°C indicate drive roller friction.", isAlert: false },
      { docId: "WO-2025-992", text: "Drive belt tension was adjusted to baseline nominal levels. Rollers are fully functional.", isAlert: false }
    ]
  };

  const activeContext = contextMap[activeAsset] || contextMap["MOTOR-4"];

  return (
    <div className="glass-panel-premium flex flex-col h-full border-[#00f0ff] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>

      <div className="p-4 border-b border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">RAG Context Engine</h2>
        </div>
        <span className="label-caps text-[#00f0ff] bg-[rgba(0,240,255,0.1)] px-2 py-0.5 rounded flex items-center gap-1">
          <Search className="w-3 h-3" /> FAISS Active
        </span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 z-10">
        {activeContext.map((c, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ scale: 1.01 }} 
            className="bg-[#121315] border border-[rgba(255,255,255,0.05)] rounded p-3 relative overflow-hidden group"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity ${
              c.isAlert ? 'bg-[#ffb800]' : 'bg-[#00f0ff]'
            }`}></div>
            <div className="pl-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`w-3.5 h-3.5 ${c.isAlert ? 'text-[#ffb800]' : 'text-[#00f0ff]'}`} />
                <span className="label-caps text-zinc-300">{c.docId}</span>
              </div>
              <p className="text-xs text-zinc-400 italic font-medium leading-relaxed">
                "{c.text}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
