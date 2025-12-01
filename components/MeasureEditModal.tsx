import React, { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CUSTOM_PALETTE } from '../types';

interface MeasureEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLabel: string;
  initialColor?: string;
  initialDescription?: string;
  onSave: (label: string, color: string, description: string) => void;
  onDelete: () => void;
}

export const MeasureEditModal: React.FC<MeasureEditModalProps> = ({ isOpen, onClose, initialLabel, initialColor, initialDescription, onSave, onDelete }) => {
  const [label, setLabel] = useState(initialLabel);
  const [color, setColor] = useState(initialColor || CUSTOM_PALETTE[2]); // Default to Measure color
  const [description, setDescription] = useState(initialDescription || '');

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setColor(initialColor || CUSTOM_PALETTE[2]);
      setDescription(initialDescription || '');
    }
  }, [isOpen, initialLabel, initialColor, initialDescription]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate inputs
    if (label.trim() === '') {
      alert('Measure name cannot be empty.');
      return;
    }
    if (description.length > 500) {
      alert('Description must be 500 characters or less.');
      return;
    }
    onSave(label, color, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-5">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-700">Edit Measure</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Name Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Measure Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter measure name..."
            />
          </div>

          {/* Color Section */}
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

          {/* Description Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter measure description..."
              rows={3}
            />
            <p className="text-[10px] text-slate-400 mt-1">{description.length}/500 characters</p>
          </div>
        </div>

        <div className="flex gap-2 pt-6 border-t border-slate-200 mt-6 sticky bottom-0 bg-white">
          <button
            onClick={() => {
              const confirmed = window.confirm("Are you sure you want to delete this measure?");
              if(confirmed) onDelete();
            }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Save Measure
          </button>
        </div>
      </div>
    </div>
  );
};