import React, { useState, useEffect } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface WhatChangedCardProps {
  activeAsset: string;
}

export default function WhatChangedCard({ activeAsset }: WhatChangedCardProps) {
  const deltaMetricsMap: Record<string, Array<{
    label: string;
    pct: string;
    isUp: boolean;
    isCritical: boolean;
    absolute: string;
    velocity: string;
    accel: string;
  }>> = {
    "MOTOR-4": [
      { label: "Vibration Shift", pct: "+162.2%", isUp: true, isCritical: true, absolute: "2.6 → 6.8", velocity: "+.14", accel: "Stable" },
      { label: "Temp Shift", pct: "+26.3%", isUp: true, isCritical: false, absolute: "55 → 69", velocity: "+.49", accel: "Stable" }
    ],
    "COOLING-CS01": [
      { label: "Flow Rate Shift", pct: "-72.4%", isUp: false, isCritical: true, absolute: "45 → 12.4", velocity: "-2.10", accel: "Accelerating" },
      { label: "Contamination Shift", pct: "+1560%", isUp: true, isCritical: true, absolute: "15 → 250", velocity: "+12.5", accel: "Accelerating" }
    ],
    "GEARBOX-GB02": [
      { label: "Vibration Shift", pct: "+127.5%", isUp: true, isCritical: false, absolute: "1.8 → 4.2", velocity: "+.08", accel: "Stable" },
      { label: "Oil Level Shift", pct: "-52.6%", isUp: false, isCritical: true, absolute: "95 → 45", velocity: "-1.20", accel: "Stable" }
    ],
    "PRESS-HP02": [
      { label: "Pressure Shift", pct: "-2.0%", isUp: false, isCritical: false, absolute: "148 → 145", velocity: "-0.10", accel: "Stable" },
      { label: "Temp Shift", pct: "+3.9%", isUp: true, isCritical: false, absolute: "40.5 → 42.1", velocity: "+0.05", accel: "Stable" }
    ],
    "CONVEYOR-C01": [
      { label: "Motor Temp Shift", pct: "+7.1%", isUp: true, isCritical: false, absolute: "45 → 48.2", velocity: "+0.10", accel: "Stable" },
      { label: "Belt Speed Shift", pct: "-10.0%", isUp: false, isCritical: false, absolute: "2.0 → 1.8", velocity: "-0.02", accel: "Stable" }
    ]
  };

  const [liveDeltas, setLiveDeltas] = useState<any[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSensorData = async () => {
      try {
        const res = await fetch(`http://localhost:8001/api/sensors/${activeAsset}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.trend && data.trend.length > 0) {
             const startRow = data.trend[0];
             const endRow = data.trend[data.trend.length - 1];
             
             // Define what keys to track for delta computation
             const trackingKeys: Record<string, {key: string, label: string, criticalThreshold?: number, lowerIsWorse?: boolean}[]> = {
               "MOTOR-4": [
                 {key: "vibration_mm_s", label: "Vibration Shift", criticalThreshold: 4.5},
                 {key: "temperature_c", label: "Temp Shift", criticalThreshold: 65}
               ],
               "COOLING-CS01": [
                 {key: "flow_rate_lpm", label: "Flow Rate Shift", criticalThreshold: 20, lowerIsWorse: true},
                 {key: "pressure_bar", label: "Pressure Shift", criticalThreshold: 5}
               ],
               "GEARBOX-GB02": [
                 {key: "vibration_mm_s", label: "Vibration Shift", criticalThreshold: 3.5},
                 {key: "oil_temp_c", label: "Oil Temp Shift", criticalThreshold: 75}
               ],
               "PRESS-HP02": [
                 {key: "pressure_bar", label: "Pressure Shift", criticalThreshold: 130, lowerIsWorse: true},
                 {key: "fluid_temp_c", label: "Temp Shift", criticalThreshold: 50}
               ],
               "CONVEYOR-C01": [
                 {key: "motor_current_amp", label: "Current Shift", criticalThreshold: 100},
                 {key: "speed_m_s", label: "Speed Shift", criticalThreshold: 1.5, lowerIsWorse: true}
               ]
             };
             
             const keysToTrack = trackingKeys[activeAsset] || trackingKeys["MOTOR-4"];
             
             const newDeltas = keysToTrack.map(k => {
                const startVal = startRow[k.key] || 0;
                const endVal = endRow[k.key] || 0;
                const diff = endVal - startVal;
                const pct = startVal !== 0 ? (diff / startVal) * 100 : 0;
                const isUp = diff >= 0;
                
                let isCritical = false;
                if (k.criticalThreshold) {
                    isCritical = k.lowerIsWorse ? endVal < k.criticalThreshold : endVal > k.criticalThreshold;
                } else {
                    isCritical = Math.abs(pct) > 25;
                }
                
                return {
                  label: k.label,
                  pct: `${diff >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
                  isUp: isUp,
                  isCritical: isCritical,
                  absolute: `${startVal.toFixed(1)} → ${endVal.toFixed(1)}`,
                  velocity: `${diff >= 0 ? '+' : ''}${(diff / data.trend.length).toFixed(2)}`,
                  accel: Math.abs(pct) > 30 ? "Accelerating" : "Stable"
                };
             });
             setLiveDeltas(newDeltas);
          }
        }
      } catch (e) {
        if (isMounted) setLiveDeltas(null);
      }
    };
    
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeAsset]);

  const activeDeltas = liveDeltas || deltaMetricsMap[activeAsset] || deltaMetricsMap["MOTOR-4"];
  const isAccelerating = activeDeltas.some(d => d.accel === "Accelerating");

  return (
    <div className="glass-panel-premium flex flex-col h-full overflow-hidden border-[#ff3d00] relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff3d00] opacity-[0.05] blur-3xl rounded-full pointer-events-none"></div>

      <div className="p-4 border-b border-[rgba(255,61,0,0.2)] bg-[rgba(255,61,0,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#ff3d00]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Delta Intelligence</h2>
        </div>
        <span className={`label-caps px-2 py-0.5 rounded ${isAccelerating ? 'bg-[#ff3d00] text-black animate-pulse font-bold' : 'bg-[rgba(255,61,0,0.1)] text-[#ff3d00]'}`}>
          {isAccelerating ? 'Accelerating' : 'Stable'}
        </span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-4 z-10 overflow-y-auto custom-scrollbar">
        {activeDeltas.map((d, index) => (
          <motion.div 
            key={index}
            whileHover={{ x: 4 }} 
            className={`bg-[#121315] border p-3 rounded transition-all ${
              d.isCritical ? 'border-[#ff3d00] border-opacity-40 shadow-[0_0_12px_rgba(255,61,0,0.05)]' : 'border-[rgba(255,255,255,0.05)]'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="label-caps text-zinc-400 text-[10px]">{d.label}</span>
              <span className={`label-caps px-1.5 rounded flex items-center gap-1 text-[10px] ${
                d.isCritical ? 'bg-[rgba(255,61,0,0.15)] text-[#ff3d00] font-bold' : d.isUp ? 'bg-[rgba(255,184,0,0.1)] text-[#ffb800]' : 'bg-[rgba(0,240,255,0.1)] text-[#00f0ff]'
              }`}>
                {d.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {d.pct}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block label-caps text-zinc-600 mb-0.5 text-[8px]">Absolute</span>
                <span className="data-md text-white text-xs font-mono">{d.absolute}</span>
              </div>
              <div>
                <span className="block label-caps text-[#ffb800] mb-0.5 text-[8px]">Velocity</span>
                <span className="data-md text-zinc-300 text-xs font-mono">{d.velocity}</span>
              </div>
              <div>
                <span className="block label-caps text-[#00f0ff] mb-0.5 text-[8px]">Accel</span>
                <span className={`data-md text-xs font-mono ${d.accel === 'Accelerating' ? 'text-[#ff3d00] font-bold' : 'text-zinc-300'}`}>
                  {d.accel}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
