import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface RiskDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

const COLORS = {
  Critical: '#ef4444', // red-500
  High: '#f59e0b',     // amber-500
  Medium: '#3b82f6',   // blue-500
  Low: '#10b981',      // emerald-500
};

export default function RiskDistributionChart({ distribution }: { distribution: RiskDistribution | null }) {
  if (!distribution) return null;

  const data = [
    { name: 'Critical', value: distribution.critical },
    { name: 'High', value: distribution.high },
    { name: 'Medium', value: distribution.medium },
    { name: 'Low', value: distribution.low },
  ].filter(item => item.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[rgba(20,20,25,0.6)] backdrop-blur-xl border border-white/10 rounded-xl p-5 h-full flex flex-col shadow-2xl"
    >
      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
        Risk Distribution
      </h3>
      <div className="h-[220px] sm:h-[250px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            No data available
          </div>
        )}
      </div>
    </motion.div>
  );
}
