import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, HeartPulse, Stethoscope, AlertTriangle } from 'lucide-react';

interface PlantStats {
  total_equipment: number;
  active_alerts: number;
  critical_alerts: number;
  equipment_health_avg: number;
  diagnoses_today: number;
}

export default function PlantOverviewKPI({ stats }: { stats: PlantStats | null }) {
  if (!stats) return null;

  const kpis = [
    { label: "Total Equipment", value: stats.total_equipment, icon: <Activity className="w-5 h-5 text-blue-400" />, color: "border-blue-500/30 bg-blue-500/10" },
    { label: "Active Alerts", value: stats.active_alerts, icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />, color: "border-yellow-500/30 bg-yellow-500/10" },
    { label: "Critical Alerts", value: stats.critical_alerts, icon: <ShieldAlert className="w-5 h-5 text-red-500" />, color: "border-red-500/30 bg-red-500/10" },
    { label: "Avg Health Score", value: `${stats.equipment_health_avg}%`, icon: <HeartPulse className="w-5 h-5 text-green-400" />, color: "border-green-500/30 bg-green-500/10" },
    { label: "Diagnoses Today", value: stats.diagnoses_today, icon: <Stethoscope className="w-5 h-5 text-purple-400" />, color: "border-purple-500/30 bg-purple-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all ${kpi.color}`}
        >
          <div className="p-2 rounded-full bg-black/20">
            {kpi.icon}
          </div>
          <div>
            <p className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">{kpi.label}</p>
            <p className="text-2xl font-bold text-white drop-shadow-md">{kpi.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
