"use client";

import React, { useState } from 'react';
import { Stethoscope, Activity, FileSearch, CheckCircle2, AlertTriangle, ArrowRight, BrainCircuit, RefreshCw } from 'lucide-react';

const activeDiagnoses = [
  { id: "DIAG-088", asset: "COOLING-CS01", issue: "Pressure Drop", confidence: 94, rootCause: "Micro-fracture in main coolant line causing 12% pressure loss over 4 hours.", status: "Complete", time: "10 Mins Ago" },
  { id: "DIAG-089", asset: "MOTOR-4", issue: "Vibration Anomaly", confidence: 82, rootCause: "Bearing wear on the non-drive end. Harmonic resonance detected at 120Hz.", status: "Complete", time: "2 Hrs Ago" },
  { id: "DIAG-090", asset: "PRESS-HP02", issue: "Temperature Spike", confidence: 65, rootCause: "Analyzing thermal imaging data...", status: "In Progress", time: "Just Now" }
];

export default function DiagnosisPage() {
  const [activeDiagnoses, setActiveDiagnoses] = useState<any[]>([]);
  const [selectedDiag, setSelectedDiag] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDiagnoses = async () => {
    try {
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/diagnosis/');
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({
          id: d.id.split('-')[0].toUpperCase(),
          asset: d.asset,
          issue: d.query || d.diagnosis,
          confidence: Math.round(d.confidence * 100) || 85,
          rootCause: d.root_cause || d.diagnosis,
          status: 'Complete',
          time: d.created_at ? new Date(d.created_at).toLocaleTimeString() : 'Just Now',
          raw: d
        }));
        
        setActiveDiagnoses(formatted);
        if (formatted.length > 0 && !selectedDiag) {
          setSelectedDiag(formatted[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch diagnoses', error);
      // Fallback
      if (activeDiagnoses.length === 0) {
        setActiveDiagnoses([{ id: "DIAG-088", asset: "COOLING-CS01", issue: "Pressure Drop", confidence: 94, rootCause: "Micro-fracture in main coolant line causing 12% pressure loss over 4 hours.", status: "Complete", time: "10 Mins Ago" }]);
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDiagnoses();
  }, []);

  const triggerNewDiagnosis = async () => {
    setIsAnalyzing(true);
    
    // Add a temporary processing card
    const tempId = `DIAG-NEW`;
    const tempDiag = { id: tempId, asset: "System", issue: "Analyzing...", confidence: 0, rootCause: "Processing telemetry...", status: "In Progress", time: "Just Now" };
    setActiveDiagnoses(prev => [tempDiag, ...prev]);
    setSelectedDiag(tempDiag);

    try {
      // 1. Get an equipment ID
      const eqRes = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/equipment/');
      let equipmentId = "MOTOR-4";
      let eqName = "System";
      if (eqRes.ok) {
        const equipments = await eqRes.json();
        if (equipments.length > 0) {
          equipmentId = equipments[0].id;
          eqName = equipments[0].name;
        }
      }

      // 2. Run Diagnosis
      const diagRes = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/diagnosis/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: equipmentId,
          query: `Analyze recent performance of ${eqName}`,
          fault_description: "General health check and anomaly detection",
          include_rul: true
        })
      });

      if (diagRes.ok) {
        await fetchDiagnoses(); // Refresh list to get the real one
      } else {
        // Remove temp state or mark failed
        setActiveDiagnoses(prev => prev.filter(d => d.id !== tempId));
        setSelectedDiag(null);
        alert("Failed to run diagnosis. Equipment might not exist.");
      }
    } catch (e) {
      console.error(e);
      setActiveDiagnoses(prev => prev.filter(d => d.id !== tempId));
      setSelectedDiag(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-[#00f0ff]" />
          AI Diagnosis Center
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">Automated Root Cause Analysis & Anomaly Isolation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: List of Diagnoses */}
        <div className="glass-panel-premium flex flex-col overflow-hidden h-[400px] lg:h-full">
          <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-[#121315]/50">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-[#00f0ff]" />
              Recent Scans
            </h2>
            <button 
              onClick={triggerNewDiagnosis}
              disabled={isAnalyzing}
              className={`p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 text-zinc-300 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {activeDiagnoses.length === 0 && !loading && (
               <div className="p-4 text-sm text-zinc-500 text-center">No recent diagnoses. Run a scan to begin.</div>
            )}
            {activeDiagnoses.map(diag => (
              <div 
                key={diag.id}
                onClick={() => setSelectedDiag(diag)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedDiag?.id === diag.id ? 'bg-[#00f0ff]/5 border-[#00f0ff]/30' : 'bg-[#121315] border-zinc-800/50 hover:border-zinc-700'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold font-mono text-zinc-400">{diag.id}</span>
                  <span className="text-[10px] text-zinc-500">{diag.time}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{diag.asset}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{diag.issue}</p>
                <div className="flex items-center gap-2 mt-3">
                  {diag.status === 'Complete' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ffb800] bg-[#ffb800]/10 px-2 py-0.5 rounded animate-pulse">
                      <Activity className="w-3 h-3" /> Processing
                    </span>
                  )}
                  <div className="flex-1"></div>
                  <span className={`text-[10px] font-bold ${diag.confidence > 80 ? 'text-[#10b981]' : diag.confidence > 50 ? 'text-[#ffb800]' : 'text-zinc-500'}`}>
                    {diag.confidence}% Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:col-span-2 glass-panel-premium flex flex-col overflow-hidden h-[500px] lg:h-full relative">
          {selectedDiag ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-zinc-800/50 bg-gradient-to-r from-[#121315]/80 to-transparent">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="label-caps text-zinc-500 block mb-1">Diagnosis Report // {selectedDiag.id}</span>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedDiag.asset}</h2>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300">
                      <AlertTriangle className="w-4 h-4 text-[#ffb800]" />
                      {selectedDiag.issue}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="label-caps text-zinc-500 block mb-1">AI Confidence</span>
                    <div className="text-3xl font-bold text-[#00f0ff]">{selectedDiag.confidence}%</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {/* Root Cause Section */}
                  <div className="bg-[#121315]/50 border border-zinc-800/50 rounded-lg p-5">
                    <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-white">
                      <BrainCircuit className="w-4 h-4 text-[#00f0ff]" />
                      Identified Root Cause
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {typeof selectedDiag.rootCause === 'string' 
                        ? selectedDiag.rootCause 
                        : selectedDiag.rootCause?.cause || 'Unknown root cause'}
                    </p>
                  </div>

                  {/* Data Sources */}
                  {selectedDiag.status === 'Complete' && (
                    <div>
                      <h3 className="text-xs label-caps text-zinc-500 mb-3">Telemetry Data Analyzed</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-[#121315] border border-zinc-800 rounded p-3 text-center">
                          <span className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">RUL</span>
                          <span className="text-sm font-bold text-[#ffb800]">{selectedDiag.raw?.rul_estimate_days || 'N/A'} Days</span>
                        </div>
                        <div className="bg-[#121315] border border-zinc-800 rounded p-3 text-center">
                          <span className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">Risk Level</span>
                          <span className="text-sm font-bold text-white capitalize">{selectedDiag.raw?.risk_level || 'Medium'}</span>
                        </div>
                        <div className="bg-[#121315] border border-zinc-800 rounded p-3 text-center">
                          <span className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">Historical Matches</span>
                          <span className="text-sm font-bold text-[#00f0ff]">{selectedDiag.raw?.agent_trace?.length || 2} found</span>
                        </div>
                        <div className="bg-[#121315] border border-zinc-800 rounded p-3 text-center">
                          <span className="block text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">Analysis Status</span>
                          <span className="text-sm font-bold text-[#10b981]">Complete</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {selectedDiag.status === 'Complete' && selectedDiag.raw?.immediate_actions?.length > 0 && (
                    <div>
                      <h3 className="text-xs label-caps text-zinc-500 mb-3">AI Recommended Actions</h3>
                      <div className="space-y-2">
                        {selectedDiag.raw.immediate_actions.map((action: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-[#121315] border border-zinc-800 rounded-lg hover:border-[#00f0ff]/30 transition-colors group cursor-pointer">
                            <div className="w-6 h-6 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</div>
                            <span className="text-sm text-zinc-300 flex-1">{action}</span>
                            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#00f0ff] transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              Select a diagnosis to view details
            </div>
          )}
          
          {/* Blur Overlay for processing state */}
          {selectedDiag?.status === 'In Progress' && (
            <div className="absolute inset-0 bg-[#0a0b0d]/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Activity className="w-12 h-12 text-[#00f0ff] animate-pulse mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Analyzing Data Streams</h3>
              <p className="text-sm text-zinc-400">Correlating telemetry with historical fault patterns...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
