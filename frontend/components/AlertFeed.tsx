import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, XCircle, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertFeedProps {
  demoMode: boolean;
  activeAsset: string;
  onSelectAsset: (asset: string) => void;
  refetchLogs: () => void;
}

export default function AlertFeed({ demoMode, activeAsset, onSelectAsset, refetchLogs }: AlertFeedProps) {
  const [acknowledged, setAcknowledged] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});

  const rawAlerts = demoMode ? [
    { id: 1, asset: "COOLING-CS01", type: "CRITICAL", msg: "COOLING-CS01: Fluid pressure drop detected", time: "10:42:01", icon: XCircle, color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]", glow: "glow-red" },
    { id: 2, asset: "MOTOR-4", type: "WARNING", msg: "MOTOR-4: Vibration anomaly pattern matched", time: "10:38:14", icon: AlertTriangle, color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]", glow: "glow-amber" },
    { id: 3, asset: "CONVEYOR-C01", type: "INFO", msg: "CONVEYOR-C01: Shift nominal baseline established", time: "10:15:00", icon: Info, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]", glow: "" }
  ] : [
    { id: 3, asset: "CONVEYOR-C01", type: "INFO", msg: "CONVEYOR-C01: Shift nominal baseline established", time: "10:15:00", icon: Info, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]", glow: "" },
    { id: 4, asset: "MOTOR-4", type: "INFO", msg: "MOTOR-4: Standard telemetry signature within nominal baseline", time: "09:45:12", icon: Info, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]", glow: "" },
    { id: 5, asset: "GEARBOX-GB02", type: "INFO", msg: "GEARBOX-GB02: Vibration and temperature levels are nominal", time: "09:30:00", icon: Info, color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]", glow: "" }
  ];

  const handleAcknowledge = async (e: React.MouseEvent, alert: any) => {
    e.stopPropagation(); // Avoid selecting asset just by clicking acknowledge button
    if (acknowledged[alert.id]) return;

    setSubmitting(prev => ({ ...prev, [alert.id]: true }));
    try {
      const res = await fetch('http://localhost:8001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: alert.asset,
          recommendation: alert.msg,
          feedback: 'acknowledged',
          reason: `Operator acknowledged ${alert.type} alert.`
        })
      });

      if (res.ok) {
        setAcknowledged(prev => ({ ...prev, [alert.id]: true }));
        refetchLogs();
      }
    } catch (err) {
      console.warn("Offline: local acknowledgement applied.");
      setAcknowledged(prev => ({ ...prev, [alert.id]: true }));
    } finally {
      setSubmitting(prev => ({ ...prev, [alert.id]: false }));
    }
  };

  return (
    <div className="glass-panel-premium flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#ffb800]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Live Telemetry Alerts</h2>
        </div>
        <span className="label-caps text-zinc-500">System Log</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
        {rawAlerts.map((alert, idx) => {
          const isSelected = activeAsset === alert.asset;
          const isAck = acknowledged[alert.id];
          const isPending = alert.type !== 'INFO' && !isAck;

          return (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelectAsset(alert.asset)}
              className={`p-3 rounded border flex gap-3 cursor-pointer backdrop-blur-sm relative overflow-hidden group hover:bg-[rgba(255,255,255,0.05)] transition-all ${
                isSelected ? 'border-[#00f0ff] bg-[rgba(0,240,255,0.04)] shadow-[0_0_12px_rgba(0,240,255,0.15)]' : isAck ? 'border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.02)]' : alert.border
              }`}
            >
              {/* Edge Glow Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-50 ${
                isAck ? 'bg-[#10b981]' : isSelected ? 'bg-[#00f0ff]' : alert.glow ? alert.glow.replace('glow-', 'bg-[#') + ']' : 'bg-zinc-700'
              }`}></div>
              
              <alert.icon className={`w-4 h-4 mt-0.5 shrink-0 ${isAck ? 'text-[#10b981]' : alert.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className={`label-caps ${isAck ? 'text-[#10b981]' : alert.color}`}>
                    {isAck ? 'ACKNOWLEDGED' : alert.type}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">{alert.time}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium mb-2 pr-1 truncate md:whitespace-normal">{alert.msg}</p>
                
                {isPending && (
                  <button
                    onClick={(e) => handleAcknowledge(e, alert)}
                    disabled={submitting[alert.id]}
                    className="label-caps px-2 py-1 text-[9px] font-bold rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.1)] text-white hover:text-[#00f0ff] transition-all hover:scale-102 flex items-center gap-1 cursor-pointer"
                  >
                    {submitting[alert.id] ? "Processing..." : <>Acknowledge</>}
                  </button>
                )}

                {isAck && (
                  <div className="flex items-center gap-1 text-[10px] text-[#10b981] font-bold label-caps">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Logged to Command Center
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
