import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  itemNames: string[];
  onConfirmDelete: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  count,
  itemNames,
  onConfirmDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-sm w-full p-5 text-xs text-slate-200 select-none flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-rose-400">
            <Trash2 className="w-4 h-4" />
            <h3 className="font-semibold text-white">Confirm Deletion</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-medium text-rose-200">
              {count > 1 ? `Permanently delete ${count} selected items?` : `Permanently delete this item?`}
            </p>
            <p className="text-[11px] text-rose-300/80 mt-1">
              This action will remove the object from the cloud storage bucket and purge all corresponding metadata from the PostgreSQL database catalog.
            </p>
          </div>
        </div>

        {itemNames.length > 0 && (
          <div className="max-h-24 overflow-y-auto border border-slate-800 rounded p-2 bg-slate-950/50 flex flex-col gap-1 text-[11px] font-mono text-slate-300">
            {itemNames.slice(0, 5).map((name, i) => (
              <div key={i} className="truncate">• {name}</div>
            ))}
            {itemNames.length > 5 && (
              <div className="text-slate-500 italic">...and {itemNames.length - 5} more</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded transition-colors"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};
