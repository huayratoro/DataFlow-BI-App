import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Database, Table, Calculator, StickyNote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COLORS, NodeType, NodeData, TableData, AppNode } from '../types';

// Common wrapper for consistent "Obsidian-like" aesthetic
const NodeWrapper: React.FC<{ 
  children: React.ReactNode; 
  defaultColor: string;
  customColor?: string;
  title: string; 
  icon: React.ReactNode;
  selected?: boolean;
  highlighted?: boolean;
}> = ({ children, defaultColor, customColor, title, icon, selected, highlighted = true }) => {
  
  const activeColor = customColor || defaultColor;

  return (
    <div 
      className={`rounded-md shadow-lg bg-white border-2 min-w-[180px] transition-all duration-200 ${
        selected ? 'ring-2 ring-offset-1' : ''
      } ${
        !highlighted ? 'opacity-30' : 'opacity-100'
      }`}
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

export const SourceNode = memo(({ data, selected }: NodeProps) => {
  const typedData = data as NodeData;
  return (
    <NodeWrapper 
      defaultColor={COLORS.GRAY} 
      customColor={typedData.color}
      title="Data Source" 
      icon={<Database size={14} />}
      selected={selected}
      highlighted={typedData.highlighted}
    >
      <div>
        <div className="font-medium">{typedData.label}</div>
        {typedData.sourceType && (
          <div className="text-xs text-slate-500 mt-1">{typedData.sourceType}</div>
        )}
      </div>
    </NodeWrapper>
  );
});

export const TableNode = memo(({ data, selected }: NodeProps) => {
  const typedData = data as NodeData;
  const tableData: TableData | undefined = typedData.tableData;
  const columns = tableData?.columns || [];

  return (
    <NodeWrapper 
      defaultColor={COLORS.BLUE} 
      customColor={typedData.color}
      title={typedData.label || "Table"} 
      icon={<Table size={14} />}
      selected={selected}
      highlighted={typedData.highlighted}
    >
      <div className="space-y-2">
        {/* Table Header (Columns) */}
        {columns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100">
                  {columns.map(col => (
                    <th key={col.id} className="border border-slate-300 px-2 py-1 text-left font-semibold text-slate-700">
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-slate-50">
                  {columns.map(col => (
                    <td key={col.id} className="border border-slate-300 px-2 py-1 text-slate-600">
                      —
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {/* Empty State */}
        {columns.length === 0 && (
          <div className="text-slate-400 text-xs italic py-2">
            Double-click to configure table
          </div>
        )}
      </div>
    </NodeWrapper>
  );
});

export const MeasureNode = memo(({ data, selected }: NodeProps) => {
  const typedData = data as NodeData;
  return (
    <NodeWrapper 
      defaultColor={COLORS.GREEN} 
      customColor={typedData.color}
      title="Measure" 
      icon={<Calculator size={14} />}
      selected={selected}
      highlighted={typedData.highlighted}
    >
      <div className="font-mono text-xs text-slate-500 mb-1">DAX</div>
      {typedData.label}
    </NodeWrapper>
  );
});

export const NoteNode = memo(({ data, selected }: NodeProps) => {
  const typedData = data as NodeData;
  const activeColor = typedData.color || COLORS.YELLOW;
  
  return (
    <div 
      className="rounded-md shadow-md border-2 p-3 relative"
      style={{ 
        backgroundColor: `${activeColor}80`, // 50% opacity via alpha hex
        borderColor: activeColor,
        zIndex: -1, // Always behind other nodes
        width: '100%',
        height: '100%',
        minWidth: '200px',
        minHeight: '100px',
      }}
    >
      <NodeResizer 
        minWidth={200} 
        minHeight={100}
        isVisible={selected}
        handleStyle={{ 
          width: 10, 
          height: 10, 
          backgroundColor: activeColor,
          border: '2px solid white',
          borderRadius: '50%',
        }}
        lineStyle={{
          borderColor: activeColor,
          borderWidth: 2,
        }}
      />
      
      <div className="prose prose-sm max-w-none h-full overflow-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Force black text for all elements
            p: ({node, ...props}) => <p className="text-black !opacity-100 my-1" {...props} />,
            h1: ({node, ...props}) => <h1 className="text-black !opacity-100 text-xl font-bold my-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-black !opacity-100 text-lg font-bold my-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-black !opacity-100 text-base font-bold my-1" {...props} />,
            h4: ({node, ...props}) => <h4 className="text-black !opacity-100 text-sm font-bold my-1" {...props} />,
            h5: ({node, ...props}) => <h5 className="text-black !opacity-100 text-sm font-bold my-1" {...props} />,
            h6: ({node, ...props}) => <h6 className="text-black !opacity-100 text-xs font-bold my-1" {...props} />,
            ul: ({node, ...props}) => <ul className="text-black !opacity-100 list-disc list-inside my-1" {...props} />,
            ol: ({node, ...props}) => <ol className="text-black !opacity-100 list-decimal list-inside my-1" {...props} />,
            li: ({node, ...props}) => <li className="text-black !opacity-100" {...props} />,
            strong: ({node, ...props}) => <strong className="text-black !opacity-100 font-bold" {...props} />,
            em: ({node, ...props}) => <em className="text-black !opacity-100 italic" {...props} />,
            code: ({node, ...props}) => <code className="text-black !opacity-100 bg-black/10 px-1 rounded text-xs" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="text-black !opacity-100 border-l-4 border-black/20 pl-3 my-2" {...props} />,
          }}
        >
          {typedData.markdown || '*Double-click to edit this note*'}
        </ReactMarkdown>
      </div>
      
      {/* No handles for Notes - they don't participate in flows */}
    </div>
  );
});

export const nodeTypes = {
  [NodeType.SOURCE]: SourceNode,
  [NodeType.TABLE]: TableNode,
  [NodeType.MEASURE]: MeasureNode,
  [NodeType.NOTE]: NoteNode,
};