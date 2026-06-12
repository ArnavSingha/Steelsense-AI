"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertFeed from '../components/AlertFeed';
import AssetCard from '../components/AssetCard';
import FailureGraph from '../components/FailureGraph';
import EvidencePanel from '../components/EvidencePanel';
import ActionPlan from '../components/ActionPlan';
import WhatChangedCard from '../components/WhatChangedCard';
import PlantPriorityMatrix from '../components/PlantPriorityMatrix';
import EquipmentTimeline from '../components/EquipmentTimeline';
import DeepExplanation from '../components/DeepExplanation';
import DegradationChart from '../components/DegradationChart';
import RecommendationConfidence from '../components/RecommendationConfidence';
import DigitalLogbook from '../components/DigitalLogbook';
import RecommendationOutcome from '../components/RecommendationOutcome';
import ExportButton from '../components/ExportButton';
import FeedbackHistory from '../components/FeedbackHistory';
import ChatCopilot from '../components/ChatCopilot';
import { toast } from '../components/Toast';
import { Activity, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

import PlantOverviewKPI from '../components/PlantOverviewKPI';
import RiskDistributionChart from '../components/RiskDistributionChart';
import ActivityTrendChart from '../components/ActivityTrendChart';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
};

export default function Home() {
  const [activeAsset, setActiveAsset] = useState('MOTOR-4');
  const [demoMode, setDemoMode] = useState(true);
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
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [riskSummary, setRiskSummary] = useState<any>(null);

  const fetchStats = async () => {
    try {
      // Fetching from backend on port 8001
      const res = await fetch('http://localhost:8001/api/v1/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (e) {
      console.warn("Unable to connect to dashboard stats API.", e);
    }
  };

  const fetchRiskSummary = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/analytics/risk-summary');
      if (res.ok) {
        const data = await res.json();
        setRiskSummary({
          critical: data.critical_count || 0,
          high: data.high_count || 0,
          medium: data.medium_count || 0,
          low: data.low_count || 0,
        });
      }
    } catch (e) {
      console.warn("Unable to connect to risk summary API.", e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/logbook');
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
      const res = await fetch('http://localhost:8001/api/feedback');
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
    fetchStats();
    fetchRiskSummary();
  };

  // Sync log and feedback state with the backend
  useEffect(() => {
    refetchAll();
    const interval = setInterval(refetchAll, 4000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input (like ChatCopilot)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const assets = ["MOTOR-4", "COOLING-CS01", "GEARBOX-GB02", "PRESS-HP02", "CONVEYOR-C01"];
      
      if (e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        setActiveAsset(assets[index]);
        toast.info(`Switched to ${assets[index]}`);
      } else if (e.key === 'c' || e.key === 'C') {
        // Trigger copilot open (would need a prop passed, or we can just show a toast for demo)
        toast.info("Copilot shortcut activated");
      } else if (e.key === 'd' || e.key === 'D') {
        setDemoMode(prev => {
          const next = !prev;
          if (next) toast.warning("Demo Mode Activated");
          else toast.success("Normal Operations Resumed");
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist relative">
      
      {/* Top Confidence Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0a0b0d] via-[#00f0ff] to-[#0a0b0d] opacity-50"></div>

      <motion.main 
        className="max-w-[2000px] mx-auto flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        
        {/* Header with Demo Toggle */}
        <motion.header variants={itemVariants} className="flex flex-col gap-4 border-b border-[rgba(255,255,255,0.08)] pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[rgba(14,165,233,0.1)] border border-[#0ea5e9] flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#0ea5e9]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">SteelSense AI</h1>
                <p className="label-caps text-zinc-500 mt-0.5">Kinetic Command Center</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Active Asset Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.05)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0ff]"></span>
                </span>
                <span className="label-caps text-[#00f0ff] font-bold">Active: {activeAsset}</span>
              </div>
              {/* System Status Ribbon */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(14,165,233,0.2)] bg-[rgba(14,165,233,0.05)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0ea5e9]" />
                <span className="label-caps text-[#0ea5e9]">System Confidence: HIGH</span>
              </div>
              {/* Demo Mode Toggle */}
              <button 
                onClick={() => setDemoMode(!demoMode)}
                className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-zinc-600 hover:text-zinc-300 opacity-50 hover:opacity-100 font-medium"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="label-caps">{demoMode ? 'Cascade Demo Active' : 'Normal Operations'}</span>
              </button>
              <ExportButton />
            </div>
          </div>

          {/* Hero Incident Banner */}
          <AnimatePresence>
            {demoMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[rgba(255,61,0,0.05)] border border-[rgba(255,61,0,0.3)] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(255,61,0,0.1)] flex items-center justify-center glow-red flex-shrink-0">
                      <ShieldAlert className="w-5 h-5 text-[#ff3d00]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5 flex flex-wrap items-center gap-2">
                        CRITICAL CASCADE PREDICTED
                        <span className="label-caps bg-[#ff3d00] text-black px-1.5 py-0.5 rounded">T-MINUS 2 DAYS</span>
                      </h3>
                      <p className="text-xs font-medium text-zinc-300">
                        COOLING-CS01 fluid pressure drop is projected to trigger MOTOR-4 thermal overload and GEARBOX-GB02 seal failure. Immediate intervention required to prevent ₹23L/hr plant downtime.
                      </p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setActiveAsset("COOLING-CS01")}
                    className="bg-[#ff3d00] hover:bg-[#ff5722] text-black font-bold label-caps px-4 py-2 rounded cursor-pointer transition-colors shadow-[0_0_15px_rgba(255,61,0,0.4)] text-xs text-center w-full md:w-auto whitespace-nowrap"
                  >
                    Inspect Root Cooling Failure
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        {/* Global KPI Bar */}
        <motion.div variants={itemVariants} className="w-full">
          <PlantOverviewKPI stats={dashboardStats} />
        </motion.div>

        {/* Overview Charts Tier */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6 min-h-[250px]">
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <RiskDistributionChart distribution={riskSummary} />
          </div>
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <ActivityTrendChart />
          </div>
        </motion.div>

        {/* Top Tier: Executive Summary & Current Risk */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6 min-h-[400px]">
          <div className="col-span-12 lg:col-span-3 flex flex-col">
            <AlertFeed demoMode={demoMode} activeAsset={activeAsset} onSelectAsset={setActiveAsset} refetchLogs={refetchAll} />
          </div>
          <div className="col-span-12 lg:col-span-6 flex flex-col">
            <AssetCard demoMode={demoMode} activeAsset={activeAsset} />
          </div>
          <div className="col-span-12 lg:col-span-3 flex flex-col">
            <RecommendationOutcome />
          </div>
        </motion.div>

        {/* Middle Tier: Graph & Evidence */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6 min-h-[500px]">
          <div className="col-span-12 lg:col-span-5 flex flex-col relative z-0">
            <FailureGraph demoMode={demoMode} activeAsset={activeAsset} onSelectAsset={setActiveAsset} />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <DegradationChart activeAsset={activeAsset} />
          </div>
          <div className="col-span-12 lg:col-span-3 flex flex-col">
            <ActionPlan activeAsset={activeAsset} refetchLogs={refetchAll} />
          </div>
        </motion.div>

        {/* Lower Tier 1: Deep Dive & Matrix */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6 min-h-[350px]">
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <PlantPriorityMatrix activeAsset={activeAsset} onSelectAsset={setActiveAsset} />
          </div>
          <div className="col-span-12 lg:col-span-3 flex flex-col">
            <EvidencePanel activeAsset={activeAsset} />
          </div>
          <div className="col-span-12 lg:col-span-5 flex flex-col">
            <DeepExplanation activeAsset={activeAsset} />
          </div>
        </motion.div>

        {/* Lower Tier 2: Execution & Feedback Loop */}
        <motion.div variants={itemVariants} className="grid grid-cols-12 gap-6 min-h-[250px]">
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <DigitalLogbook logs={logs} />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <WhatChangedCard activeAsset={activeAsset} />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <FeedbackHistory feedbackList={feedbackList} />
          </div>
        </motion.div>

        <ChatCopilot />

      </motion.main>
    </div>
  );
}
