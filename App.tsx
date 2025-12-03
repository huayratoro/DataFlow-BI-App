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
import { SourceEditModal } from './components/SourceEditModal';
import { MeasureEditModal } from './components/MeasureEditModal';
import { NoteEditModal } from './components/NoteEditModal';
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

  // Highlight state for dependency visualization
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());

  // BFS algorithm to get transitive dependencies (all connected nodes upstream and downstream)
  const getTransitiveDependencies = useCallback((nodeId: string, edges: Edge[]): { upstream: Set<string>, downstream: Set<string> } => {
    const upstream = new Set<string>();
    const downstream = new Set<string>();

    // BFS for upstream (ancestors)
    const upstreamQueue = [nodeId];
    const upstreamVisited = new Set<string>([nodeId]);
    while (upstreamQueue.length > 0) {
      const current = upstreamQueue.shift()!;
      const parents = edges.filter(e => e.target === current).map(e => e.source);
      parents.forEach(parentId => {
        if (!upstreamVisited.has(parentId)) {
          upstreamVisited.add(parentId);
          upstream.add(parentId);
          upstreamQueue.push(parentId);
        }
      });
    }

    // BFS for downstream (descendants)
    const downstreamQueue = [nodeId];
    const downstreamVisited = new Set<string>([nodeId]);
    while (downstreamQueue.length > 0) {
      const current = downstreamQueue.shift()!;
      const children = edges.filter(e => e.source === current).map(e => e.target);
      children.forEach(childId => {
        if (!downstreamVisited.has(childId)) {
          downstreamVisited.add(childId);
          downstream.add(childId);
          downstreamQueue.push(childId);
        }
      });
    }

    return { upstream, downstream };
  }, []);

  // Handle selection changes for dependency highlighting
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    if (selectedNodes.length === 1) {
      const selectedNodeId = selectedNodes[0].id;
      const { upstream, downstream } = getTransitiveDependencies(selectedNodeId, edges);
      
      // Combine all connected nodes (including the selected one)
      const allConnectedNodes = new Set([selectedNodeId, ...upstream, ...downstream]);
      
      // Find all edges that connect highlighted nodes
      const connectedEdges = new Set(
        edges
          .filter(e => allConnectedNodes.has(e.source) && allConnectedNodes.has(e.target))
          .map(e => e.id)
      );
      
      setHighlightedNodes(allConnectedNodes);
      setHighlightedEdges(connectedEdges);
    } else {
      // Clear highlight when no single node is selected
      setHighlightedNodes(new Set());
      setHighlightedEdges(new Set());
    }
  }, [edges, getTransitiveDependencies]);

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
    label: string;
    color?: string;
    description?: string;
  }>({
    isOpen: false,
    nodeId: '',
    label: '',
    color: undefined,
    description: undefined,
  });

  // Source Edit Modal State
  const [sourceEditModal, setSourceEditModal] = useState<{
    isOpen: boolean;
    nodeId: string;
    label: string;
    url?: string;
    color?: string;
    description?: string;
    sourceType?: string;
  }>({
    isOpen: false,
    nodeId: '',
    label: '',
    url: undefined,
    color: undefined,
    description: undefined,
    sourceType: undefined,
  });

  // Measure Edit Modal State
  const [measureEditModal, setMeasureEditModal] = useState<{
    isOpen: boolean;
    nodeId: string;
    label: string;
    color?: string;
    description?: string;
  }>({
    isOpen: false,
    nodeId: '',
    label: '',
    color: undefined,
    description: undefined,
  });

  // Note Edit Modal State
  const [noteEditModal, setNoteEditModal] = useState<{
    isOpen: boolean;
    nodeId: string;
    color?: string;
    markdown?: string;
  }>({
    isOpen: false,
    nodeId: '',
    color: undefined,
    markdown: undefined,
  });

  // Placement Mode State (for click-to-place Notes)
  const [placementMode, setPlacementMode] = useState<{
    active: boolean;
    nodeType: NodeType | null;
  }>({
    active: false,
    nodeType: null,
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

  // Cancel placement mode with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && placementMode.active) {
        setPlacementMode({ active: false, nodeType: null });
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [placementMode.active]);

  // Reset placement mode when changing projects
  useEffect(() => {
    setPlacementMode({ active: false, nodeType: null });
  }, [activeProjectId]);

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

  // Handle Canvas Click for Placement Mode
  const onCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!placementMode.active || !placementMode.nodeType) return;
    
    // Only create node if clicking on the canvas pane itself, not on existing nodes
    const target = event.target as HTMLElement;
    if (target.classList.contains('react-flow__pane')) {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode: Node = {
        id: uuidv4(),
        type: placementMode.nodeType,
        position,
        data: { 
          markdown: '',
          color: COLORS.YELLOW 
        },
        style: { zIndex: -1 },  // Always behind other nodes
        width: 250,
        height: 150,
      };
      
      setNodes((nds) => nds.concat(newNode));
      setPlacementMode({ active: false, nodeType: null });
    }
  }, [placementMode, screenToFlowPosition, setNodes]);

  // Handle Double Clicks
  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    // If it's a Table node, open the table edit modal
    if (node.type === NodeType.TABLE) {
      const tableData = node.data.tableData as TableData | undefined;
      setTableEditModal({
        isOpen: true,
        nodeId: node.id,
        tableData,
        label: node.data.label as string,
        color: node.data.color as string,
        description: node.data.description as string,
      });
    } else if (node.type === NodeType.SOURCE) {
      // For Source nodes, open the source edit modal
      setSourceEditModal({
        isOpen: true,
        nodeId: node.id,
        label: node.data.label as string,
        url: node.data.url as string,
        color: node.data.color as string,
        description: node.data.description as string,
        sourceType: node.data.sourceType as string,
      });
    } else if (node.type === NodeType.MEASURE) {
      // For Measure nodes, open the measure edit modal
      setMeasureEditModal({
        isOpen: true,
        nodeId: node.id,
        label: node.data.label as string,
        color: node.data.color as string,
        description: node.data.description as string,
      });
    } else if (node.type === NodeType.NOTE) {
      // For Note nodes, open the note edit modal
      setNoteEditModal({
        isOpen: true,
        nodeId: node.id,
        color: node.data.color as string,
        markdown: node.data.markdown as string,
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

  const handleSaveTable = (tableData: TableData, label: string, color: string, description: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== tableEditModal.nodeId) return node;
        return {
          ...node,
          data: { ...node.data, label, color, description, tableData },
        };
      })
    );
    setTableEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveSource = (label: string, url: string, color: string, description: string, sourceType: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== sourceEditModal.nodeId) return node;
        return {
          ...node,
          data: { ...node.data, label, url, color, description, sourceType },
        };
      })
    );
    setSourceEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveMeasure = (label: string, color: string, description: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== measureEditModal.nodeId) return node;
        return {
          ...node,
          data: { ...node.data, label, color, description },
        };
      })
    );
    setMeasureEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveNote = (color: string, markdown: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== noteEditModal.nodeId) return node;
        return {
          ...node,
          data: { ...node.data, color, markdown },
        };
      })
    );
    setNoteEditModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleStartPlacement = (nodeType: NodeType) => {
    setPlacementMode({ active: true, nodeType });
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
        onStartPlacement={handleStartPlacement}
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
            nodes={nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                highlighted: highlightedNodes.size === 0 || highlightedNodes.has(node.id)
              }
            }))}
            edges={edges.map(edge => ({
              ...edge,
              data: {
                ...edge.data,
                highlighted: highlightedEdges.size === 0 || highlightedEdges.has(edge.id)
              }
            }))}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={onCanvasClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className={`bg-slate-100 ${placementMode.active ? 'cursor-crosshair' : ''}`}
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
          initialLabel={tableEditModal.label}
          initialColor={tableEditModal.color}
          initialDescription={tableEditModal.description}
          onSave={handleSaveTable}
        />

        <SourceEditModal
          isOpen={sourceEditModal.isOpen}
          onClose={() => setSourceEditModal(prev => ({ ...prev, isOpen: false }))}
          initialLabel={sourceEditModal.label}
          initialUrl={sourceEditModal.url}
          initialColor={sourceEditModal.color}
          initialDescription={sourceEditModal.description}
          initialSourceType={sourceEditModal.sourceType}
          onSave={handleSaveSource}
          onDelete={() => {
            setNodes(nds => nds.filter(n => n.id !== sourceEditModal.nodeId));
            setSourceEditModal(prev => ({ ...prev, isOpen: false }));
          }}
        />

        <MeasureEditModal
          isOpen={measureEditModal.isOpen}
          onClose={() => setMeasureEditModal(prev => ({ ...prev, isOpen: false }))}
          initialLabel={measureEditModal.label}
          initialColor={measureEditModal.color}
          initialDescription={measureEditModal.description}
          onSave={handleSaveMeasure}
          onDelete={() => {
            setNodes(nds => nds.filter(n => n.id !== measureEditModal.nodeId));
            setMeasureEditModal(prev => ({ ...prev, isOpen: false }));
          }}
        />

        <NoteEditModal
          isOpen={noteEditModal.isOpen}
          onClose={() => setNoteEditModal(prev => ({ ...prev, isOpen: false }))}
          initialColor={noteEditModal.color}
          initialMarkdown={noteEditModal.markdown}
          onSave={handleSaveNote}
          onDelete={() => {
            setNodes(nds => nds.filter(n => n.id !== noteEditModal.nodeId));
            setNoteEditModal(prev => ({ ...prev, isOpen: false }));
          }}
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