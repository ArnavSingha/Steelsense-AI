"use client";

import React, { useState, useEffect } from 'react';
import DigitalLogbook from '../../components/DigitalLogbook';
import FeedbackHistory from '../../components/FeedbackHistory';
import RecommendationOutcome from '../../components/RecommendationOutcome';
import { PenTool, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from '../../components/Toast';

export default function WorkOrdersPage() {
  const [logs, setLogs] = useState<any[]>([
    { time: "10:15", asset: "MOTOR-4", action: "Work Order Generated", status: "Completed" },
    { time: "10:18", asset: "MOTOR-4", action: "Spare Part Reserved", status: "Completed" },
    { time: "10:22", asset: "CONVEYOR-C01", action: "Speed Reduced", status: "In Progress" },
    { time: "10:25", asset: "COOLING-CS01", action: "Pressure Valve Reset", status: "Pending" }
  ]);
  
  const [feedbackList, setFeedbackList] = useState<any[]>([
    { timestamp: "2026-06-08 16:30:00", equipment_id: "PRESS-HP02", recommendation: "Replace hydraulic seal", feedback: "accepted", reason: "Operator confirmed leakage" },
    { timestamp: "2026-06-07 09:15:00", equipment_id: "COOLING-CS01", recommendation: "Flush coolant lines", feedback: "rejected", reason: "Scheduled for next week maintenance" }
  ]);

  const [formData, setFormData] = useState({
    equipment_id: 'COOLING-CS01',
    recommendation: '',
    feedback: 'accepted',
    reason: ''
  });

  const fetchLogs = async () => {
    try {
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/logbook');
      if (res.ok) {
        const data = await res.json();
        if (data.logbook && data.logbook.length > 0) {
          setLogs(data.logbook);
        }
      }
    } catch (e) {
      console.warn("Unable to connect to backend logbook API. Operating in offline state.", e);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/feedback');
      if (res.ok) {
        const data = await res.json();
        if (data.feedback && data.feedback.length > 0) {
          setFeedbackList(data.feedback);
        }
      }
    } catch (e) {
      console.warn("Unable to connect to backend feedback API. Operating in offline state.", e);
    }
  };

  const refetchAll = () => {
    fetchLogs();
    fetchFeedback();
  };

  useEffect(() => {
    refetchAll();
    const interval = setInterval(refetchAll, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recommendation.trim()) {
      toast.error("Please enter a recommendation");
      return;
    }

    try {
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`Dispatched Work Order for ${formData.equipment_id}`);
        setFormData({
          equipment_id: 'COOLING-CS01',
          recommendation: '',
          feedback: 'accepted',
          reason: ''
        });
        refetchAll();
      } else {
        toast.error("Failed to dispatch work order to backend");
      }
    } catch (e) {
      toast.error("Network error: Using offline dispatch simulation");
      // Fallback local update
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const timestampStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${timeStr}:00`;
      
      const newLog = {
        time: timeStr,
        asset: formData.equipment_id.toUpperCase(),
        action: `Feedback: ${formData.feedback.charAt(0).toUpperCase() + formData.feedback.slice(1)}`,
        status: "Completed"
      };

      const newFeedback = {
        timestamp: timestampStr,
        equipment_id: formData.equipment_id,
        recommendation: formData.recommendation,
        feedback: formData.feedback,
        reason: formData.reason
      };

      setLogs(prev => [...prev, newLog]);
      setFeedbackList(prev => [...prev, newFeedback]);
      
      setFormData({
        equipment_id: 'COOLING-CS01',
        recommendation: '',
        feedback: 'accepted',
        reason: ''
      });
    }
  };

  // Compute status summary
  const completedCount = logs.filter(l => l.status.toLowerCase().includes('complete') || l.status.toLowerCase().includes('approved') || l.status.toLowerCase().includes('accepted')).length;
  const inProgressCount = logs.filter(l => l.status.toLowerCase().includes('progress') || l.status.toLowerCase().includes('expedite') || l.status.toLowerCase().includes('transit')).length;
  const pendingCount = logs.length - completedCount - inProgressCount;

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4">
        <h1 className="text-2xl font-bold tracking-wide">Work Orders</h1>
        <p className="label-caps text-zinc-500 mt-0.5">Industrial Maintenance Dispatch & Execution</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel-premium p-4 flex items-center justify-between">
          <div>
            <span className="label-caps text-zinc-500 block">Completed</span>
            <span className="text-xl font-bold text-[#10b981] mt-1 block">{completedCount} Tasks</span>
          </div>
          <CheckCircle className="w-8 h-8 text-[#10b981]/30" />
        </div>
        <div className="glass-panel-premium p-4 flex items-center justify-between">
          <div>
            <span className="label-caps text-zinc-500 block">In Progress</span>
            <span className="text-xl font-bold text-[#00f0ff] mt-1 block">{inProgressCount} Tasks</span>
          </div>
          <Clock className="w-8 h-8 text-[#00f0ff]/30" />
        </div>
        <div className="glass-panel-premium p-4 flex items-center justify-between">
          <div>
            <span className="label-caps text-zinc-500 block">Pending Action</span>
            <span className="text-xl font-bold text-[#ffb800] mt-1 block">{pendingCount} Tasks</span>
          </div>
          <AlertCircle className="w-8 h-8 text-[#ffb800]/30" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left/Middle Column: Logbook and feedback */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-1 min-h-[350px]">
            <DigitalLogbook logs={logs} />
          </div>
          <div className="flex-1 min-h-[350px]">
            <FeedbackHistory feedbackList={feedbackList} />
          </div>
        </div>

        {/* Right Column: Outcomes & New Dispatch */}
        <div className="flex flex-col gap-6">
          {/* Executive Impact Summary */}
          <div className="min-h-[200px]">
            <RecommendationOutcome />
          </div>

          {/* Dispatch Work Order Form */}
          <div className="glass-panel-premium p-4 flex flex-col gap-4">
            <h2 className="text-sm font-semibold border-b border-[rgba(255,255,255,0.08)] pb-2 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-[#00f0ff]" />
              <span>Dispatch Work Order</span>
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] label-caps text-zinc-500 block mb-1">Select Asset</label>
                <select
                  value={formData.equipment_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipment_id: e.target.value }))}
                  className="w-full bg-[#121315] border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-bold"
                >
                  <option value="COOLING-CS01">COOLING-CS01 (Cooling System)</option>
                  <option value="MOTOR-4">MOTOR-4 (Rolling Mill Motor)</option>
                  <option value="GEARBOX-GB02">GEARBOX-GB02 (Gearbox)</option>
                  <option value="PRESS-HP02">PRESS-HP02 (Hydraulics Press)</option>
                  <option value="CONVEYOR-C01">CONVEYOR-C01 (Slag Conveyor)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] label-caps text-zinc-500 block mb-1">Recommendation Description</label>
                <input
                  type="text"
                  placeholder="e.g. Flush cooling lines and replace gasket"
                  value={formData.recommendation}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                  className="w-full bg-[#121315] border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="text-[10px] label-caps text-zinc-500 block mb-1">Action Type</label>
                <select
                  value={formData.feedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                  className="w-full bg-[#121315] border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff] font-bold"
                >
                  <option value="accepted">Accepted (Schedule Repair)</option>
                  <option value="rejected">Rejected (Override / Ignore)</option>
                  <option value="acknowledged">Acknowledged (Monitor State)</option>
                  <option value="expedited">Expedited (Emergency Stop)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] label-caps text-zinc-500 block mb-1">Reason / Notes</label>
                <textarea
                  placeholder="Engineering justification..."
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-[#121315] border border-zinc-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-[#00f0ff] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00f0ff] hover:bg-[#00d8e6] text-black font-bold label-caps py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors text-xs cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                <Plus className="w-4 h-4" />
                Dispatch Order
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
