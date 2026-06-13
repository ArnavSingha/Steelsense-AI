"use client";

import React, { useState } from 'react';
import { MessageSquare, Bot, Send, Activity, AlertTriangle, User } from 'lucide-react';

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'ForgeMind AI Assistant online. I have full access to telemetry, maintenance logs, and real-time sensor data. How can I assist you with plant operations today?',
      intent: 'greeting',
      risk_level: null
    }
  ]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentQuery,
          session_id: sessionId,
          user_role: 'engineer',
          context: {}
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (!sessionId) {
          setSessionId(data.session_id);
        }
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          intent: data.agent_type,
          risk_level: data.alerts_triggered?.length > 0 ? 'HIGH' : null,
          confidence: 90
        }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error: Could not connect to ForgeMind AI backend.',
        intent: 'system_error'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 h-full overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-[#00f0ff]" />
          AI Engineering Assistant
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">Conversational Interface to Knowledge Graph & Telemetry</p>
      </div>

      <div className="glass-panel-premium flex-1 flex flex-col overflow-hidden relative">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 flex items-center justify-center flex-shrink-0 border border-[#00f0ff]/30">
                  <Bot className="w-4 h-4 text-[#00f0ff]" />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#00f0ff] text-[#0a0b0d] rounded-tr-sm font-medium' 
                    : 'bg-[#121315] border border-zinc-800 rounded-tl-sm text-zinc-200 shadow-sm'
                }`}>
                  {msg.content}
                </div>
                
                {msg.intent && msg.intent !== "greeting" && (
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                    {msg.risk_level === "CRITICAL" ? (
                      <span className="flex items-center gap-1 text-[#ff3d00] bg-[#ff3d00]/10 border border-[#ff3d00]/20 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3" /> RISK: {msg.risk_level}
                      </span>
                    ) : msg.risk_level ? (
                      <span className="text-[#ffb800] bg-[#ffb800]/10 border border-[#ffb800]/20 px-2 py-0.5 rounded">
                        RISK: {msg.risk_level}
                      </span>
                    ) : null}
                    <span className="text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/20 px-2 py-0.5 rounded uppercase">
                      {msg.intent}
                    </span>
                    {msg.confidence && (
                      <span className="text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                        CONF: {msg.confidence}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 flex items-center justify-center flex-shrink-0 border border-[#00f0ff]/30">
                <Bot className="w-4 h-4 text-[#00f0ff]" />
              </div>
              <div className="bg-[#121315] border border-zinc-800 rounded-xl rounded-tl-sm p-4 text-sm text-[#00f0ff] flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" />
                Querying Knowledge Graph...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800/50 bg-[#121315]/80 backdrop-blur-sm">
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about equipment health, recent anomalies, or maintenance procedures..."
              className="w-full bg-[#0a0b0d] border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all placeholder-zinc-500"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#00f0ff] rounded-md hover:bg-[#00d8e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-[#0a0b0d]" />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-zinc-500 font-mono">AI can make mistakes. Verify important technical insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
