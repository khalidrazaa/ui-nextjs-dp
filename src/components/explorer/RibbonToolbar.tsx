import React, { useState } from 'react';
import { 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Upload, 
  Share2, 
  Copy, 
  Scissors, 
  Clipboard, 
  LayoutList, 
  LayoutGrid, 
  Grid3X3, 
  Columns, 
  ArrowUpDown, 
  PanelRightOpen, 
  PanelRightClose,
  ChevronDown
} from 'lucide-react';
import { ViewMode, SortField, SortDirection } from '../../types';

interface RibbonToolbarProps {
  selectedCount: number;
  onOpenNewFolder: () => void;
  onOpenUpload: () => void;
  onDeleteSelected: () => void;
  onRenameSelected: () => void;
  onCopySelectedLink: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortDirection: SortDirection;
  setSortDirection: (dir: SortDirection) => void;
  showPreviewPane: boolean;
  setShowPreviewPane: (val: boolean) => void;
}

export const RibbonToolbar: React.FC<RibbonToolbarProps> = ({
  selectedCount,
  onOpenNewFolder,
  onOpenUpload,
  onDeleteSelected,
  onRenameSelected,
  onCopySelectedLink,
  viewMode,
  setViewMode,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  showPreviewPane,
  setShowPreviewPane
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-2 sm:px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 select-none overflow-x-auto scrollbar-none gap-2">
      {/* Primary Actions Group */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* New Folder */}
        <button
          onClick={onOpenNewFolder}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 transition-colors shrink-0"
          title="Create New Folder"
        >
          <FolderPlus className="w-4 h-4 text-amber-400" />
          <span className="font-medium hidden xs:inline">New folder</span>
        </button>

        {/* Upload File */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 transition-colors"
          title="Upload File"
        >
          <Upload className="w-4 h-4 text-sky-400" />
          <span className="font-medium">Upload</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Clipboard Actions */}
        <button
          disabled={selectedCount === 0}
          className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300"
          title="Cut"
          aria-label="Cut"
        >
          <Scissors className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={selectedCount === 0}
          className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300"
          title="Copy"
          aria-label="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          disabled
          className="p-1.5 rounded text-slate-600 cursor-not-allowed"
          title="Paste"
          aria-label="Paste"
        >
          <Clipboard className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Rename */}
        <button
          onClick={onRenameSelected}
          disabled={selectedCount !== 1}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 transition-colors"
          title="Rename (F2)"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Rename</span>
        </button>

        {/* Copy Cloud Link */}
        <button
          onClick={onCopySelectedLink}
          disabled={selectedCount !== 1}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent text-slate-300 transition-colors"
          title="Copy Cloud Storage URL"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Share Link</span>
        </button>

        {/* Delete / Bulk Delete */}
        <button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-red-950/60 hover:text-red-300 text-slate-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:text-slate-500 transition-colors"
          title={selectedCount > 1 ? `Delete ${selectedCount} selected items` : "Delete selected item"}
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          <span>Delete{selectedCount > 1 ? ` (${selectedCount})` : ''}</span>
        </button>
      </div>

      {/* View & Sort Group */}
      <div className="flex items-center gap-2">
        {/* Sort Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl py-1 z-30 text-xs">
              <div className="px-3 py-1 font-semibold text-slate-400 text-[11px]">SORT BY</div>
              {(['name', 'modifiedAt', 'fileType', 'sizeBytes', 'storageDestination'] as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => {
                    if (sortField === field) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field);
                      setSortDirection('asc');
                    }
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 ${
                    sortField === field ? 'text-sky-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                  }`}
                >
                  <span className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                  {sortField === field && (
                    <span className="text-[10px] text-slate-400">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Modes */}
        <div className="relative">
          <button
            onClick={() => setShowViewMenu(!showViewMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
          >
            {viewMode === 'details' && <LayoutList className="w-3.5 h-3.5 text-sky-400" />}
            {viewMode === 'large_icons' && <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />}
            {viewMode === 'medium_icons' && <Grid3X3 className="w-3.5 h-3.5 text-sky-400" />}
            {viewMode === 'tiles' && <Columns className="w-3.5 h-3.5 text-sky-400" />}
            <span className="capitalize">{viewMode.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showViewMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl py-1 z-30 text-xs">
              <button
                onClick={() => { setViewMode('details'); setShowViewMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 ${viewMode === 'details' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Details / List</span>
              </button>
              <button
                onClick={() => { setViewMode('large_icons'); setShowViewMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 ${viewMode === 'large_icons' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Large Icons</span>
              </button>
              <button
                onClick={() => { setViewMode('medium_icons'); setShowViewMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 ${viewMode === 'medium_icons' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Medium Icons</span>
              </button>
              <button
                onClick={() => { setViewMode('tiles'); setShowViewMenu(false); }}
                className={`w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 ${viewMode === 'tiles' ? 'text-sky-400 font-semibold' : 'text-slate-300'}`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Tiles</span>
              </button>
            </div>
          )}
        </div>

        {/* Toggle Details/Preview Pane */}
        <button
          onClick={() => setShowPreviewPane(!showPreviewPane)}
          className={`p-1.5 rounded transition-colors ${
            showPreviewPane ? 'bg-sky-500/20 text-sky-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title={showPreviewPane ? "Hide Details Pane" : "Show Details Pane"}
          aria-label={showPreviewPane ? "Hide Details Pane" : "Show Details Pane"}
        >
          {showPreviewPane ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
