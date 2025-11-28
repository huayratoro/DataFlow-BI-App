# DataFlow BI - Visual Data Pipeline Designer

A modern, interactive visual diagram editor for designing data pipelines and analytics workflows. Build complex data transformations and analysis flows with an intuitive drag-and-drop interface.

## 🎯 Overview

DataFlow BI is a web-based application that enables users to visually design data pipelines by connecting different types of nodes (Data Sources, Tables, and Measures) on an interactive canvas. Save multiple projects locally and export your diagrams as high-quality PNG images.

## ✨ Key Features

### 📊 Visual Node System
- **Data Source Nodes**: Represent data origins (databases, APIs, files)
- **Table Nodes**: Transform and process data flows
- **Measure Nodes**: Define calculations and aggregations
- Color-coded nodes for easy identification with customizable colors

### 🔌 Connection Management
- **Smart Edge Connections**: Connect nodes to create data flow pipelines
- **Custom Edge Styling**: Edit edge labels and colors with double-click
- **Animated Edges**: Visual feedback showing active data flows
- **Flexible Routing**: Smooth edge paths with automatic routing

### 💾 Project Management
- **Multi-Project Support**: Create and manage multiple projects
- **Auto-Save**: Projects automatically save every 2 seconds
- **Project Renaming**: Double-click project names to rename them instantly
- **Delete Projects**: Remove projects with a single click
- **IndexedDB Persistence**: All data saved locally in your browser (no server required)

### ✏️ Interactive Editing
- **Double-Click Node Editing**: Customize node labels and colors
- **Double-Click Edge Editing**: Add labels and customize edge colors
- **Modal Editor**: Clean, focused editing interface with 10-color palette
- **Delete Items**: Remove nodes and edges with confirmation

### 🎨 Customization
- **10-Color Palette**: 
  - Default colors: Gray (Sources), Blue (Tables), Green (Measures)
  - 7 accent colors: Rose, Orange, Yellow, Teal, Cyan, Indigo, Purple
- **Custom Node Names**: Label each node with meaningful names
- **Color-Coded Flows**: Visual distinction of different pipeline sections

### 🖼️ Export & Visualization
- **Export to PNG**: Download your diagram as a high-resolution PNG image
- **MiniMap Navigation**: Overview of entire pipeline with quick navigation
- **Zoom & Pan**: Smooth navigation of large diagrams
- **Auto-Fit**: Automatically fit the entire diagram in view

### 📱 Responsive Design
- **Desktop Optimized**: Full-featured experience on desktop screens
- **Mobile Responsive**: Collapsible sidebar for mobile and tablet devices
- **Touch-Friendly**: Intuitive interactions work on touch devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dataflow-bi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📖 User Guide

### Creating Your First Project

1. **Open the application** - A new project is automatically created
2. **Name your project** - Click on the project name to rename it
3. **Access the Toolbox** - Find draggable node types on the left sidebar:
   - Data Source (Database icon)
   - Table (Grid icon)
   - Measure (Calculator icon)

### Building Your Pipeline

1. **Add Nodes**
   - Drag and drop node types from the Toolbox onto the canvas
   - Each node appears with a default name (e.g., "New source")

2. **Connect Nodes**
   - Click and drag from a node's right handle to another node's left handle
   - Release to create a connection

3. **Customize Nodes**
   - Double-click any node to open the editor
   - Change the node label/name
   - Select a color from the 10-color palette
   - Click "Save Changes" or press Enter
   - Delete node with the "Delete" button

### Editing Connections

1. **Customize Edge Labels**
   - Double-click any connection line to edit
   - Add a descriptive label (e.g., "Customer Data", "Aggregated Sales")
   - Leave empty for arrow-only connection

2. **Change Edge Colors**
   - Open edge editor with double-click
   - Select color to match your pipeline section
   - Save or delete the connection

### Project Management

1. **Switch Projects**
   - Click on any project name in the sidebar to load it
   - Active project is highlighted with light background

2. **Rename Project**
   - Double-click on the project name
   - Edit the name and press Enter or click elsewhere
   - Press Escape to cancel editing

3. **Create New Project**
   - Click the "+" button next to "Projects" in the sidebar
   - New project is created with current date as name

4. **Delete Project**
   - Hover over a project name
   - Click the trash icon that appears
   - Project is permanently removed

### Exporting Your Diagram

1. **Export as PNG**
   - Click the download icon in the top toolbar
   - Image is automatically downloaded as `dataflow-diagram.png`
   - High-quality PNG with light background

2. **Use the MiniMap**
   - Located in the bottom-right corner
   - Shows overview of entire diagram
   - Click to jump to different areas

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Double-Click** | Edit node/edge properties |
| **Enter** | Save changes in edit mode |
| **Escape** | Cancel editing |
| **Delete/Backspace** | Remove selected node/edge |
| **Mouse Wheel** | Zoom in/out |
| **Drag Canvas** | Pan around the diagram |

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: React 19.2 with TypeScript
- **Graph Visualization**: React Flow (@xyflow/react)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Persistence**: IndexedDB
- **Build Tool**: Vite 6.2
- **Icons**: Lucide React
- **Export**: html-to-image

### Project Structure
```
src/
├── App.tsx                 # Main application component & flow logic
├── types.ts               # TypeScript interfaces & enums
├── index.tsx              # React entry point
├── components/
│   ├── Sidebar.tsx        # Project management & toolbox
│   ├── CustomNodes.tsx    # Node type components
│   └── CustomEdge.tsx     # Edge rendering component
└── services/
    └── db.ts              # IndexedDB wrapper & persistence layer
```

### Data Flow
```
User Action (drag/drop/double-click)
    ↓
React State Update (nodes/edges)
    ↓
Canvas Render
    ↓
Auto-save (2-second debounce)
    ↓
IndexedDB Persistence
```

## 🎮 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Configuration

**Environment Variables** (if needed):
- Create a `.env.local` file in the project root
- Add `GEMINI_API_KEY` for AI integration (optional)

**Vite Config**: All configuration is in `vite.config.ts`

## 📊 Database

DataFlow BI uses **IndexedDB** for local persistence:
- **Database Name**: DataFlowBI_DB
- **Store Name**: projects
- **No server sync**: All data remains on your device
- **No migrations**: Schema is automatically initialized

### Data Structure
```typescript
Project {
  id: string;                    // UUID
  name: string;                  // Project name
  createdAt: number;            // Unix timestamp
  updatedAt: number;            // Unix timestamp
  nodes: Node[];                // Array of node objects
  edges: Edge[];                // Array of connection objects
}
```

## 🎨 Customization Guide

### Adding New Node Types

1. Add enum value in `types.ts`:
   ```typescript
   enum NodeType { SOURCE = 'source', TABLE = 'table', MEASURE = 'measure' }
   ```

2. Create component in `components/CustomNodes.tsx`

3. Register in `nodeTypes` export

### Modifying Color Palette

Edit the `CUSTOM_PALETTE` array in `types.ts`:
```typescript
export const CUSTOM_PALETTE = [
  '#32556e', // Blue
  '#4e9d2d', // Green
  // ... add your colors
];
```

## 🐛 Troubleshooting

### Projects Not Saving
- Check browser's IndexedDB is enabled
- Clear browser cache and try again
- Ensure you have sufficient storage space

### Export to PNG Not Working
- Verify your browser allows downloads
- Check popup/download settings
- Try a different browser

### Nodes Not Connecting
- Ensure you're dragging from right handle to left handle
- Check that target node isn't already connected to source

## 📝 License

[Add your license information here]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, feature requests, or questions, please open an issue in the repository.

---

**Happy Pipeline Building! 🚀**
