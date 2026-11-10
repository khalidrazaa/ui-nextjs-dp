import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  RotateCw, 
  Search, 
  Copy, 
  Check, 
  Minus, 
  Square, 
  X,
  HardDrive
} from 'lucide-react';
import { FolderItem } from '../../types';

interface WindowsTitleBarProps {
  currentFolder: FolderItem;
  breadcrumbs: FolderItem[];
  onNavigateToFolder: (folderId: string) => void;
  onNavigateUp: () => void;
  canNavigateUp: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isMaximized: boolean;
  setIsMaximized: (val: boolean) => void;
  onRefresh: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  currentFolder,
  breadcrumbs,
  onNavigateToFolder,
  onNavigateUp,
  canNavigateUp,
  searchQuery,
  setSearchQuery,
  isMaximized,
  setIsMaximized,
  onRefresh
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentFolder.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 px-3 py-2 select-none flex flex-col gap-2">
      {/* Top Window Strip */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-200">File Explorer</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 truncate max-w-sm">OmniStore Multi-Cloud Data Lake</span>
        </div>

        {/* Windows Window Controls */}
        <div className="flex items-center gap-1">
          <button 
            className="w-7 h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Minimize"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-7 h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isMaximized ? "Restore Down" : "Maximize"}
            aria-label={isMaximized ? "Restore Down" : "Maximize"}
          >
            <Square className="w-3 h-3" />
          </button>
          <button 
            className="w-7 h-6 flex items-center justify-center rounded hover:bg-red-600/80 text-slate-400 hover:text-white transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Navigation, Address Bar, Search */}
      <div className="flex items-center gap-2">
        {/* Navigation arrows */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onNavigateUp}
            disabled={!canNavigateUp}
            aria-label="Back"
            className={`p-1.5 rounded transition-colors ${
              canNavigateUp ? 'hover:bg-slate-800 text-slate-300' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            aria-label="Forward"
            className="p-1.5 rounded text-slate-600 cursor-not-allowed"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateUp}
            disabled={!canNavigateUp}
            aria-label="Up to parent folder"
            className={`p-1.5 rounded transition-colors ${
              canNavigateUp ? 'hover:bg-slate-800 text-slate-300' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Up to parent folder"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            aria-label="Refresh view"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center justify-between bg-slate-950/80 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-slate-200">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <button
              onClick={() => onNavigateToFolder('root')}
              className="text-slate-400 hover:text-sky-400 transition-colors shrink-0"
            >
              This PC
            </button>
            <span className="text-slate-600">/</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <button
                  onClick={() => onNavigateToFolder(crumb.id)}
                  className={`hover:text-sky-400 transition-colors shrink-0 ${
                    idx === breadcrumbs.length - 1 ? 'font-semibold text-sky-300' : 'text-slate-400'
                  }`}
                >
                  {crumb.name}
                </button>
                {idx < breadcrumbs.length - 1 && <span className="text-slate-600">/</span>}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={handleCopyPath}
            title="Copy path"
            aria-label="Copy path"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 shrink-0 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-64 relative shrink-0">
          <input
            type="text"
            placeholder={`Search ${currentFolder.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
