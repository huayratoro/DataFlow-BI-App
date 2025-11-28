import React, { useState } from 'react';
import { Project, COLORS, NodeType } from '../types';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Database, 
  Table, 
  Calculator, 
  Menu,
  MoreVertical,
  X
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onCreateProject,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  isOpen,
  setIsOpen
}) => {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const editInputRef = React.useRef<HTMLInputElement>(null);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDoubleClick = (id: string, currentName: string) => {
    setEditingProjectId(id);
    setEditingProjectName(currentName);
  };

  const handleProjectNameChange = (id: string) => {
    if (editingProjectName.trim()) {
      onRenameProject(id, editingProjectName.trim());
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleProjectNameChange(id);
    } else if (e.key === 'Escape') {
      setEditingProjectId(null);
      setEditingProjectName('');
    }
  };

  React.useEffect(() => {
    if (editingProjectId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingProjectId]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed md:relative z-50 h-full bg-white border-r border-slate-200 
        transition-all duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-64 md:translate-x-0 overflow-hidden'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h1 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-white text-xs">BI</span>
            DataFlow
          </h1>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-slate-500 hover:text-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbox (Drag & Drop) */}
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Toolbox</h2>
          <div className="space-y-2">
            <div 
              className="p-2 bg-slate-50 border border-slate-200 rounded cursor-move hover:border-slate-400 hover:shadow-sm transition-all flex items-center gap-3 text-sm text-slate-700"
              onDragStart={(event) => onDragStart(event, NodeType.SOURCE)}
              draggable
            >
              <div className="w-6 h-6 rounded flex items-center justify-center text-white" style={{background: COLORS.GRAY}}>
                <Database size={14} />
              </div>
              Data Source
            </div>
            
            <div 
              className="p-2 bg-slate-50 border border-slate-200 rounded cursor-move hover:border-slate-400 hover:shadow-sm transition-all flex items-center gap-3 text-sm text-slate-700"
              onDragStart={(event) => onDragStart(event, NodeType.TABLE)}
              draggable
            >
              <div className="w-6 h-6 rounded flex items-center justify-center text-white" style={{background: COLORS.BLUE}}>
                <Table size={14} />
              </div>
              Table
            </div>

            <div 
              className="p-2 bg-slate-50 border border-slate-200 rounded cursor-move hover:border-slate-400 hover:shadow-sm transition-all flex items-center gap-3 text-sm text-slate-700"
              onDragStart={(event) => onDragStart(event, NodeType.MEASURE)}
              draggable
            >
              <div className="w-6 h-6 rounded flex items-center justify-center text-white" style={{background: COLORS.GREEN}}>
                <Calculator size={14} />
              </div>
              Measure
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">Drag items to canvas</p>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</h2>
            <button 
              onClick={onCreateProject}
              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="New Project"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-1">
            {projects.length === 0 && (
              <div className="text-sm text-slate-400 italic text-center py-4">No projects yet</div>
            )}
            
            {projects.map((p) => (
              <div 
                key={p.id}
                className={`
                  group flex items-center justify-between p-2 rounded-md text-sm cursor-pointer transition-colors
                  ${activeProjectId === p.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                `}
                onClick={() => {
                  if (editingProjectId !== p.id) {
                    onSelectProject(p.id);
                  }
                }}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <FolderOpen size={14} className={activeProjectId === p.id ? 'text-slate-800' : 'text-slate-400'} />
                  {editingProjectId === p.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingProjectName}
                      onChange={(e) => setEditingProjectName(e.target.value)}
                      onBlur={() => handleProjectNameChange(p.id)}
                      onKeyDown={(e) => handleKeyDown(e, p.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project name..."
                    />
                  ) : (
                    <span 
                      onDoubleClick={() => handleProjectDoubleClick(p.id, p.name)}
                      className="truncate cursor-text hover:bg-slate-200 px-1 rounded transition-colors"
                    >
                      {p.name}
                    </span>
                  )}
                </div>
                
                {editingProjectId !== p.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-600 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          DataFlow BI v1.0
        </div>
      </div>
    </>
  );
};