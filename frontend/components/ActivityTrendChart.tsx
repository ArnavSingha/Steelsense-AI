import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// Simple seeded random for deterministic demo data
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function ActivityTrendChart() {
  const data = useMemo(() => {
    const trend = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      // More alerts during work shifts (6am-6pm), fewer at night
      const shiftMultiplier = (hour >= 6 && hour <= 18) ? 1.5 : 0.5;
      trend.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        alerts: Math.floor(seededRandom(i * 13 + 7) * 4 * shiftMultiplier) + (i % 8 === 0 ? 2 : 0),
        diagnoses: Math.floor(seededRandom(i * 17 + 3) * 3 * shiftMultiplier) + 1,
      });
    }
    return trend;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[rgba(20,20,25,0.6)] backdrop-blur-xl border border-white/10 rounded-xl p-5 h-full flex flex-col shadow-2xl"
    >
      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        24h Activity Trend
      </h3>
      <div className="h-[220px] sm:h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDiagnoses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={10} tickMargin={10} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="alerts" stroke="#ef4444" fillOpacity={1} fill="url(#colorAlerts)" name="Alerts" />
            <Area type="monotone" dataKey="diagnoses" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDiagnoses)" name="Diagnoses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
