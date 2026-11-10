import React, { useState } from 'react';
import { X, Edit3 } from 'lucide-react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: { id: string; name: string; isFolder: boolean } | null;
  onConfirmRename: (id: string, newName: string, isFolder: boolean) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  onConfirmRename
}) => {
  const [newName, setNewName] = useState(targetItem?.name || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = newName.trim();
    if (!sanitized) {
      setError('Name cannot be empty');
      return;
    }
    onConfirmRename(targetItem.id, sanitized, targetItem.isFolder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-sm w-full p-5 text-xs text-slate-200 select-none flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white">
              Rename {targetItem.isFolder ? 'Folder' : 'File'}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">New Name</label>
            <input
              type="text"
              autoFocus
              defaultValue={targetItem.name}
              onChange={(e) => { setNewName(e.target.value); setError(null); }}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
            {error && <span className="text-red-400 text-[10px]">{error}</span>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded transition-colors"
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
