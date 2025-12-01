import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CUSTOM_PALETTE } from '../types';

interface SourceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLabel: string;
  initialUrl?: string;
  initialColor?: string;
  initialDescription?: string;
  initialSourceType?: string;
  onSave: (label: string, url: string, color: string, description: string, sourceType: string) => void;
  onDelete: () => void;
}

const SourceEditModal: React.FC<SourceEditModalProps> = ({
  isOpen,
  onClose,
  initialLabel,
  initialUrl = '',
  initialColor,
  initialDescription = '',
  initialSourceType = '',
  onSave,
  onDelete,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [url, setUrl] = useState(initialUrl);
  const [color, setColor] = useState(initialColor || CUSTOM_PALETTE[0]);
  const [description, setDescription] = useState(initialDescription);
  const [sourceType, setSourceType] = useState(initialSourceType);

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setUrl(initialUrl);
      setColor(initialColor || CUSTOM_PALETTE[0]);
      setDescription(initialDescription);
      setSourceType(initialSourceType);
    }
  }, [isOpen, initialLabel, initialUrl, initialColor, initialDescription, initialSourceType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-96 p-5 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-700">Edit Data Source</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Link</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter URL..."
            />
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

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter description..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data Source Type</label>
            <input
              type="text"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Database, API, File..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                const confirmed = window.confirm("Are you sure you want to delete this item?");
                if (confirmed) onDelete();
              }}
              className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={() => onSave(label, url, color, description, sourceType)}
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

export { SourceEditModal };