import React, { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CUSTOM_PALETTE } from '../types';

interface NoteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialColor?: string;
  initialMarkdown?: string;
  onSave: (color: string, markdown: string) => void;
  onDelete: () => void;
}

export const NoteEditModal: React.FC<NoteEditModalProps> = ({ 
  isOpen, 
  onClose, 
  initialColor, 
  initialMarkdown, 
  onSave, 
  onDelete 
}) => {
  const [color, setColor] = useState(initialColor || CUSTOM_PALETTE[5]); // Default to Yellow
  const [markdown, setMarkdown] = useState(initialMarkdown || '');

  useEffect(() => {
    if (isOpen) {
      setColor(initialColor || CUSTOM_PALETTE[5]);
      setMarkdown(initialMarkdown || '');
    }
  }, [isOpen, initialColor, initialMarkdown]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate inputs
    if (markdown.length > 5000) {
      alert('Note content must be 5000 characters or less.');
      return;
    }
    onSave(color, markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
          <h3 className="font-bold text-slate-700">Edit Note</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Color Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Background Color</label>
            <div className="grid grid-cols-5 gap-2">
              {CUSTOM_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg border-2 transition-transform hover:scale-110 ${
                    color === c ? 'border-slate-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `${c}80` }} // Show with 50% opacity like the actual note
                  title={c}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Note: Text will always be black for readability
            </p>
          </div>

          {/* Markdown Content Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
              Content (Markdown Supported)
            </label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none font-mono"
              placeholder="Enter note content... Supports Markdown:\n# Heading\n**bold** *italic*\n- List item\n1. Numbered item"
              rows={12}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {markdown.length}/5000 characters • Supports Markdown formatting
            </p>
          </div>

          {/* Markdown Tips */}
          <div className="bg-slate-50 rounded p-3 text-xs text-slate-600">
            <p className="font-semibold mb-1">Quick Markdown Tips:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li><code className="bg-white px-1"># Heading</code> for headers</li>
              <li><code className="bg-white px-1">**bold**</code> and <code className="bg-white px-1">*italic*</code></li>
              <li><code className="bg-white px-1">- item</code> for bullet lists</li>
              <li><code className="bg-white px-1">1. item</code> for numbered lists</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 pt-6 border-t border-slate-200 mt-6 sticky bottom-0 bg-white">
          <button
            onClick={() => {
              const confirmed = window.confirm("Are you sure you want to delete this note?");
              if (confirmed) onDelete();
            }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};
