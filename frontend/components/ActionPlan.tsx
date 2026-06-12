import React, { useState, useEffect } from 'react';
import { Lightbulb, Wrench, PackageSearch, Check, X, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionPlanProps {
  activeAsset: string;
  refetchLogs: () => void;
}

export default function ActionPlan({ activeAsset, refetchLogs }: ActionPlanProps) {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [expedited, setExpedited] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset local interactive state when selected asset changes
  useEffect(() => {
    setDecision('pending');
    setExpedited(false);
  }, [activeAsset]);

  const planMap: Record<string, {
    rec: string;
    sku: string;
    stock: number;
    rul: string;
  }> = {
    "MOTOR-4": {
      rec: "Halt production line C-01. Inspect and replace main drive bearing on MOTOR-4. Check COOLING-CS01 fluid line for blockages.",
      sku: "SKF Bearing (SKU-8821)",
      stock: 0,
      rul: "RUL: 2 Days"
    },
    "COOLING-CS01": {
      rec: "Flush coolant lines and replace filter element in block CS-01. Inspect feed pump for cavitation.",
      sku: "Coolant Filter Element (SKU-4412)",
      stock: 2,
      rul: "RUL: 1 Day"
    },
    "GEARBOX-GB02": {
      rec: "Schedule immediate inspection of output shaft seal. Top up gear oil and replace worn gaskets.",
      sku: "Gasket Kit & Gear Oil (SKU-1090)",
      stock: 5,
      rul: "RUL: 3 Days"
    },
    "PRESS-HP02": {
      rec: "No active maintenance required. Continue standard logging and periodic temperature inspections.",
      sku: "Hydraulic Seal Kit (SKU-5582)",
      stock: 1,
      rul: "Nominal"
    },
    "CONVEYOR-C01": {
      rec: "Monitor belt speed and motor friction. Schedule routine roller lubrication during next planned shift change.",
      sku: "Drive Belt (SKU-9281)",
      stock: 3,
      rul: "RUL: 8 Days"
    }
  };

  const activePlan = planMap[activeAsset] || planMap["MOTOR-4"];

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: activeAsset,
          recommendation: activePlan.rec,
          feedback: status,
          reason: `Operator decision: ${status.toUpperCase()}.`
        })
      });

      if (res.ok) {
        setDecision(status);
        refetchLogs();
      }
    } catch (err) {
      console.warn("Offline: local action applied.");
      setDecision(status);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpedite = async () => {
    if (expedited) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: activeAsset,
          recommendation: `Expedite Spare Part: ${activePlan.sku}`,
          feedback: 'expedited',
          reason: 'Operator initiated expedited order for out-of-stock spare parts.'
        })
      });

      if (res.ok) {
        setExpedited(true);
        refetchLogs();
      }
    } catch (err) {
      console.warn("Offline: local order expedited.");
      setExpedited(true);
    } finally {
      setSubmitting(false);
    }
  };

  const isCritical = activePlan.rul.includes("1 Day") || activePlan.rul.includes("2 Days");

  return (
    <div className={`glass-panel-premium flex flex-col h-full relative overflow-hidden transition-all ${
      decision === 'approved' ? 'border-[#10b981]/50' : decision === 'rejected' ? 'border-[#ff3d00]/50' : isCritical ? 'border-[#ff3d00]/30 animate-pulse' : 'border-[#10b981]/20'
    }`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>

      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#10b981]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Action Plan</h2>
        </div>
        <span className={`label-caps px-2 py-0.5 rounded text-[10px] font-bold ${
          isCritical ? 'bg-[#ff3d00] text-black' : 'bg-[rgba(16,185,129,0.1)] text-[#10b981]'
        }`}>
          {activePlan.rul}
        </span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col gap-4 z-10 overflow-y-auto custom-scrollbar justify-between">
        
        {/* Recommendation Protocol */}
        <div className="flex flex-col gap-3">
          <motion.div whileHover={{ y: -2 }} className={`p-4 rounded border transition-all ${
            decision === 'approved' ? 'bg-[rgba(16,185,129,0.04)] border-[#10b981]' : decision === 'rejected' ? 'bg-[rgba(255,61,0,0.04)] border-[#ff3d00]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]'
          }`}>
            <h3 className={`label-caps mb-2 flex items-center gap-2 text-xs ${
              decision === 'approved' ? 'text-[#10b981]' : decision === 'rejected' ? 'text-[#ff3d00]' : 'text-zinc-400'
            }`}>
              <Wrench className="w-3.5 h-3.5" /> Maintenance Protocol
            </h3>
            <p className="text-xs text-zinc-200 font-medium leading-relaxed">
              {activePlan.rec}
            </p>
          </motion.div>

          {/* Decision Buttons */}
          {decision === 'pending' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDecision('approved')}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 py-2 rounded bg-[#10b981] hover:bg-[#059669] text-black font-bold label-caps text-[10px] cursor-pointer transition-colors shadow-[0_0_12px_rgba(16,185,129,0.15)] disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Approve Plan
              </button>
              <button
                onClick={() => handleDecision('rejected')}
                disabled={submitting}
                className="flex items-center justify-center gap-1.5 py-2 rounded bg-[rgba(255,61,0,0.15)] hover:bg-[rgba(255,61,0,0.25)] border border-[#ff3d00]/30 text-[#ff3d00] font-bold label-caps text-[10px] cursor-pointer transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Reject Plan
              </button>
            </div>
          ) : (
            <div className={`flex items-center gap-2 p-2 rounded text-xs font-bold border justify-center ${
              decision === 'approved' ? 'bg-[rgba(16,185,129,0.08)] border-[#10b981]/30 text-[#10b981]' : 'bg-[rgba(255,61,0,0.08)] border-[#ff3d00]/30 text-[#ff3d00]'
            }`}>
              {decision === 'approved' ? (
                <>
                  <Check className="w-4 h-4" /> RECOMMENDATION APPROVED & ROUTED
                </>
              ) : (
                <>
                  <X className="w-4 h-4" /> RECOMMENDATION REJECTED / AUDITED
                </>
              )}
            </div>
          )}
        </div>

        {/* Procurement Section */}
        <motion.div whileHover={{ y: -2 }} className="bg-[#121315] border border-[rgba(255,255,255,0.05)] rounded p-4 mt-auto">
          <h3 className="label-caps text-zinc-400 mb-2 flex items-center gap-2 text-[10px]">
            <PackageSearch className="w-3.5 h-3.5" /> Procurement Action
          </h3>
          <div className="flex items-center justify-between mt-3 gap-2">
            <span className="text-xs text-zinc-300 font-medium truncate">{activePlan.sku}</span>
            <span className={`label-caps text-[10px] px-2 py-0.5 rounded border whitespace-nowrap ${
              expedited ? 'text-[#00f0ff] bg-[rgba(0,240,255,0.1)] border-[#00f0ff]' : activePlan.stock > 0 ? 'text-[#10b981] bg-[rgba(16,185,129,0.1)] border-[#10b981]' : 'text-[#ff3d00] bg-[rgba(255,61,0,0.1)] border-[#ff3d00]'
            }`}>
              {expedited ? 'EXPEDITED • IN TRANSIT' : activePlan.stock > 0 ? `${activePlan.stock} IN STOCK` : '0 IN STOCK'}
            </span>
          </div>

          {activePlan.stock === 0 && !expedited && (
            <button 
              onClick={handleExpedite}
              disabled={submitting}
              className="mt-3 w-full bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.3)] text-center py-2 rounded text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Expedite Order"}
            </button>
          )}

          {expedited && (
            <div className="mt-3 w-full bg-[rgba(16,185,129,0.08)] border border-[#10b981]/30 text-[#10b981] text-center py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> Procurement Initiated (T-1 Day Delivery)
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
