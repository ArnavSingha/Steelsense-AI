import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DegradationChartProps {
  activeAsset: string;
}

export default function DegradationChart({ activeAsset }: DegradationChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration for each asset
  const configMap: Record<string, {key: string, label: string, threshold: number, color: string, unit: string, type: 'upper' | 'lower'}> = {
    "MOTOR-4": { key: "vibration_mm_s", label: "Vibration Velocity", threshold: 4.5, color: "#ff3d00", unit: "mm/s", type: 'upper' },
    "COOLING-CS01": { key: "flow_rate_lpm", label: "Flow Rate", threshold: 20, color: "#ffb800", unit: "L/min", type: 'lower' },
    "GEARBOX-GB02": { key: "vibration_mm_s", label: "Vibration", threshold: 3.5, color: "#ffb800", unit: "mm/s", type: 'upper' },
    "PRESS-HP02": { key: "pressure_bar", label: "Pressure", threshold: 130, color: "#10b981", unit: "Bar", type: 'lower' },
    "CONVEYOR-C01": { key: "motor_current_amp", label: "Motor Current", threshold: 100, color: "#00f0ff", unit: "Amp", type: 'upper' }
  };

  const activeConfig = configMap[activeAsset] || configMap["MOTOR-4"];

  useEffect(() => {
    let isMounted = true;
    const fetchTrend = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:8001/api/sensors/${activeAsset}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.trend) {
            // Format data for recharts
            const formatted = json.trend.map((item: any) => {
               // Extract short date (MM-DD)
               const dateParts = item.timestamp.split('-');
               const shortDate = dateParts.length === 3 ? `${dateParts[1]}-${dateParts[2]}` : item.timestamp;
               return {
                 date: shortDate,
                 value: parseFloat(item[activeConfig.key].toFixed(2)),
                 isAnomaly: item.anomaly_flag === 1
               }
            });
            setData(formatted);
          }
        }
      } catch (e) {
         // Fallback mock data if backend offline
         if (isMounted) {
            const mock = Array.from({length: 30}).map((_, i) => {
              let val = 2.0 + Math.random() * 0.5;
              if (activeAsset === "MOTOR-4" && i > 20) val += (i - 20) * 0.5; // Simulate degradation
              return {
                date: `0${Math.floor(i/10)+1}-${(i%10)+1}`,
                value: parseFloat(val.toFixed(2)),
                isAnomaly: i > 25
              };
            });
            setData(mock);
         }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchTrend();
    const interval = setInterval(fetchTrend, 10000); // 10s poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeAsset, activeConfig.key]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isCritical = activeConfig.type === 'upper' 
        ? dataPoint.value >= activeConfig.threshold 
        : dataPoint.value <= activeConfig.threshold;
        
      return (
        <div className="bg-[#121315] border border-[rgba(255,255,255,0.1)] p-3 rounded shadow-xl">
          <p className="label-caps text-zinc-400 mb-1">{label}</p>
          <p className={`font-mono font-bold ${isCritical ? 'text-[#ff3d00]' : 'text-white'}`}>
            {payload[0].value} {activeConfig.unit}
          </p>
          {dataPoint.isAnomaly && (
            <div className="mt-2 text-[10px] label-caps text-[#ffb800] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Anomaly Flag
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel-premium flex flex-col h-full relative overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">30-Day Degradation Trend</h2>
        </div>
        <span className="label-caps px-2 py-0.5 rounded bg-[rgba(0,240,255,0.1)] text-[#00f0ff]">
          {activeConfig.label}
        </span>
      </div>
      
      <div className="h-[220px] sm:h-[250px] w-full relative p-4">
        {isLoading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickMargin={10}
                tickFormatter={(val) => val}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickFormatter={(val) => val.toFixed(1)}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={activeConfig.threshold} 
                stroke="#ff3d00" 
                strokeDasharray="3 3" 
                label={{ position: 'insideTopLeft', value: 'Threshold', fill: '#ff3d00', fontSize: 10 }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={activeConfig.color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
