"use client";

import React, { useState } from 'react';
import { FileText, Download, Play, Calendar, CheckCircle, Clock, FileBarChart } from 'lucide-react';

const mockReports = [
  { id: "REP-01", name: "Daily Shift Summary", type: "Operations", generatedAt: "2026-06-11 06:00", status: "Ready" },
  { id: "REP-02", name: "Weekly Asset Health", type: "Maintenance", generatedAt: "2026-06-08 00:00", status: "Ready" },
  { id: "REP-03", name: "Downtime Root Cause Analysis", type: "Executive", generatedAt: "2026-06-05 14:30", status: "Ready" },
  { id: "REP-04", name: "Predictive Maintenance Schedule", type: "Planning", generatedAt: "Generating...", status: "Processing" },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<any[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    
    // Add temp status
    const tempId = `REP-${Math.floor(Math.random() * 1000)}`;
    setReportHistory([{ id: tempId, name: "Asset Health Prediction", type: "Generated", generatedAt: "Generating...", status: "Processing" }, ...reportHistory]);

    try {
      // 1. Get an equipment ID
      const eqRes = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/equipment/');
      let equipmentId = "MOTOR-4";
      if (eqRes.ok) {
        const equipments = await eqRes.json();
        if (equipments.length > 0) equipmentId = equipments[0].id;
      }

      // 2. Generate
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: equipmentId,
          report_type: 'maintenance_summary'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.report || "Report generated successfully.";
        
        setReportHistory(prev => {
          const newHistory = [...prev];
          newHistory[0] = { ...newHistory[0], status: "Ready", generatedAt: new Date().toLocaleString(), content };
          return newHistory;
        });
      } else {
        setReportHistory(prev => {
          const newHistory = [...prev];
          newHistory[0] = { ...newHistory[0], status: "Failed", generatedAt: "Failed" };
          return newHistory;
        });
      }
    } catch (e) {
      console.error(e);
      setReportHistory(prev => {
        const newHistory = [...prev];
        newHistory[0] = { ...newHistory[0], status: "Failed", generatedAt: "Failed" };
        return newHistory;
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#00f0ff]" />
          AI Reports
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">Auto-Generated Insights & Executive Summaries</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Generator Configuration */}
        <div className="glass-panel-premium p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FileBarChart className="w-5 h-5 text-[#00f0ff]" />
              Generate New Report
            </h2>
            <p className="text-sm text-zinc-400 mb-6">Configure the AI engine to compile telemetry, work orders, and risk assessments into a comprehensive summary.</p>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-[10px] label-caps text-zinc-500 block mb-1">Report Type</label>
              <select className="w-full bg-[#121315] border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]">
                <option>End of Shift Summary</option>
                <option>Weekly Maintenance Audit</option>
                <option>Asset Health Prediction</option>
                <option>Downtime Financial Impact</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] label-caps text-zinc-500 block mb-1">Time Range</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] py-2 rounded text-xs font-semibold">Last 24 Hrs</button>
                <button className="bg-[#121315] border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2 rounded text-xs font-semibold transition-colors">Last 7 Days</button>
                <button className="bg-[#121315] border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2 rounded text-xs font-semibold transition-colors">This Month</button>
                <button className="bg-[#121315] border border-zinc-800 hover:border-zinc-700 text-zinc-300 py-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" /> Custom
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] label-caps text-zinc-500 block mb-1">Focus Areas</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#00f0ff]" /> All Assets
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#00f0ff]" /> Critical Alerts Only
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" className="accent-[#00f0ff]" /> Financial Projections
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#00f0ff] hover:bg-[#00d8e6] text-black font-bold label-caps py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run AI Generator
              </>
            )}
          </button>
        </div>

        {/* Right Column: History List */}
        <div className="lg:col-span-2 glass-panel-premium flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-zinc-800/50 bg-[#121315]/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Report History</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {reportHistory.map(report => (
              <div key={report.id} className="bg-[#121315] border border-zinc-800/50 rounded-lg p-4 flex items-center justify-between hover:border-[#00f0ff]/30 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    report.status === 'Ready' 
                      ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]' 
                      : 'bg-[#ffb800]/10 border-[#ffb800]/20 text-[#ffb800] animate-pulse'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-[#00f0ff] transition-colors">{report.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-mono">
                      <span>{report.id}</span>
                      <span>•</span>
                      <span>{report.type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {report.generatedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {report.status === 'Ready' ? (
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-sm text-white transition-colors border border-zinc-700">
                      <Download className="w-4 h-4 text-zinc-400" />
                      PDF
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-xs font-bold text-[#ffb800] uppercase tracking-wider px-3 py-1.5 bg-[#ffb800]/10 rounded border border-[#ffb800]/20">
                      <div className="w-3 h-3 border-2 border-[#ffb800]/20 border-t-[#ffb800] rounded-full animate-spin" />
                      Generating
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
