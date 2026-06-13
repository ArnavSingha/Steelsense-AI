"use client";

import React, { useState } from 'react';
import { Bell, AlertTriangle, ShieldAlert, AlertCircle, Search, Filter, ArrowRight } from 'lucide-react';

const mockAlerts = [
  { id: "ALT-001", time: "10:24 AM", equipment: "MOTOR-4", type: "Vibration Anomaly", severity: "critical", status: "Active" },
  { id: "ALT-002", time: "09:15 AM", equipment: "COOLING-CS01", type: "Pressure Drop", severity: "high", status: "Investigating" },
  { id: "ALT-003", time: "08:45 AM", equipment: "PRESS-HP02", type: "Temperature Spike", severity: "medium", status: "Active" },
  { id: "ALT-004", time: "07:30 AM", equipment: "CONVEYOR-C01", type: "Motor Overload", severity: "critical", status: "Resolved" },
  { id: "ALT-005", time: "Yesterday", equipment: "GEARBOX-GB02", type: "Oil Level Low", severity: "medium", status: "Resolved" },
];

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [alertsRes, statsRes] = await Promise.all([
          fetch('https://steelsense-ai-production.up.railway.app/api/v1/alerts/'),
          fetch('https://steelsense-ai-production.up.railway.app/api/v1/alerts/stats')
        ]);
        
        if (alertsRes.ok && statsRes.ok) {
          const alertsData = await alertsRes.json();
          const statsData = await statsRes.json();
          
          // Map backend schema to frontend representation
          const formattedAlerts = alertsData.map((a: any) => ({
            id: a.id.split('-')[0] + '-' + a.id.slice(-4), // Shorten UUID
            time: new Date(a.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            equipment: a.equipment_name,
            type: a.title,
            severity: a.severity.toLowerCase(),
            status: a.status === 'active' ? 'Active' : a.status === 'acknowledged' ? 'Investigating' : 'Resolved'
          }));
          
          setAlerts(formattedAlerts);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        // Fallback to mock data if backend fails
        setAlerts(mockAlerts);
        setStats({ critical: 2, high: 1, active: 3 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-[#ff3d00] bg-[#ff3d00]/10 border-[#ff3d00]/20';
      case 'high': return 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/20';
      case 'medium': return 'text-[#00f0ff] bg-[#00f0ff]/10 border-[#00f0ff]/20';
      default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <ShieldAlert className="w-4 h-4 text-[#ff3d00]" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-[#ffb800]" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-[#00f0ff]" />;
      default: return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#00f0ff]" />
          System Alerts
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">Real-time Anomaly Detection & Monitoring</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
        <div className="glass-panel-premium p-4 flex items-center justify-between border-l-4 border-l-[#ff3d00]">
          <div>
            <span className="label-caps text-zinc-500 block">Critical Alerts</span>
            <span className="text-2xl font-bold text-[#ff3d00] mt-1 block">{loading ? '-' : stats?.critical || 0}</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-[#ff3d00]/30" />
        </div>
        <div className="glass-panel-premium p-4 flex items-center justify-between border-l-4 border-l-[#ffb800]">
          <div>
            <span className="label-caps text-zinc-500 block">High Priority</span>
            <span className="text-2xl font-bold text-[#ffb800] mt-1 block">{loading ? '-' : stats?.high || 0}</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-[#ffb800]/30" />
        </div>
        <div className="glass-panel-premium p-4 flex items-center justify-between border-l-4 border-l-[#00f0ff]">
          <div>
            <span className="label-caps text-zinc-500 block">Total Active</span>
            <span className="text-2xl font-bold text-[#00f0ff] mt-1 block">{loading ? '-' : stats?.active || 0}</span>
          </div>
          <Bell className="w-8 h-8 text-[#00f0ff]/30" />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel-premium flex-1 flex flex-col overflow-hidden min-h-[400px]">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 bg-[#121315]/50">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search alerts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0b0d] border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-300 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-zinc-500">Loading alerts...</div>
          ) : (
            <table className="w-full text-left text-sm min-w-[650px] lg:min-w-0">
              <thead className="bg-[#121315] sticky top-0 z-10 text-xs label-caps text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Alert ID</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                  <th className="px-6 py-4 font-semibold">Equipment</th>
                  <th className="px-6 py-4 font-semibold">Issue Type</th>
                  <th className="px-6 py-4 font-semibold">Severity</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {alerts.filter(a => a.equipment.toLowerCase().includes(searchTerm.toLowerCase()) || a.type.toLowerCase().includes(searchTerm.toLowerCase())).map((alert) => (
                  <tr key={alert.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 font-mono text-zinc-400">{alert.id}</td>
                    <td className="px-6 py-4 text-zinc-300">{alert.time}</td>
                    <td className="px-6 py-4 font-bold text-white">{alert.equipment}</td>
                    <td className="px-6 py-4 text-zinc-300 truncate max-w-xs" title={alert.type}>{alert.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold ${alert.status === 'Resolved' ? 'text-zinc-500' : 'text-white'}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-md hover:bg-[#00f0ff]/10 text-[#00f0ff] opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
