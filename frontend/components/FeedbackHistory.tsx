import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedbackHistoryProps {
  feedbackList: Array<{
    timestamp: string;
    equipment_id: string;
    recommendation: string;
    feedback: string;
    reason: string;
  }>;
}

export default function FeedbackHistory({ feedbackList }: FeedbackHistoryProps) {
  const getFeedbackStyle = (feedback: string) => {
    const f = feedback.toLowerCase();
    if (f === 'accepted' || f === 'approved') {
      return {
        bg: "bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]",
        borderGlow: "bg-[#10b981]",
        badge: "text-[#10b981] bg-[rgba(16,185,129,0.1)]",
        icon: ThumbsUp,
        label: "Approved"
      };
    } else if (f === 'rejected') {
      return {
        bg: "bg-[rgba(255,61,0,0.05)] border-[rgba(255,61,0,0.2)]",
        borderGlow: "bg-[#ff3d00]",
        badge: "text-[#ff3d00] bg-[rgba(255,61,0,0.1)]",
        icon: ThumbsDown,
        label: "Rejected"
      };
    } else if (f === 'acknowledged') {
      return {
        bg: "bg-[rgba(0,240,255,0.05)] border-[rgba(0,240,255,0.2)]",
        borderGlow: "bg-[#00f0ff]",
        badge: "text-[#00f0ff] bg-[rgba(0,240,255,0.1)]",
        icon: Check,
        label: "Acknowledged"
      };
    } else {
      // Expedited
      return {
        bg: "bg-[rgba(147,51,234,0.05)] border-[rgba(147,51,234,0.2)]",
        borderGlow: "bg-[#9333ea]",
        badge: "text-[#c084fc] bg-[rgba(147,51,234,0.1)]",
        icon: Zap,
        label: "Expedited"
      };
    }
  };

  const formatTime = (ts: string) => {
    if (!ts) return "Just Now";
    // Check if it's standard YYYY-MM-DD HH:MM:SS
    const parts = ts.split(' ');
    if (parts.length === 2) {
      return parts[1]; // Return HH:MM:SS
    }
    return ts;
  };

  return (
    <div className="glass-panel-premium flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Feedback Capture</h2>
        </div>
        <span className="label-caps text-zinc-500">Human-in-the-Loop</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 max-h-[300px]">
        {feedbackList.slice().reverse().map((item, idx) => {
          const style = getFeedbackStyle(item.feedback);
          const Icon = style.icon;

          return (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.01 }}
              className={`p-3 rounded border flex flex-col gap-2 relative overflow-hidden group ${style.bg}`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 opacity-50 ${style.borderGlow}`}></div>
              <div className="pl-2 flex justify-between items-start">
                <div>
                  <span className="block text-xs font-bold text-white mb-0.5">{item.equipment_id.toUpperCase()}</span>
                  <span className="block text-[10px] text-zinc-400 font-mono">{formatTime(item.timestamp)} • Command Console</span>
                </div>
                <span className={`label-caps px-1.5 py-0.5 rounded flex items-center gap-1 text-[9px] ${style.badge}`}>
                  <Icon className="w-3 h-3"/> {style.label}
                </span>
              </div>
              <p className="pl-2 text-[11px] text-zinc-300">Rec: {item.recommendation}</p>
              {item.reason && (
                <p className="pl-2 text-[10px] text-zinc-500 italic">"{item.reason}"</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
