import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { TableData, TableColumn, TableRow } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TableEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTableData?: TableData;
  onSave: (tableData: TableData) => void;
}

const DEFAULT_TABLE_DATA: TableData = {
  columns: [{ id: uuidv4(), name: 'Column' }],
  rows: [{ id: uuidv4(), name: 'row1' }],
};

export const TableEditModal: React.FC<TableEditModalProps> = ({ isOpen, onClose, initialTableData, onSave }) => {
  const [tableData, setTableData] = useState<TableData>(DEFAULT_TABLE_DATA);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTableData(initialTableData || DEFAULT_TABLE_DATA);
      setEditingColumnId(null);
      setEditingRowId(null);
    }
  }, [isOpen, initialTableData]);

  if (!isOpen) return null;

  const handleAddColumn = () => {
    const newColumn: TableColumn = {
      id: uuidv4(),
      name: `Column ${tableData.columns.length + 1}`,
    };
    setTableData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
    }));
  };

  const handleAddRow = () => {
    const newRow: TableRow = {
      id: uuidv4(),
      name: `row${tableData.rows.length + 1}`,
    };
    setTableData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  const handleDeleteColumn = (columnId: string) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.filter(col => col.id !== columnId),
    }));
  };

  const handleDeleteRow = (rowId: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId),
    }));
  };

  const handleColumnNameChange = (columnId: string, newName: string) => {
    setTableData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, name: newName } : col
      ),
    }));
  };

  const handleRowNameChange = (rowId: string, newName: string) => {
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId ? { ...row, name: newName } : row
      ),
    }));
  };

  const handleSave = () => {
    // Ensure at least one column and one row
    if (tableData.columns.length === 0 || tableData.rows.length === 0) {
      alert('Table must have at least one column and one row.');
      return;
    }
    onSave(tableData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-5">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-700">Edit Table</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Columns Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-slate-700">Columns</h4>
              <button
                onClick={handleAddColumn}
                className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
              >
                <Plus size={14} /> Add Column
              </button>
            </div>
            <div className="space-y-2">
              {tableData.columns.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No columns. Add one to get started.</p>
              ) : (
                tableData.columns.map(column => (
                  <div key={column.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    {editingColumnId === column.id ? (
                      <>
                        <input
                          type="text"
                          value={column.name}
                          onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                          onBlur={() => setEditingColumnId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingColumnId(null);
                            if (e.key === 'Escape') setEditingColumnId(null);
                          }}
                          className="flex-1 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      </>
                    ) : (
                      <>
                        <span
                          onDoubleClick={() => setEditingColumnId(column.id)}
                          className="flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-slate-200 rounded"
                        >
                          {column.name}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteColumn(column.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                      title="Delete column"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Rows Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-slate-700">Rows</h4>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm font-medium"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {tableData.rows.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No rows. Add one to get started.</p>
              ) : (
                tableData.rows.map(row => (
                  <div key={row.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    {editingRowId === row.id ? (
                      <>
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleRowNameChange(row.id, e.target.value)}
                          onBlur={() => setEditingRowId(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingRowId(null);
                            if (e.key === 'Escape') setEditingRowId(null);
                          }}
                          className="flex-1 border border-green-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                          autoFocus
                        />
                      </>
                    ) : (
                      <>
                        <span
                          onDoubleClick={() => setEditingRowId(row.id)}
                          className="flex-1 px-2 py-1 text-sm cursor-pointer hover:bg-slate-200 rounded"
                        >
                          {row.name}
                        </span>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                      title="Delete row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-6 border-t border-slate-200 mt-6 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Save Table
          </button>
        </div>
      </div>
    </div>
  );
};
