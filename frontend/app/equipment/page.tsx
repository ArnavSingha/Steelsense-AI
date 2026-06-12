"use client";

import React, { useState } from 'react';
import { Server, Activity, Wrench, Battery, Search, Filter, Cpu, Settings, Thermometer } from 'lucide-react';

const equipmentData = [
  { id: "MOTOR-4", name: "Rolling Mill Motor", group: "Mill Drives", status: "Warning", health: 78, nextMaintenance: "2 Days", lastInspected: "2026-06-01" },
  { id: "COOLING-CS01", name: "Main Cooling System", group: "Cooling", status: "Healthy", health: 95, nextMaintenance: "14 Days", lastInspected: "2026-06-05" },
  { id: "PRESS-HP02", name: "Hydraulic Press", group: "Pressing", status: "Healthy", health: 88, nextMaintenance: "30 Days", lastInspected: "2026-05-28" },
  { id: "CONVEYOR-C01", name: "Slag Conveyor", group: "Transport", status: "Critical", health: 45, nextMaintenance: "Overdue", lastInspected: "2026-05-15" },
  { id: "GEARBOX-GB02", name: "Primary Gearbox", group: "Mill Drives", status: "Healthy", health: 92, nextMaintenance: "60 Days", lastInspected: "2026-06-10" },
  { id: "FURNACE-F01", name: "Blast Furnace Alpha", group: "Heating", status: "Healthy", health: 98, nextMaintenance: "90 Days", lastInspected: "2026-06-11" },
];

export default function EquipmentRegistryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentData, setEquipmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch('http://localhost:8001/api/v1/equipment/');
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((eq: any) => ({
            id: eq.id.split('-')[0], // shortened UUID
            name: eq.name,
            group: eq.plant_area,
            status: eq.criticality === 'critical' ? 'Critical' : eq.criticality === 'high' ? 'Warning' : 'Healthy',
            health: eq.criticality === 'critical' ? 45 : eq.criticality === 'high' ? 78 : 95,
            nextMaintenance: eq.criticality === 'critical' ? 'Overdue' : '30 Days',
            lastInspected: eq.last_maintenance_date ? new Date(eq.last_maintenance_date).toLocaleDateString() : 'Unknown'
          }));
          setEquipmentData(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
        // Fallback to mock data if backend is unreachable
        setEquipmentData([
          { id: "MOTOR-4", name: "Rolling Mill Motor", group: "Mill Drives", status: "Warning", health: 78, nextMaintenance: "2 Days", lastInspected: "2026-06-01" },
          { id: "COOLING-CS01", name: "Main Cooling System", group: "Cooling", status: "Healthy", health: 95, nextMaintenance: "14 Days", lastInspected: "2026-06-05" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Critical': return 'text-[#ff3d00] bg-[#ff3d00]/10 border-[#ff3d00]/20';
      case 'Warning': return 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/20';
      case 'Healthy': return 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20';
      default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
    }
  };

  const filteredEquipment = equipmentData.filter(eq => 
    eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    eq.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Server className="w-6 h-6 text-[#00f0ff]" />
          Equipment Registry
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">Asset Inventory & Lifecycle Management</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search assets by ID or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121315] border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <button className="glass-panel-premium px-4 py-2 flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Group By
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map(eq => (
          <div key={eq.id} className="glass-panel-premium flex flex-col hover:border-[#00f0ff]/30 transition-colors group cursor-pointer">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-[#00f0ff] transition-colors">{eq.name}</h3>
                <span className="font-mono text-xs text-zinc-500">{eq.id}</span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(eq.status)}`}>
                {eq.status}
              </span>
            </div>
            
            {/* Body */}
            <div className="p-4 grid grid-cols-2 gap-4 flex-1">
              <div>
                <span className="text-[10px] label-caps text-zinc-500 block mb-1">Health Score</span>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl font-bold leading-none ${eq.health < 50 ? 'text-[#ff3d00]' : eq.health < 80 ? 'text-[#ffb800]' : 'text-[#10b981]'}`}>
                    {eq.health}%
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] label-caps text-zinc-500 block mb-1">Next Maint.</span>
                <span className={`text-sm font-semibold ${eq.nextMaintenance === 'Overdue' ? 'text-[#ff3d00]' : 'text-zinc-300'}`}>
                  {eq.nextMaintenance}
                </span>
              </div>
              <div>
                <span className="text-[10px] label-caps text-zinc-500 block mb-1">Asset Group</span>
                <span className="text-sm text-zinc-300">{eq.group}</span>
              </div>
              <div>
                <span className="text-[10px] label-caps text-zinc-500 block mb-1">Last Inspected</span>
                <span className="text-sm text-zinc-300">{eq.lastInspected}</span>
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="px-4 py-3 bg-[#121315]/50 border-t border-zinc-800/50 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <Thermometer className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
                <Activity className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
                <Battery className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
              </div>
              <button className="text-xs font-semibold text-[#00f0ff] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Settings className="w-3 h-3" /> Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
