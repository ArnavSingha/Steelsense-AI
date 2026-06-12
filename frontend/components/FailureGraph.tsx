import React from 'react';
import { Network } from 'lucide-react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface FailureGraphProps {
  demoMode: boolean;
  activeAsset: string;
  onSelectAsset: (asset: string) => void;
}

export default function FailureGraph({ demoMode, activeAsset, onSelectAsset }: FailureGraphProps) {
  const rawNodes = demoMode ? [
    { id: '1', label: 'COOLING-CS01', position: { x: 250, y: 50 }, defaultBg: '#ff3d00', defaultColor: '#fff', defaultBorder: '1px solid #ff3d00', isCritical: true },
    { id: '2', label: 'MOTOR-4', position: { x: 100, y: 150 }, defaultBg: '#ffb800', defaultColor: '#000', defaultBorder: '1px solid #ffb800', isWarning: true },
    { id: '3', label: 'PRESS-HP02', position: { x: 400, y: 150 }, defaultBg: '#121315', defaultColor: '#e2e8f0', defaultBorder: '1px solid #3f3f46' },
    { id: '4', label: 'GEARBOX-GB02', position: { x: 250, y: 250 }, defaultBg: '#121315', defaultColor: '#e2e8f0', defaultBorder: '1px solid #3f3f46' },
  ] : [
    { id: '1', label: 'COOLING-CS01', position: { x: 250, y: 50 }, defaultBg: '#0a2325', defaultColor: '#00f0ff', defaultBorder: '1px solid #00f0ff' },
    { id: '2', label: 'MOTOR-4', position: { x: 100, y: 150 }, defaultBg: '#0a2325', defaultColor: '#00f0ff', defaultBorder: '1px solid #00f0ff' },
    { id: '3', label: 'PRESS-HP02', position: { x: 400, y: 150 }, defaultBg: '#0a2325', defaultColor: '#00f0ff', defaultBorder: '1px solid #00f0ff' },
    { id: '4', label: 'GEARBOX-GB02', position: { x: 250, y: 250 }, defaultBg: '#0a2325', defaultColor: '#00f0ff', defaultBorder: '1px solid #00f0ff' },
  ];

  const nodes = rawNodes.map(node => {
    const isSelected = activeAsset === node.label;
    
    return {
      id: node.id,
      position: node.position,
      data: { label: node.label },
      style: {
        background: node.defaultBg,
        color: node.defaultColor,
        border: isSelected ? '2px solid #00f0ff' : node.defaultBorder,
        boxShadow: isSelected ? '0 0 15px rgba(0, 240, 255, 0.8)' : 'none',
        borderRadius: '4px',
        fontWeight: isSelected || (node as any).isCritical || (node as any).isWarning ? 'bold' : 'normal',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        padding: '6px 10px',
        transition: 'all 0.2s ease-in-out',
        transform: isSelected ? 'scale(1.08)' : 'scale(1)'
      }
    };
  });

  const initialEdges = demoMode ? [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#ff3d00', strokeWidth: 3 }, className: 'animate-pulse' },
    { id: 'e1-3', source: '1', target: '3', style: { stroke: '#3f3f46', strokeWidth: 1 } },
    { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#ffb800', strokeWidth: 2 } },
  ] : [
    { id: 'e1-2', source: '1', target: '2', animated: false, style: { stroke: '#00f0ff', strokeWidth: 1.5 } },
    { id: 'e1-3', source: '1', target: '3', animated: false, style: { stroke: '#00f0ff', strokeWidth: 1.5 } },
    { id: 'e2-4', source: '2', target: '4', animated: false, style: { stroke: '#00f0ff', strokeWidth: 1.5 } },
  ];

  return (
    <div className="glass-panel-premium flex flex-col h-full">
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#00f0ff]" />
          <h2 className="text-sm font-semibold text-white tracking-wide">Failure Propagation Network</h2>
        </div>
        <span className="label-caps text-zinc-500">Live Topology</span>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[300px]">
        <ReactFlow 
          nodes={nodes} 
          edges={initialEdges} 
          fitView 
          onNodeClick={(_, node) => onSelectAsset(node.data.label as string)}
          className="bg-transparent"
        >
          <Background color="rgba(255,255,255,0.03)" gap={16} size={1} />
          <Controls className="bg-[#18181b] border-[#3f3f46] fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
}
