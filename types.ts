import { Edge, Node } from '@xyflow/react';

export enum NodeType {
  SOURCE = 'source',
  TABLE = 'table',
  MEASURE = 'measure',
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  nodes: Node[];
  edges: Edge[];
}

export interface TableColumn {
  id: string;
  name: string;
}

export interface TableData {
  columns: TableColumn[];
}

export interface NodeData {
  label: string;
  description?: string;
  color?: string; // New field for custom color
  highlighted?: boolean; // For dependency highlighting
  tableData?: TableData; // For Table nodes
  url?: string; // For Source nodes
  sourceType?: string; // For Source nodes
  [key: string]: unknown;
}

export type AppNode = Node<NodeData>;

// Default Type Colors
export const COLORS = {
  BLUE: '#32556e',   // Tables
  GREEN: '#4e9d2d',  // Measures
  GRAY: '#5c6670',   // Sources
  BG_LIGHT: '#f9fafb',
  BG_DARK: '#1f2937',
};

// New Custom Palette (10 High Contrast / Pastel-ish colors)
export const CUSTOM_PALETTE = [
  '#32556e', // Original Blue
  '#4e9d2d', // Original Green
  '#5c6670', // Original Gray
  '#e11d48', // Rose Red
  '#ea580c', // Burnt Orange
  '#eab308', // Golden Yellow
  '#0d9488', // Teal
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#9333ea', // Purple
];