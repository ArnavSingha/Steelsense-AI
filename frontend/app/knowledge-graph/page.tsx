"use client";

import React, { useState, useEffect } from 'react';
import FailureGraph from '../../components/FailureGraph';
import { Network, Server, ArrowRight, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { toast } from '../../components/Toast';

interface ImpactDetails {
  root_node: string;
  affected_count: number;
  total_downtime_cost_per_hr: number;
  affected_assets: Array<{
    id: string;
    name: string;
    criticality: string;
    downtime_cost_per_hr: number;
  }>;
}

const DEFAULT_IMPACT: Record<string, ImpactDetails> = {
  "COOLING-CS01": {
    root_node: "COOLING-CS01",
    affected_count: 3,
    total_downtime_cost_per_hr: 3300000, // ₹33L total
    affected_assets: [
      { id: "COOLING-CS01", name: "Cooling Water Pump System", criticality: "CRITICAL", downtime_cost_per_hr: 2300000 },
      { id: "MOTOR-4", name: "Rolling Mill Main Motor", criticality: "HIGH", downtime_cost_per_hr: 500000 },
      { id: "GEARBOX-GB02", name: "Rolling Mill Gearbox", criticality: "HIGH", downtime_cost_per_hr: 500000 }
    ]
  },
  "MOTOR-4": {
    root_node: "MOTOR-4",
    affected_count: 2,
    total_downtime_cost_per_hr: 1000000,
    affected_assets: [
      { id: "MOTOR-4", name: "Rolling Mill Main Motor", criticality: "HIGH", downtime_cost_per_hr: 500000 },
      { id: "GEARBOX-GB02", name: "Rolling Mill Gearbox", criticality: "HIGH", downtime_cost_per_hr: 500000 }
    ]
  },
  "GEARBOX-GB02": {
    root_node: "GEARBOX-GB02",
    affected_count: 1,
    total_downtime_cost_per_hr: 500000,
    affected_assets: [
      { id: "GEARBOX-GB02", name: "Rolling Mill Gearbox", criticality: "HIGH", downtime_cost_per_hr: 500000 }
    ]
  },
  "PRESS-HP02": {
    root_node: "PRESS-HP02",
    affected_count: 2,
    total_downtime_cost_per_hr: 600000,
    affected_assets: [
      { id: "PRESS-HP02", name: "Hydraulic Squeeze Press", criticality: "MEDIUM", downtime_cost_per_hr: 400000 },
      { id: "CONVEYOR-C01", name: "Output Slag Conveyor", criticality: "LOW", downtime_cost_per_hr: 200000 }
    ]
  },
  "CONVEYOR-C01": {
    root_node: "CONVEYOR-C01",
    affected_count: 1,
    total_downtime_cost_per_hr: 200000,
    affected_assets: [
      { id: "CONVEYOR-C01", name: "Output Slag Conveyor", criticality: "LOW", downtime_cost_per_hr: 200000 }
    ]
  }
};

export default function KnowledgeGraphPage() {
  const [activeAsset, setActiveAsset] = useState<string>('COOLING-CS01');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [impactData, setImpactData] = useState<ImpactDetails>(DEFAULT_IMPACT["COOLING-CS01"]);

  const fetchImpact = async (asset: string) => {
    try {
      const res = await fetch(`https://steelsense-ai-production.up.railway.app/api/knowledge-graph/impact/${asset}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.affected_assets) {
          setImpactData(data);
        }
      } else {
        // Fallback
        setImpactData(DEFAULT_IMPACT[asset] || DEFAULT_IMPACT["COOLING-CS01"]);
      }
    } catch (e) {
      console.warn("Unable to fetch impact data from backend, using high-fidelity offline data.");
      setImpactData(DEFAULT_IMPACT[asset] || DEFAULT_IMPACT["COOLING-CS01"]);
    }
  };

  useEffect(() => {
    fetchImpact(activeAsset);
  }, [activeAsset]);

  const handleSelectAsset = (asset: string) => {
    const uppercaseAsset = asset.toUpperCase();
    setActiveAsset(uppercaseAsset);
    toast.info(`Graph node selected: ${uppercaseAsset}`);
  };

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Knowledge Graph</h1>
            <p className="label-caps text-zinc-500 mt-0.5">Asset Dependencies & Failure Propagation Path</p>
          </div>
          {/* Demo Mode toggle */}
          <button 
            onClick={() => setDemoMode(!demoMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.05)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.1)] transition-colors text-xs font-bold label-caps"
          >
            <Activity className="w-3.5 h-3.5" />
            {demoMode ? 'Cascade Simulation' : 'Standard Topology'}
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1">
        
        {/* ReactFlow Component Card */}
        <div className="lg:col-span-2 glass-panel-premium flex flex-col min-h-[500px]">
          <FailureGraph 
            demoMode={demoMode} 
            activeAsset={activeAsset} 
            onSelectAsset={handleSelectAsset} 
          />
        </div>

        {/* Downstream Impact Panel */}
        <div className="glass-panel-premium p-4 flex flex-col gap-4">
          <div className="border-b border-[rgba(255,255,255,0.08)] pb-2 flex items-center gap-2">
            <Network className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="text-sm font-semibold text-white tracking-wide">Propagation Impact Analysis</h2>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            
            {/* Summary cost & count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/35 border border-zinc-800 p-3 rounded">
                <span className="label-caps text-zinc-500 text-[10px] block">Downstream Cost</span>
                <span className="text-base font-mono font-bold text-red-500 mt-1 block">
                  ₹{(impactData.total_downtime_cost_per_hr / 100000).toFixed(1)}L / hr
                </span>
              </div>
              <div className="bg-black/35 border border-zinc-800 p-3 rounded">
                <span className="label-caps text-zinc-500 text-[10px] block">Impacted Assets</span>
                <span className="text-base font-mono font-bold text-[#00f0ff] mt-1 block">
                  {impactData.affected_count} {impactData.affected_count === 1 ? 'Asset' : 'Assets'}
                </span>
              </div>
            </div>

            {/* Root Asset Details */}
            <div>
              <label className="text-[10px] label-caps text-zinc-500">Selected Node</label>
              <div className="flex items-center gap-2 mt-1">
                <Server className="w-4 h-4 text-[#00f0ff]" />
                <span className="font-mono text-sm font-bold text-white">{activeAsset}</span>
              </div>
            </div>

            {/* Downstream Path Visualizer */}
            <div>
              <label className="text-[10px] label-caps text-zinc-500 block mb-2">Failure Cascade Propagation</label>
              <div className="flex flex-col gap-2">
                {impactData.affected_assets.map((asset, idx) => (
                  <React.Fragment key={asset.id}>
                    {idx > 0 && (
                      <div className="flex justify-start pl-4">
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 rotate-90 my-0.5" />
                      </div>
                    )}
                    <div className="flex items-center justify-between bg-[rgba(255,255,255,0.02)] border border-zinc-800/80 rounded px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-white">{asset.id}</span>
                        <span className="text-[10px] text-zinc-500">{asset.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-mono block">₹{asset.downtime_cost_per_hr / 100000}L/hr</span>
                        <span className={`text-[9px] font-bold label-caps ${
                          asset.criticality === 'CRITICAL' ? 'text-[#ff3d00]' : 'text-[#ffb800]'
                        }`}>{asset.criticality}</span>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Engineering Recommendation */}
            <div className="mt-auto bg-[rgba(255,61,0,0.03)] border border-[rgba(255,61,0,0.2)] rounded p-3 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-[#ff3d00] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white mb-1">CASCADING FAILURE WARNING</h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  If {activeAsset} undergoes failure, {impactData.affected_count > 1 ? `the downstream units (${impactData.affected_assets.filter(a => a.id !== activeAsset).map(a => a.id).join(', ')}) will encounter force shutdown.` : 'no secondary systems will propagate failure.'} Perform priority check now.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
