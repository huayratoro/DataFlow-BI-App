import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Database, Table, Calculator } from 'lucide-react';
import { COLORS, NodeType, NodeData } from '../types';

// Common wrapper for consistent "Obsidian-like" aesthetic
const NodeWrapper: React.FC<{ 
  children: React.ReactNode; 
  defaultColor: string;
  customColor?: string;
  title: string; 
  icon: React.ReactNode;
  selected?: boolean;
}> = ({ children, defaultColor, customColor, title, icon, selected }) => {
  
  const activeColor = customColor || defaultColor;

  return (
    <div 
      className={`rounded-md shadow-lg bg-white border-2 min-w-[180px] transition-all duration-200 ${selected ? 'ring-2 ring-offset-1' : ''}`}
      style={{ 
        borderColor: activeColor,  
        boxShadow: selected ? `0 0 0 2px ${activeColor}40` : '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
      }}
    >
      <div 
        className="px-3 py-2 flex items-center gap-2 text-white font-medium rounded-t-sm text-sm"
        style={{ backgroundColor: activeColor }}
      >
        {icon}
        <span>{title}</span>
      </div>
      <div className="p-3 text-slate-700 text-sm font-medium break-words">
        {children}
      </div>
      
      {/* Input Handle */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 !bg-slate-400" 
        style={{ left: -7 }}
      />
      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 !bg-slate-400" 
        style={{ right: -7 }}
      />
    </div>
  );
};

export const SourceNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <NodeWrapper 
      defaultColor={COLORS.GRAY} 
      customColor={data.color}
      title="Data Source" 
      icon={<Database size={14} />}
      selected={selected}
    >
      {data.label}
    </NodeWrapper>
  );
});

export const TableNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <NodeWrapper 
      defaultColor={COLORS.BLUE} 
      customColor={data.color}
      title="Table" 
      icon={<Table size={14} />}
      selected={selected}
    >
      {data.label}
    </NodeWrapper>
  );
});

export const MeasureNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <NodeWrapper 
      defaultColor={COLORS.GREEN} 
      customColor={data.color}
      title="Measure" 
      icon={<Calculator size={14} />}
      selected={selected}
    >
      <div className="font-mono text-xs text-slate-500 mb-1">DAX</div>
      {data.label}
    </NodeWrapper>
  );
});

export const nodeTypes = {
  [NodeType.SOURCE]: SourceNode,
  [NodeType.TABLE]: TableNode,
  [NodeType.MEASURE]: MeasureNode,
};