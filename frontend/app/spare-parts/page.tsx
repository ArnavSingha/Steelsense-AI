"use client";

import React, { useState } from 'react';
import { Package, Search, Filter, AlertTriangle, CheckCircle2, ArrowRight, Plus, Box } from 'lucide-react';

export default function SparePartsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const [partsRes, statsRes] = await Promise.all([
          fetch('http://localhost:8001/api/v1/spare-parts/'),
          fetch('http://localhost:8001/api/v1/spare-parts/stats')
        ]);
        
        if (partsRes.ok && statsRes.ok) {
          const partsData = await partsRes.json();
          const statsData = await statsRes.json();
          
          const formattedParts = partsData.map((p: any) => ({
            id: p.part_number,
            name: p.name,
            category: p.description.split(' ')[0] || 'General',
            stock: p.quantity_available,
            minStock: p.reorder_level,
            status: p.stock_status === 'ok' ? 'In Stock' : p.stock_status === 'low_stock' ? 'Low Stock' : 'Out of Stock',
            location: p.location || 'Unknown'
          }));
          
          setInventoryData(formattedParts);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch spare parts:', error);
        // Fallback mock data
        setInventoryData([
          { id: "PART-1001", name: "High-Pressure Seal Kit", category: "Hydraulics", stock: 12, minStock: 5, status: "In Stock", location: "Warehouse A, Aisle 3" },
          { id: "PART-1004", name: "Primary Drive Belt", category: "Mechanical", stock: 0, minStock: 2, status: "Out of Stock", location: "Warehouse A, Aisle 5" },
        ]);
        setStats({ total: 1248, low_stock: 24, out_of_stock: 3 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpareParts();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Out of Stock': return 'text-[#ff3d00] bg-[#ff3d00]/10 border-[#ff3d00]/20';
      case 'Low Stock': return 'text-[#ffb800] bg-[#ffb800]/10 border-[#ffb800]/20';
      case 'In Stock': return 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20';
      default: return 'text-zinc-400 bg-zinc-800/50 border-zinc-700/50';
    }
  };

  const filteredInventory = inventoryData.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    part.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-[#0a0b0d] p-4 md:p-6 lg:p-8 font-geist text-white flex flex-col gap-6 overflow-y-auto h-full">
      {/* Top Banner */}
      <div className="flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] pb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Package className="w-6 h-6 text-[#00f0ff]" />
          Spare Parts Inventory
        </h1>
        <p className="label-caps text-zinc-500 mt-0.5">Automated Stock Tracking & AI Reorder Predictions</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
        <div className="glass-panel-premium p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#00f0ff]/10 flex items-center justify-center border border-[#00f0ff]/20">
            <Box className="w-6 h-6 text-[#00f0ff]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white block">{loading ? '-' : stats?.total || 0}</span>
            <span className="label-caps text-zinc-500">Total Items</span>
          </div>
        </div>
        <div className="glass-panel-premium p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ffb800]/10 flex items-center justify-center border border-[#ffb800]/20">
            <AlertTriangle className="w-6 h-6 text-[#ffb800]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#ffb800] block">{loading ? '-' : stats?.low_stock || 0}</span>
            <span className="label-caps text-[#ffb800]/70">Low Stock</span>
          </div>
        </div>
        <div className="glass-panel-premium p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ff3d00]/10 flex items-center justify-center border border-[#ff3d00]/20">
            <AlertTriangle className="w-6 h-6 text-[#ff3d00]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#ff3d00] block">{loading ? '-' : stats?.out_of_stock || 0}</span>
            <span className="label-caps text-[#ff3d00]/70">Stockouts</span>
          </div>
        </div>
        <div className="glass-panel-premium p-4 flex items-center gap-4 cursor-pointer hover:border-[#00f0ff]/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/20">
            <Plus className="w-6 h-6 text-[#10b981]" />
          </div>
          <div>
            <span className="text-lg font-bold text-[#10b981] block">Restock</span>
            <span className="label-caps text-[#10b981]/70">Auto-Generate PO</span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel-premium flex-1 flex flex-col overflow-hidden min-h-[400px]">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 bg-[#121315]/50">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search parts, ID, or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0b0d] border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-300 transition-colors">
            <Filter className="w-4 h-4" />
            Category Filter
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px] lg:min-w-0">
            <thead className="bg-[#121315] sticky top-0 z-10 text-xs label-caps text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Part ID</th>
                <th className="px-6 py-4 font-semibold">Part Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Stock Level</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredInventory.map((part) => (
                <tr key={part.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-zinc-400">{part.id}</td>
                  <td className="px-6 py-4 font-bold text-white">{part.name}</td>
                  <td className="px-6 py-4 text-zinc-400">{part.category}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${part.stock <= part.minStock ? 'text-[#ff3d00]' : 'text-white'}`}>
                        {part.stock}
                      </span>
                      <span className="text-zinc-500 text-xs">/ Min {part.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(part.status)}`}>
                      {part.status === 'In Stock' && <CheckCircle2 className="w-3 h-3" />}
                      {part.status !== 'In Stock' && <AlertTriangle className="w-3 h-3" />}
                      {part.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{part.location}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1.5 rounded-md bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto">
                      Reserve
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
