"use client";

import React, { useState } from 'react';
import { BookOpen, Search, Filter, FileText, ChevronRight, Bookmark, HardDrive, Database, Settings, Shield } from 'lucide-react';

const mockArticles = [
  { id: "DOC-102", title: "Bearing Replacement SOP for MOTOR-4", category: "Standard Operating Procedures", icon: <Shield className="w-5 h-5" />, reads: 142, lastUpdated: "2 Weeks Ago" },
  { id: "DOC-441", title: "Troubleshooting Cooling System Pressure Drops", category: "Maintenance Manuals", icon: <Settings className="w-5 h-5" />, reads: 89, lastUpdated: "1 Month Ago" },
  { id: "DOC-892", title: "Hydraulic Press Calibration Guidelines", category: "Calibration", icon: <HardDrive className="w-5 h-5" />, reads: 34, lastUpdated: "3 Days Ago" },
  { id: "DOC-210", title: "Historical Log: Furnace Alpha Overheat Incident 2025", category: "Incident Reports", icon: <Database className="w-5 h-5" />, reads: 211, lastUpdated: "6 Months Ago" },
  { id: "DOC-055", title: "Slag Conveyor Belt Tensioning Limits", category: "Maintenance Manuals", icon: <Settings className="w-5 h-5" />, reads: 67, lastUpdated: "2 Months Ago" },
];

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<any[]>(mockArticles);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch('https://steelsense-ai-production.up.railway.app/api/v1/knowledge/documents');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const formatted = data.map((d: any) => ({
              id: d.id.split('-')[0].toUpperCase(),
              title: d.title,
              category: d.document_type || d.equipment_type || "General",
              icon: <FileText className="w-5 h-5" />,
              reads: d.chunk_count * 12 || 15, // mock reads
              lastUpdated: d.created_at ? new Date(d.created_at).toLocaleDateString() : "Recently"
            }));
            setArticles(formatted);
          }
        }
      } catch (e) {
        console.error("Failed to fetch documents", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#00f0ff]" />
          Knowledge Base
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">SOPs, Manuals, and Historical Engineering Logs</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar: Categories */}
        <div className="w-64 glass-panel-premium p-4 hidden lg:flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-shrink-0">
          <div>
            <h3 className="text-xs label-caps text-zinc-500 mb-3 px-2">Categories</h3>
            <ul className="space-y-1">
              {['All Documents', 'Standard Operating Procedures', 'Maintenance Manuals', 'Calibration', 'Incident Reports', 'Safety Guidelines'].map((cat, idx) => (
                <li key={idx}>
                  <button className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${idx === 0 ? 'bg-[#00f0ff]/10 text-[#00f0ff] font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs label-caps text-zinc-500 mb-3 px-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2 px-2">
              {['MOTOR', 'COOLING', 'BEARING', 'HIGH-PRESSURE', 'CALIBRATION'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-mono rounded hover:bg-zinc-700 cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Search Bar */}
          <div className="glass-panel-premium p-2 flex items-center flex-shrink-0">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search knowledge base for error codes, procedures, or components..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-0 placeholder-zinc-500"
              />
            </div>
            <div className="h-8 w-px bg-zinc-800 mx-2 hidden sm:block"></div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              Advanced
            </button>
          </div>

          {/* Mobile Categories Selector */}
          <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-none flex-shrink-0">
            {['All Documents', 'Standard Operating Procedures', 'Maintenance Manuals', 'Calibration', 'Incident Reports', 'Safety Guidelines'].map((cat, idx) => (
              <button
                key={idx}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                  idx === 0 
                    ? 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/30 font-bold' 
                    : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <div key={article.id} className="glass-panel-premium p-5 flex gap-4 hover:border-[#00f0ff]/30 transition-all cursor-pointer group hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-lg bg-[#121315] border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00f0ff] group-hover:border-[#00f0ff]/30 transition-colors flex-shrink-0">
                    {article.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{article.id}</span>
                          <span className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider">{article.category}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors">{article.title}</h2>
                      </div>
                      <button className="text-zinc-500 hover:text-white transition-colors">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                      Comprehensive guide and historical data context regarding {article.title.toLowerCase()}. Includes safety precautions, required tools, step-by-step procedures, and expected tolerances.
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500 font-mono">
                      <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {article.reads} Reads</span>
                      <span>•</span>
                      <span>Updated {article.lastUpdated}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-6 h-6 text-[#00f0ff]" />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 pb-20">
                <Search className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-bold text-zinc-400">No results found</p>
                <p className="text-sm">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
