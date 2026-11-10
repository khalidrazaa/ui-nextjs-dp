import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { FolderItem } from '../../types';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolder: FolderItem;
  onCreateFolder: (name: string) => void;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  currentFolder,
  onCreateFolder
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!sanitized) {
      setError('Folder name cannot be empty');
      return;
    }
    onCreateFolder(sanitized);
    setFolderName('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-sm w-full max-h-[92vh] overflow-y-auto p-5 text-xs text-slate-200 select-none flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-white">Create New Folder</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Folder Name</label>
            <input
              type="text"
              autoFocus
              placeholder="e.g., telemetry_raw_2026"
              value={folderName}
              onChange={(e) => { setFolderName(e.target.value); setError(null); }}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
            {error && <span className="text-red-400 text-[10px]">{error}</span>}
            <span className="text-slate-500 text-[10px]">Will be created in {currentFolder.path}</span>
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
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded transition-colors"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
