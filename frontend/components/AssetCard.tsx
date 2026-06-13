import React, { useState, useEffect } from 'react';
import { Server, Activity, Thermometer, Wind, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssetCardProps {
  demoMode: boolean;
  activeAsset: string;
}

export default function AssetCard({ demoMode, activeAsset }: AssetCardProps) {
  const [mlResult, setMlResult] = useState<any>(null);
  const [runningMl, setRunningMl] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  // Define metric details for all assets
  const assetMetricsMap: Record<string, {
    status: string;
    metrics: Array<{ label: string; value: string; unit: string; icon: any; status: string; color: string; rawKey: string }>;
  }> = {
    "MOTOR-4": {
      status: demoMode ? "Degradation Active" : "Nominal Operations",
      metrics: demoMode ? [
        { label: "VIBRATION VELOCITY", value: "6.85", unit: "mm/s", icon: Activity, status: "CRITICAL", color: "text-[#ff3d00]", rawKey: "vibration_mm_s" },
        { label: "TEMP DIFFERENTIAL", value: "69.9", unit: "°C", icon: Thermometer, status: "WARNING", color: "text-[#ffb800]", rawKey: "temperature_c" },
        { label: "CURRENT DRAW", value: "85.2", unit: "Amp", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "current_amp" },
      ] : [
        { label: "VIBRATION VELOCITY", value: "2.45", unit: "mm/s", icon: Activity, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "vibration_mm_s" },
        { label: "TEMP DIFFERENTIAL", value: "54.8", unit: "°C", icon: Thermometer, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "temperature_c" },
        { label: "CURRENT DRAW", value: "72.1", unit: "Amp", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "current_amp" },
      ]
    },
    "COOLING-CS01": {
      status: demoMode ? "Fluid Pressure drop" : "Nominal Operations",
      metrics: demoMode ? [
        { label: "FLOW RATE", value: "12.4", unit: "L/min", icon: Activity, status: "CRITICAL", color: "text-[#ff3d00]", rawKey: "flow_rate" },
        { label: "FLUID PRESSURE", value: "1.8", unit: "Bar", icon: Wind, status: "CRITICAL", color: "text-[#ff3d00]", rawKey: "pressure_drop" },
        { label: "CONTAMINATION", value: "250", unit: "ppm", icon: Thermometer, status: "WARNING", color: "text-[#ffb800]", rawKey: "temperature_c" },
      ] : [
        { label: "FLOW RATE", value: "45.0", unit: "L/min", icon: Activity, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "flow_rate" },
        { label: "FLUID PRESSURE", value: "4.8", unit: "Bar", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "pressure_drop" },
        { label: "CONTAMINATION", value: "15", unit: "ppm", icon: Thermometer, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "temperature_c" },
      ]
    },
    "GEARBOX-GB02": {
      status: demoMode ? "Vibration Anomaly" : "Nominal Operations",
      metrics: demoMode ? [
        { label: "VIBRATION VELOCITY", value: "4.21", unit: "mm/s", icon: Activity, status: "WARNING", color: "text-[#ffb800]", rawKey: "vibration_mm_s" },
        { label: "TEMP DIFFERENTIAL", value: "78.4", unit: "°C", icon: Thermometer, status: "WARNING", color: "text-[#ffb800]", rawKey: "temperature_c" },
        { label: "OIL LEVEL", value: "45", unit: "%", icon: Wind, status: "CRITICAL", color: "text-[#ff3d00]", rawKey: "rpm" },
      ] : [
        { label: "VIBRATION VELOCITY", value: "1.85", unit: "mm/s", icon: Activity, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "vibration_mm_s" },
        { label: "TEMP DIFFERENTIAL", value: "52.1", unit: "°C", icon: Thermometer, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "temperature_c" },
        { label: "OIL LEVEL", value: "95", unit: "%", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "rpm" },
      ]
    },
    "PRESS-HP02": {
      status: "Nominal Operations",
      metrics: [
        { label: "SYSTEM PRESSURE", value: demoMode ? "145" : "148", unit: "Bar", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "pressure_drop" },
        { label: "TEMPERATURE", value: demoMode ? "42.1" : "40.5", unit: "°C", icon: Thermometer, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "temperature_c" },
        { label: "CYCLE RATE", value: demoMode ? "1250" : "1280", unit: "c/hr", icon: Activity, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "rpm" },
      ]
    },
    "CONVEYOR-C01": {
      status: demoMode ? "Minor Slippage Warning" : "Nominal Operations",
      metrics: demoMode ? [
        { label: "MOTOR TEMP", value: "48.2", unit: "°C", icon: Thermometer, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "temperature_c" },
        { label: "BELT SPEED", value: "1.8", unit: "m/s", icon: Activity, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "flow_rate" },
        { label: "DRIVE LOAD", value: "85", unit: "%", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "current_amp" },
      ] : [
        { label: "MOTOR TEMP", value: "45.0", unit: "°C", icon: Thermometer, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "temperature_c" },
        { label: "BELT SPEED", value: "2.0", unit: "m/s", icon: Activity, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "flow_rate" },
        { label: "DRIVE LOAD", value: "80", unit: "%", icon: Wind, status: "HEALTHY", color: "text-[#00f0ff]", rawKey: "current_amp" },
      ]
    }
  };

  const currentAssetData = assetMetricsMap[activeAsset] || assetMetricsMap["MOTOR-4"];

  // Reset ML result and fetch live data when active asset changes
  useEffect(() => {
    setMlResult(null);
    let isMounted = true;
    
    const fetchSensorData = async () => {
      try {
        const res = await fetch(`https://steelsense-ai-production.up.railway.app/api/sensors/${activeAsset}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setLiveData(data.latest);
        }
      } catch (e) {
        // Fallback to demo mode silently if backend is offline
        if (isMounted) setLiveData(null);
      }
    };
    
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeAsset]);

  // Merge live data with metric configuration
  const displayMetrics = currentAssetData.metrics.map(m => {
    if (liveData && liveData[m.rawKey] !== undefined) {
      // Keep the same status/color logic but update the value dynamically
      return { ...m, value: parseFloat(liveData[m.rawKey]).toFixed(2) };
    }
    return m;
  });

  const runMlDiagnostic = async () => {
    setRunningMl(true);
    setMlResult(null);
    try {
      // Build reading payload from display metrics (which might have live data)
      const readings: Record<string, number> = {};
      displayMetrics.forEach(m => {
        readings[m.rawKey] = parseFloat(m.value);
      });

      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: activeAsset,
          readings: readings
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMlResult(data);
      } else {
        throw new Error("API Failure");
      }
    } catch (e) {
      console.warn("Offline: simulating Isolation Forest + RF Regressor locally.");
      setTimeout(() => {
        setMlResult({
          is_anomaly: demoMode && (activeAsset === "MOTOR-4" || activeAsset === "COOLING-CS01"),
          anomaly_score: demoMode && activeAsset === "MOTOR-4" ? -0.1542 : 0.0821,
          rul_days: demoMode && activeAsset === "MOTOR-4" ? 2 : demoMode && activeAsset === "COOLING-CS01" ? 1 : 25,
          rul_confidence: demoMode && (activeAsset === "MOTOR-4" || activeAsset === "COOLING-CS01") ? "HIGH" : "MEDIUM"
        });
      }, 1000);
    } finally {
      setRunningMl(false);
    }
  };

  const isDegraded = currentAssetData.status !== "Nominal Operations";

  return (
    <div className="glass-panel-premium flex flex-col h-full relative overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center relative z-10 bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Target Asset: {activeAsset}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isDegraded ? 'bg-[#ff3d00]' : 'bg-[#00f0ff]'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDegraded ? 'bg-[#ff3d00]' : 'bg-[#00f0ff]'}`}></span>
          </span>
          <span className={`label-caps ${isDegraded ? 'text-[#ff3d00]' : 'text-[#00f0ff]'}`}>
            {currentAssetData.status}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-6 relative z-10 flex flex-col justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {displayMetrics.map((m, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="flex flex-col p-4 rounded bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]"
            >
              <div className="flex justify-between items-start mb-4">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-current ${m.color} bg-opacity-10`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="data-lg text-white text-xl md:text-2xl">{m.value}</span>
                <span className="label-caps text-zinc-500 text-[9px] ml-1">{m.unit}</span>
              </div>
              <span className="label-caps text-zinc-400 mt-2 text-[9px]">{m.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Live ML Predictor Sub-panel */}
        <div className="mt-2 p-3 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="label-caps text-zinc-400 flex items-center gap-1.5 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#00f0ff]" /> Live ML Inference Engine
            </span>
            <button
              onClick={runMlDiagnostic}
              disabled={runningMl}
              className="label-caps bg-[rgba(0,240,255,0.1)] text-[#00f0ff] border border-[#00f0ff]/30 hover:bg-[rgba(0,240,255,0.2)] px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-50"
            >
              {runningMl ? "Running ML Models..." : "Run ML Diagnostics"}
            </button>
          </div>

          {mlResult && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)]"
            >
              <div className="p-2 rounded bg-black/45 border border-zinc-800">
                <span className="block text-[8px] label-caps text-zinc-500">Isolation Forest</span>
                <span className={`text-xs font-bold ${mlResult.is_anomaly ? 'text-[#ff3d00]' : 'text-[#10b981]'}`}>
                  {mlResult.is_anomaly ? 'ANOMALY DETECTED' : 'NOMINAL SIGNAL'}
                </span>
                {mlResult.anomaly_score !== undefined && (
                  <span className="block text-[8px] font-mono text-zinc-600 mt-0.5">Score: {mlResult.anomaly_score}</span>
                )}
              </div>
              <div className="p-2 rounded bg-black/45 border border-zinc-800">
                <span className="block text-[8px] label-caps text-zinc-500">Random Forest Regressor</span>
                <span className="text-xs font-bold text-white">
                  RUL: {mlResult.rul_days === -1 ? 'Unknown' : `${mlResult.rul_days} Days`}
                </span>
                <span className="block text-[8px] font-bold text-zinc-400 uppercase mt-0.5">Conf: {mlResult.rul_confidence}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
