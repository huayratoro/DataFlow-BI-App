import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  Node,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import { Download, Menu, Save, X, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as htmlToImage from 'html-to-image';

import { Sidebar } from './components/Sidebar';
import { nodeTypes } from './components/CustomNodes';
import { CustomEdge } from './components/CustomEdge';
import { TableEditModal } from './components/TableEditModal';
import { Project, NodeType, COLORS, CUSTOM_PALETTE, TableData } from './types';
import { db } from './services/db';

// Initial empty project state
const DEFAULT_PROJECT: Project = {
  id: uuidv4(),
  name: 'New Analysis',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  nodes: [],
  edges: []
};

// Modal for editing properties (Color, Label)
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialLabel: string;
  initialColor?: string;
  onSave: (label: string, color: string) => void;
  onDelete: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, title, initialLabel, initialColor, onSave, onDelete }) => {
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor || CUSTOM_PALETTE[0]);

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setColor(initialColor || CUSTOM_PALETTE[0]);
    }
  }, [isOpen, initialLabel, initialColor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-80 p-5 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Label Name</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name..."
              autoFocus
            />
            <p className="text-[10px] text-slate-400 mt-1">Leave empty to hide label (for arrows).</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {CUSTOM_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              onClick={() => {
                const confirmed = window.confirm("Are you sure you want to delete this item?");
                if(confirmed) onDelete();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button 
              onClick={() => onSave(label, color)}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  // Edit Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    type: 'node' | 'edge';
    id: string;
    label: string;
    color?: string;
  }>({
    isOpen: false,
    type: 'node',
    id: '',
    label: '',
  });

  // Table Edit Modal State
  const [tableEditModal, setTableEditModal] = useState<{
    isOpen: boolean;
    nodeId: string;
    tableData?: TableData;
  }>({
    isOpen: false,
    nodeId: '',
  });

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  // Load Projects on Start
  useEffect(() => {
    const init = async () => {
      try {
        const savedProjects = await db.getAllProjects();
        if (savedProjects.length > 0) {
          setProjects(savedProjects);
          const lastProject = savedProjects.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          loadProject(lastProject);
        } else {
          await createNewProject();
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    init();
  }, []);

  // Save specific project
  const saveCurrentProject = useCallback(async () => {
    if (!activeProjectId) return;
    
    const currentProject = projects.find(p => p.id === activeProjectId);
    if (!currentProject) return;

    const updatedProject: Project = {
      ...currentProject,
      nodes: getNodes(),
      edges: getEdges(),
      updatedAt: Date.now()
    };

    await db.saveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === activeProjectId ? updatedProject : p));
  }, [activeProjectId, projects, getNodes, getEdges]);

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeProjectId) {
        saveCurrentProject();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [nodes, edges, activeProjectId, saveCurrentProject]);

  const loadProject = (project: Project) => {
    setActiveProjectId(project.id);
    setNodes(project.nodes || []);
    setEdges(project.edges || []);
  };

  const createNewProject = async () => {
    const newProject: Project = {
      ...DEFAULT_PROJECT,
      id: uuidv4(),
      name: `Analysis ${new Date().toLocaleDateString()}`,
    };
    await db.saveProject(newProject);
    setProjects(prev => [...prev, newProject]);
    loadProject(newProject);
  };

  const deleteProject = async (id: string) => {
    await db.deleteProject(id);
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      if (remaining.length > 0) {
        loadProject(remaining[0]);
      } else {
        setNodes([]);
        setEdges([]);
        setActiveProjectId(null);
      }
    }
  };

  const renameProject = async (id: string, newName: string) => {
    const projectToRename = projects.find(p => p.id === id);
    if (!projectToRename) return;

    const updatedProject: Project = {
      ...projectToRename,
      name: newName,
      updatedAt: Date.now()
    };

    await db.saveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'custom',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
      animated: true,
      data: { color: '#94a3b8' } 
    }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Default table data
      const defaultTableData: TableData = {
        columns: [{ id: uuidv4(), name: 'Column' }],
        rows: [{ id: uuidv4(), name: 'row1' }],
      };

      const newNode: Node = {
        id: uuidv4(),
        type,
        position,
        data: { 
          label: `New ${type}`,
          // Add default table data for table nodes
          ...(type === NodeType.TABLE && { tableData: defaultTableData })
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes],
  );

  const exportImage = useCallback(() => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    htmlToImage.toPng(reactFlowWrapper.current, { backgroundColor: '#f3f4f6' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'dataflow-diagram.png';
        link.href = dataUrl;
        link.click();
      });
  }, [reactFlowWrapper]);

  // Handle Double Clicks
  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    // If it's a Table node, open the table edit modal
    if (node.type === NodeType.TABLE) {
      const tableData = node.data.tableData as TableData | undefined;
      setTableEditModal({
        isOpen: true,
        nodeId: node.id,
        tableData,
      });
    } else {
      // For other nodes, use the regular edit modal
      setEditModal({
        isOpen: true,
        type: 'node',
        id: node.id,
        label: node.data.label as string,
        color: node.data.color as string,
      });
    }
  };

  const onEdgeDoubleClick = (_: React.MouseEvent, edge: Edge) => {
    setEditModal({
      isOpen: true,
      type: 'edge',
      id: edge.id,
      label: (edge.label as string) || '',
      color: edge.data?.color as string || '#94a3b8',
    });
  };

  const handleSaveModal = (newLabel: string, newColor: string) => {
    if (editModal.type === 'node') {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== editModal.id) return node;
          return {
            ...node,
            data: { ...node.data, label: newLabel, color: newColor },
          };
        })
      );
    } else {
      setEdges((eds) => 
        eds.map((edge) => {
          if (edge.id !== editModal.id) return edge;
          return {
            ...edge,
            label: newLabel,
            data: { ...edge.data, color: newColor },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: newColor,
            },
          };
        })
      );
    }
    setEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeleteFromModal = () => {
    if (editModal.type === 'node') {
      setNodes(nds => nds.filter(n => n.id !== editModal.id));
    } else {
      setEdges(eds => eds.filter(e => e.id !== editModal.id));
    }
    setEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveTable = (tableData: TableData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== tableEditModal.nodeId) return node;
        return {
          ...node,
          data: { ...node.data, tableData },
        };
      })
    );
    setTableEditModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden text-slate-800">
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        onCreateProject={createNewProject}
        onSelectProject={(id) => {
          saveCurrentProject().then(() => {
            const p = projects.find(proj => proj.id === id);
            if (p) loadProject(p);
          });
        }}
        onDeleteProject={deleteProject}
        onRenameProject={renameProject}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 relative h-full flex flex-col" ref={reactFlowWrapper}>
        {/* Mobile Header Toggle */}
        {!sidebarOpen && (
          <div className="absolute top-4 left-4 z-50">
             <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white shadow-md rounded-md hover:bg-slate-50">
                <Menu size={20} />
             </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-10 flex gap-2 bg-white/90 backdrop-blur shadow-md p-1 rounded-lg border border-slate-200">
             <button onClick={exportImage} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded" title="Export PNG">
               <Download size={18} />
             </button>
             <div className="w-px bg-slate-200 mx-1"></div>
             <button onClick={saveCurrentProject} className="p-2 text-slate-600 hover:text-green-600 hover:bg-slate-50 rounded" title="Save Project">
               <Save size={18} />
             </button>
        </div>

        {activeProjectId ? (
           <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-slate-100"
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background color="#cbd5e1" gap={16} size={1} />
            <Controls className="!bg-white !border-slate-200 !shadow-sm text-slate-600" />
            <MiniMap 
              className="!bg-white !border-slate-200 !shadow-sm"
              nodeColor={(n) => {
                return (n.data?.color as string) || '#5c6670';
              }}
            />
          </ReactFlow>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
            Select or create a project to begin
          </div>
        )}

        <EditModal 
          isOpen={editModal.isOpen}
          onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
          title={editModal.type === 'node' ? 'Edit Node' : 'Edit Connection'}
          initialLabel={editModal.label}
          initialColor={editModal.color}
          onSave={handleSaveModal}
          onDelete={handleDeleteFromModal}
        />

        <TableEditModal
          isOpen={tableEditModal.isOpen}
          onClose={() => setTableEditModal(prev => ({ ...prev, isOpen: false }))}
          initialTableData={tableEditModal.tableData}
          onSave={handleSaveTable}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}