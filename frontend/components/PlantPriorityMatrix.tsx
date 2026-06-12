import React from 'react';
import { LayoutGrid, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface PlantPriorityMatrixProps {
  activeAsset: string;
  onSelectAsset: (asset: string) => void;
}

export default function PlantPriorityMatrix({ activeAsset, onSelectAsset }: PlantPriorityMatrixProps) {
  const matrix = [
    { asset: "COOLING-CS01", type: "Cooling System", priority: "CRITICAL", downtime: "₹23L/hr", propagation: "5 Assets", color: "text-[#ff3d00]", bg: "bg-[rgba(255,61,0,0.1)]", border: "border-[rgba(255,61,0,0.3)]", icon: AlertCircle },
    { asset: "MOTOR-4", type: "Rolling Mill", priority: "HIGH", downtime: "₹5L/hr", propagation: "0 Assets", color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]", icon: TrendingUp },
    { asset: "GEARBOX-GB02", type: "Transmission", priority: "HIGH", downtime: "₹5L/hr", propagation: "0 Assets", color: "text-[#ffb800]", bg: "bg-[rgba(255,184,0,0.1)]", border: "border-[rgba(255,184,0,0.3)]", icon: TrendingUp },
    { asset: "CONVEYOR-C01", type: "Transport", priority: "MEDIUM", downtime: "₹2L/hr", propagation: "0 Assets", color: "text-[#00f0ff]", bg: "bg-[rgba(0,240,255,0.1)]", border: "border-[rgba(0,240,255,0.3)]", icon: CheckCircle2 },
    { asset: "PRESS-HP02", type: "Hydraulics", priority: "HEALTHY", downtime: "₹4L/hr", propagation: "1 Asset", color: "text-[#10b981]", bg: "bg-[rgba(16,185,129,0.1)]", border: "border-[rgba(16,185,129,0.3)]", icon: CheckCircle2 }
  ];

  return (
    <div className="glass-panel-premium flex flex-col h-full">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Plant Priority Matrix</h2>
        </div>
        <span className="label-caps text-zinc-500">Risk + Criticality + Impact</span>
      </div>
      
      <div className="p-4 flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[450px] lg:min-w-0">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)]">
              <th className="py-2 label-caps text-zinc-500">Asset</th>
              <th className="py-2 label-caps text-zinc-500">Priority</th>
              <th className="py-2 label-caps text-zinc-500">Impact</th>
              <th className="py-2 label-caps text-zinc-500">Propagation</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, idx) => {
              const isSelected = activeAsset === row.asset;
              return (
                <tr 
                  key={idx} 
                  onClick={() => onSelectAsset(row.asset)}
                  className={`border-b border-[rgba(255,255,255,0.03)] transition-colors group cursor-pointer ${
                    isSelected ? 'bg-[rgba(0,240,255,0.06)] border-[#00f0ff]/50' : 'hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  <td className="py-3">
                    <span className={`block text-xs font-bold transition-colors ${isSelected ? 'text-[#00f0ff]' : 'text-zinc-200 group-hover:text-white'}`}>{row.asset}</span>
                    <span className="block text-[10px] text-zinc-500">{row.type}</span>
                  </td>
                  <td className="py-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded label-caps border ${row.bg} ${row.border} ${row.color}`}>
                      <row.icon className="w-3 h-3" />
                      {row.priority}
                    </div>
                  </td>
                  <td className="py-3 data-md text-zinc-300">{row.downtime}</td>
                  <td className="py-3 data-md text-zinc-400">{row.propagation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
