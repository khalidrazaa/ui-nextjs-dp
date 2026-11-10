import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  HardDrive, 
  Cloud, 
  Database, 
  Layers, 
  Star, 
  Globe,
  X
} from 'lucide-react';
import { FolderItem, CloudProvider } from '../../types';
import { CLOUD_PROVIDERS_CONFIG } from '../../mock/sampleData';

interface NavigationTreeProps {
  folders: FolderItem[];
  currentFolderId: string;
  onSelectFolder: (folderId: string) => void;
  onSelectCloudTarget: (provider: CloudProvider) => void;
  onJumpToPostgres: () => void;
  onJumpToBigQuery: () => void;
  onCloseMobile?: () => void;
}

export const NavigationTree: React.FC<NavigationTreeProps> = ({
  folders,
  currentFolderId,
  onSelectFolder,
  onSelectCloudTarget,
  onJumpToPostgres,
  onJumpToBigQuery,
  onCloseMobile
}) => {
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set(['root', 'folder_datasets']));
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(true);
  const [isCloudDrivesOpen, setIsCloudDrivesOpen] = useState(true);

  const toggleExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const rootFolders = folders.filter(f => f.parentId === 'root' || f.id === 'root');

  const renderFolderHierarchy = (parentId: string | null, depth = 0) => {
    const children = folders.filter(f => f.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="flex flex-col">
        {children.map(folder => {
          const isExpanded = expandedFolderIds.has(folder.id);
          const isSelected = currentFolderId === folder.id;
          const hasChildren = folders.some(f => f.parentId === folder.id);

          return (
            <div key={folder.id} className="flex flex-col">
              <div
                onClick={() => handleFolderClick(folder.id)}
                style={{ paddingLeft: `${depth * 14 + 10}px` }}
                className={`flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-pointer transition-colors text-xs group ${
                  isSelected 
                    ? 'bg-sky-500/20 text-sky-200 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                {hasChildren ? (
                  <button
                    onClick={(e) => toggleExpand(folder.id, e)}
                    className="p-0.5 text-slate-500 hover:text-slate-300 rounded"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <span className="w-4.5" />
                )}

                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-400/90 shrink-0" />
                )}

                <span className="truncate">{folder.name}</span>
              </div>

              {hasChildren && isExpanded && renderFolderHierarchy(folder.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  const handleFolderClick = (folderId: string) => {
    onSelectFolder(folderId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/90 md:bg-slate-900/60 p-2 overflow-y-auto flex flex-col gap-4 text-xs select-none shrink-0 h-full">
      {/* Mobile Drawer Header */}
      {onCloseMobile && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 md:hidden">
          <div className="flex items-center gap-2 font-semibold text-white">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <span>Navigation Pane</span>
          </div>
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Access */}
      <div>
        <div 
          onClick={() => setIsQuickAccessOpen(!isQuickAccessOpen)}
          className="flex items-center justify-between text-slate-400 font-semibold px-2 py-1 cursor-pointer hover:text-slate-200"
        >
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider">Quick Access</span>
          </div>
          {isQuickAccessOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </div>

        {isQuickAccessOpen && (
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              onClick={() => handleFolderClick('folder_sales_q1')}
              className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 transition-colors ${
                currentFolderId === 'folder_sales_q1' ? 'bg-sky-500/20 text-sky-200 font-semibold' : 'text-slate-300'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">sales_2026_q1</span>
            </button>
            <button
              onClick={() => handleFolderClick('folder_datasets')}
              className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 transition-colors ${
                currentFolderId === 'folder_datasets' ? 'bg-sky-500/20 text-sky-200 font-semibold' : 'text-slate-300'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">datasets</span>
            </button>
            <button
              onClick={() => handleFolderClick('folder_finance')}
              className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 transition-colors ${
                currentFolderId === 'folder_finance' ? 'bg-sky-500/20 text-sky-200 font-semibold' : 'text-slate-300'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">corporate_finance</span>
            </button>
          </div>
        )}
      </div>

      {/* Cloud Drives (Multi-Cloud Destinations) */}
      <div>
        <div 
          onClick={() => setIsCloudDrivesOpen(!isCloudDrivesOpen)}
          className="flex items-center justify-between text-slate-400 font-semibold px-2 py-1 cursor-pointer hover:text-slate-200"
        >
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] uppercase tracking-wider">Cloud Storage Drives</span>
          </div>
          {isCloudDrivesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </div>

        {isCloudDrivesOpen && (
          <div className="mt-1 flex flex-col gap-0.5">
            <button
              onClick={() => onSelectCloudTarget('s3')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-500" />
              <div className="flex flex-col truncate">
                <span className="font-medium text-slate-200">AWS S3 (S:)</span>
                <span className="text-[10px] text-slate-500 truncate">{CLOUD_PROVIDERS_CONFIG.s3.bucket}</span>
              </div>
            </button>

            <button
              onClick={() => onSelectCloudTarget('blob')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <div className="flex flex-col truncate">
                <span className="font-medium text-slate-200">Azure Blob (B:)</span>
                <span className="text-[10px] text-slate-500 truncate">{CLOUD_PROVIDERS_CONFIG.blob.bucket}</span>
              </div>
            </button>

            <button
              onClick={() => onSelectCloudTarget('gcs')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex flex-col truncate">
                <span className="font-medium text-slate-200">GCP Storage (G:)</span>
                <span className="text-[10px] text-slate-500 truncate">{CLOUD_PROVIDERS_CONFIG.gcs.bucket}</span>
              </div>
            </button>

            <button
              onClick={() => onSelectCloudTarget('r2')}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <div className="flex flex-col truncate">
                <span className="font-medium text-slate-200">Cloudflare R2 (R:)</span>
                <span className="text-[10px] text-slate-500 truncate">{CLOUD_PROVIDERS_CONFIG.r2.bucket}</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Directory Hierarchy Tree */}
      <div>
        <div className="text-slate-400 font-semibold px-2 py-1 text-[11px] uppercase tracking-wider">
          Folders &amp; Datasets
        </div>
        <div className="mt-1">
          <div
            onClick={() => handleFolderClick('root')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors text-xs ${
              currentFolderId === 'root' ? 'bg-sky-500/20 text-sky-200 font-semibold' : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">This PC / Data Lake</span>
          </div>

          <div className="mt-0.5">
            {renderFolderHierarchy('root', 1)}
          </div>
        </div>
      </div>

      {/* Database & Warehouse Jump Links */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-slate-400 font-semibold px-2 py-1 text-[11px] uppercase tracking-wider">
          Catalog &amp; Warehouse
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <button
            onClick={onJumpToPostgres}
            className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>PostgreSQL Catalog</span>
          </button>
          <button
            onClick={onJumpToBigQuery}
            className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>BigQuery Tables</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
