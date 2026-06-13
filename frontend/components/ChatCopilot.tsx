import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, AlertTriangle, Activity } from 'lucide-react';

export default function ChatCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'I am ForgeMind Copilot. How can I assist with your plant operations today?',
      intent: null
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // Map messages to simple role/content pairs to exclude intent/metadata
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      
      const threadId = typeof window !== 'undefined' ? (localStorage.getItem('copilot_thread_id') || Math.random().toString(36).substring(7)) : 'default';
      if (typeof window !== 'undefined') localStorage.setItem('copilot_thread_id', threadId);
      
      const res = await fetch('https://steelsense-ai-production.up.railway.app/api/copilot/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMessage.content,
          history: chatHistory,
          thread_id: threadId
        })
      });
      
      if (!res.ok) throw new Error('API Error');
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader available');
      
      // Add a placeholder message for the streaming response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Initializing...',
        intent: 'processing...'
      }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.is_final) {
                if (data.error) throw new Error(data.error);
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = {
                    role: 'assistant',
                    content: data.response || "No response generated.",
                    intent: data.intent,
                    risk_level: data.risk_level,
                    equipment_id: data.equipment_id,
                    confidence: data.confidence
                  };
                  return newMsgs;
                });
              } else if (data.step) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = `[Executing step: ${data.step}...]`;
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error("Error parsing stream data", e);
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        // If the last message is our placeholder, replace it, otherwise append
        if (newMsgs[newMsgs.length - 1].intent === 'processing...') {
          newMsgs[newMsgs.length - 1] = {
            role: 'assistant',
            content: "System Error: Unable to reach the knowledge engine on port 8001 or backend failure.",
            intent: "error"
          };
        } else {
          newMsgs.push({
            role: 'assistant',
            content: "System Error: Unable to reach the knowledge engine on port 8001 or backend failure.",
            intent: "error"
          });
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#00f0ff] hover:bg-[#00dbe9] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-transform hover:scale-110 group relative"
        >
          <div className="absolute inset-0 rounded-full border border-[#00f0ff] opacity-50 group-hover:scale-110 transition-transform duration-500 animate-ping" style={{ animationDuration: '3s' }}></div>
          {isOpen ? <X className="text-[#0a0b0d] w-6 h-6 z-10" /> : <Bot className="text-[#0a0b0d] w-6 h-6 z-10" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 w-auto sm:w-96 max-h-[600px] h-[80vh] bg-[#0a0b0d]/85 backdrop-blur-2xl border border-[rgba(0,240,255,0.2)] rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,240,255,0.03)] flex items-center gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50"></div>
              <Bot className="text-[#00f0ff] w-6 h-6" />
              <div>
                <h3 className="font-bold text-white text-sm tracking-wide">ForgeMind Copilot</h3>
                <p className="text-xs text-[#00f0ff]/70 uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>System Active</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)] scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 max-w-[85%] text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#00f0ff] text-[#0a0b0d] rounded-2xl rounded-br-sm font-medium' : 'bg-[#1a1c23]/80 border-l-2 border-[#00f0ff] text-zinc-200 rounded-r-xl rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                  {msg.intent && msg.intent !== "error" && (
                    <div className="flex items-center flex-wrap gap-2 mt-2 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                      {msg.risk_level === "CRITICAL" ? (
                        <span className="flex items-center gap-1 text-[#ff3d00] bg-[rgba(255,61,0,0.1)] border border-[#ff3d00]/20 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3" /> RISK: {msg.risk_level}
                        </span>
                      ) : msg.risk_level ? (
                        <span className="text-[#ffb800] bg-[rgba(255,184,0,0.1)] border border-[#ffb800]/20 px-2 py-0.5 rounded">
                          RISK: {msg.risk_level}
                        </span>
                      ) : null}
                      <span className="text-[#00f0ff] bg-[rgba(0,240,255,0.08)] border border-[#00f0ff]/20 px-2 py-0.5 rounded uppercase">
                        {msg.intent}
                      </span>
                      {msg.confidence && (
                        <span className="text-zinc-400 bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.1)]">
                          CONF: {typeof msg.confidence === 'number' ? `${(msg.confidence * 100).toFixed(0)}%` : msg.confidence}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-[#00f0ff] text-xs font-mono animate-pulse mt-2">
                  <Activity className="w-4 h-4" /> Analyzing system states...
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] backdrop-blur-md">
              <div className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query parameters..."
                  className="w-full bg-[#1a1c23]/60 border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all pr-12 placeholder-zinc-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#00f0ff] rounded-full hover:bg-[#00dbe9] transition-all disabled:opacity-50 hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                >
                  <Send className="w-3.5 h-3.5 text-[#0a0b0d] translate-x-px -translate-y-px" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
