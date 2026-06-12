import React from 'react';
import { Wrench, AlertTriangle, AlertOctagon, Package, Clock, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface EquipmentTimelineProps {
  activeAsset: string;
}

export default function EquipmentTimeline({ activeAsset }: EquipmentTimelineProps) {
  const timelineMap: Record<string, Array<{
    date: string;
    type: string;
    label: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
  }>> = {
    "MOTOR-4": [
      { date: "2026-04-22", type: "MAINTENANCE", label: "Lubrication", icon: Wrench, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]" },
      { date: "2026-05-22", type: "ALERT", label: "Maint Due", icon: AlertTriangle, color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
      { date: "2026-06-02", type: "ALERT", label: "Vibration Alert", icon: AlertTriangle, color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
      { date: "2026-06-05", type: "FAILURE_RISK", label: "High Risk", icon: AlertOctagon, color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]" },
      { date: "2026-06-05", type: "PROCUREMENT", label: "Spare Reserved", icon: Package, color: "text-[#10b981]", bg: "bg-[rgba(16,185,129,0.1)]", border: "border-[rgba(16,185,129,0.3)]" }
    ],
    "COOLING-CS01": [
      { date: "2026-03-10", type: "MAINTENANCE", label: "Filter Replaced", icon: Wrench, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]" },
      { date: "2026-05-01", type: "MAINTENANCE", label: "Fluid Refilled", icon: Wrench, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]" },
      { date: "2026-06-08", type: "ALERT", label: "Pressure Warning", icon: AlertTriangle, color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" },
      { date: "2026-06-09", type: "FAILURE_RISK", label: "Flow Drop Critical", icon: AlertOctagon, color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]" }
    ],
    "GEARBOX-GB02": [
      { date: "2026-02-15", type: "MAINTENANCE", label: "Oil Change", icon: Wrench, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]" },
      { date: "2026-06-07", type: "ALERT", label: "Low Oil Level", icon: AlertTriangle, color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]" },
      { date: "2026-06-08", type: "ALERT", label: "Vibration Spike", icon: AlertTriangle, color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]" }
    ],
    "PRESS-HP02": [
      { date: "2026-01-20", type: "MAINTENANCE", label: "Seal Replacement", icon: Wrench, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]" },
      { date: "2026-05-20", type: "MAINTENANCE", label: "Routine Inspection", icon: Info, color: "text-[#10b981]", bg: "bg-[rgba(16,185,129,0.1)]", border: "border-[rgba(16,185,129,0.3)]" },
      { date: "2026-06-09", type: "INFO", label: "Telemetry Nominal", icon: Info, color: "text-zinc-400", bg: "bg-[rgba(255,255,255,0.05)]", border: "border-[rgba(255,255,255,0.1)]" }
    ],
    "CONVEYOR-C01": [
      { date: "2026-03-05", type: "MAINTENANCE", label: "Belt Adjusted", icon: Wrench, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]" },
      { date: "2026-06-01", type: "INFO", label: "Speed Calibration", icon: Info, color: "text-[#10b981]", bg: "bg-[rgba(16,185,129,0.1)]", border: "border-[rgba(16,185,129,0.3)]" },
      { date: "2026-06-09", type: "INFO", label: "Telemetry Nominal", icon: Info, color: "text-zinc-400", bg: "bg-[rgba(255,255,255,0.05)]", border: "border-[rgba(255,255,255,0.1)]" }
    ]
  };

  const events = timelineMap[activeAsset] || timelineMap["MOTOR-4"];

  return (
    <div className="glass-panel-premium flex flex-col h-full">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center gap-2 bg-[rgba(255,255,255,0.02)]">
        <Clock className="w-4 h-4 text-[#00f0ff]" />
        <h2 className="text-sm font-semibold text-white tracking-wide">Timeline ({activeAsset})</h2>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="relative border-l border-[rgba(255,255,255,0.1)] ml-3 space-y-5">
          {events.map((event, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-6"
            >
              {/* Timeline Node */}
              <div className={`absolute -left-3 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center ${event.bg} ${event.border} ${event.color} bg-[#121315]`}>
                <event.icon className="w-3 h-3" />
              </div>
              
              {/* Content */}
              <div className="flex flex-col">
                <span className="data-md text-[10px] text-zinc-500 mb-0.5">{event.date}</span>
                <div className={`label-caps px-2 py-1 rounded inline-flex border w-max text-[9px] ${event.bg} ${event.border} ${event.color}`}>
                  {event.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
