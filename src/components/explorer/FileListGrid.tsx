import React, { useState } from 'react';
import { 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  FileImage, 
  File, 
  CheckSquare, 
  Square, 
  HardDrive, 
  Database, 
  Cloud, 
  Globe, 
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { FileMetadata, FolderItem, ViewMode, CloudProvider } from '../../types';

interface FileListGridProps {
  currentFolder: FolderItem;
  folders: FolderItem[];
  files: FileMetadata[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string, isMulti: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onOpenFolder: (folderId: string) => void;
  onOpenFileDetails: (file: FileMetadata) => void;
  onIngestFileToBigQuery: (file: FileMetadata) => void;
  onProfileFileWithPandas: (file: FileMetadata) => void;
  onRenameItem: (item: { id: string; name: string; isFolder: boolean }) => void;
  onDeleteItem: (id: string, isFolder: boolean) => void;
  onFilesDropped: (files: FileList) => void;
  viewMode: ViewMode;
}

export const FileListGrid: React.FC<FileListGridProps> = ({
  currentFolder,
  folders,
  files,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onOpenFolder,
  onOpenFileDetails,
  onIngestFileToBigQuery,
  onProfileFileWithPandas,
  onRenameItem,
  onDeleteItem,
  onFilesDropped,
  viewMode
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    file?: FileMetadata;
    folder?: FolderItem;
  } | null>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesDropped(e.dataTransfer.files);
    }
  };

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, item: { file?: FileMetadata; folder?: FolderItem }) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 260),
      file: item.file,
      folder: item.folder
    });
  };

  const closeContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  // Icon helper
  const renderFileIcon = (file: FileMetadata, sizeClass = "w-6 h-6") => {
    switch (file.fileType) {
      case 'excel':
        return <FileSpreadsheet className={`${sizeClass} text-emerald-400`} />;
      case 'csv':
        return <FileSpreadsheet className={`${sizeClass} text-teal-400`} />;
      case 'pdf':
        return <FileText className={`${sizeClass} text-rose-400`} />;
      case 'word':
        return <FileText className={`${sizeClass} text-sky-400`} />;
      case 'image':
        return <FileImage className={`${sizeClass} text-violet-400`} />;
      default:
        return <File className={`${sizeClass} text-slate-400`} />;
    }
  };

  const renderCloudBadge = (provider: CloudProvider) => {
    switch (provider) {
      case 's3':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
            <HardDrive className="w-3 h-3 text-amber-400" /> S3
          </span>
        );
      case 'blob':
        return (
          <span className="flex items-center gap-1 text-[10px] text-sky-400 font-medium">
            <Database className="w-3 h-3 text-sky-400" /> Blob
          </span>
        );
      case 'gcs':
        return (
          <span className="flex items-center gap-1 text-[10px] text-blue-400 font-medium">
            <Cloud className="w-3 h-3 text-blue-400" /> GCS
          </span>
        );
      case 'r2':
        return (
          <span className="flex items-center gap-1 text-[10px] text-orange-400 font-medium">
            <Globe className="w-3 h-3 text-orange-400" /> R2
          </span>
        );
    }
  };

  const totalItemsCount = folders.length + files.length;
  const isAllSelected = totalItemsCount > 0 && selectedIds.size === totalItemsCount;

  return (
    <div 
      onClick={closeContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 relative flex flex-col h-full overflow-hidden bg-slate-950/40 select-none"
    >
      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-sky-600/20 backdrop-blur-sm border-2 border-dashed border-sky-400 z-50 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/30 flex items-center justify-center text-sky-300 animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-white">Drop files to upload into {currentFolder.name}</p>
            <p className="text-xs text-sky-200 mt-1">Accepts CSV, Excel (.xlsx, .xls), PDF, Word (.docx), and Images</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {totalItemsCount === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3 border border-dashed border-slate-800 rounded-xl p-8">
            <Folder className="w-12 h-12 text-slate-600 stroke-[1.5]" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-300">This folder is empty</p>
              <p className="text-xs text-slate-500 mt-1">Drag and drop files here or click "Upload" in the toolbar.</p>
            </div>
          </div>
        ) : (
          <>
            {/* VIEW MODE: DETAILS / TABLE */}
            {viewMode === 'details' && (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium">
                      <th className="py-2 px-3 w-8">
                        <button 
                          onClick={(e) => { e.stopPropagation(); isAllSelected ? onClearSelection() : onSelectAll(); }}
                          className="text-slate-500 hover:text-white"
                          title={isAllSelected ? "Deselect All" : "Select All"}
                        >
                          {isAllSelected ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Date modified</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Size</th>
                      <th className="py-2 px-3">Cloud Storage</th>
                      <th className="py-2 px-3">BigQuery Target</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Folders first */}
                    {folders.map(folder => {
                      const isSelected = selectedIds.has(folder.id);
                      return (
                        <tr
                          key={folder.id}
                          onClick={(e) => onToggleSelect(folder.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                          onDoubleClick={() => onOpenFolder(folder.id)}
                          onContextMenu={(e) => handleContextMenu(e, { folder })}
                          className={`border-b border-slate-900/60 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-sky-500/15 text-sky-200' : 'hover:bg-slate-800/50 text-slate-200'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleSelect(folder.id, true); }}
                              className="text-slate-500 group-hover:text-slate-300"
                            >
                              {isSelected ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-medium flex items-center gap-2">
                            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="truncate max-w-xs">{folder.name}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-400 tabular-nums">
                            {new Date(folder.createdAt).toLocaleDateString()} {new Date(folder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 px-3 text-slate-400">File folder</td>
                          <td className="py-2 px-3 text-right text-slate-500 tabular-nums">—</td>
                          <td className="py-2 px-3">
                            {folder.storageDestination ? renderCloudBadge(folder.storageDestination) : <span className="text-slate-600">—</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-500">—</td>
                          <td className="py-2 px-3 text-slate-500">—</td>
                        </tr>
                      );
                    })}

                    {/* Files */}
                    {files.map(file => {
                      const isSelected = selectedIds.has(file.id);
                      return (
                        <tr
                          key={file.id}
                          onClick={(e) => {
                            onToggleSelect(file.id, e.ctrlKey || e.metaKey || e.shiftKey);
                            onOpenFileDetails(file);
                          }}
                          onDoubleClick={() => onOpenFileDetails(file)}
                          onContextMenu={(e) => handleContextMenu(e, { file })}
                          className={`border-b border-slate-900/60 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-sky-500/15 text-sky-200' : 'hover:bg-slate-800/50 text-slate-200'
                          }`}
                        >
                          <td className="py-2 px-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id, true); }}
                              className="text-slate-500 group-hover:text-slate-300"
                            >
                              {isSelected ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-medium flex items-center gap-2">
                            {renderFileIcon(file, "w-4 h-4")}
                            <span className="truncate max-w-xs">{file.name}</span>
                          </td>
                          <td className="py-2 px-3 text-slate-400 tabular-nums">
                            {new Date(file.modifiedAt).toLocaleDateString()} {new Date(file.modifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 px-3 text-slate-400 uppercase">{file.extension} Document</td>
                          <td className="py-2 px-3 text-right text-slate-300 font-mono tabular-nums">{file.sizeFormatted}</td>
                          <td className="py-2 px-3">
                            {renderCloudBadge(file.storageDestination)}
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-mono text-[11px]">
                            {file.targetBigQueryTable}
                          </td>
                          <td className="py-2 px-3">
                            {file.ingestionStatus === 'ingested' ? (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ingested
                              </span>
                            ) : file.ingestionStatus === 'validating' ? (
                              <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                <Clock className="w-3.5 h-3.5 animate-spin" /> Validating
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <Clock className="w-3.5 h-3.5" /> Staged
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* VIEW MODE: LARGE ICONS */}
            {viewMode === 'large_icons' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {/* Folders */}
                {folders.map(folder => {
                  const isSelected = selectedIds.has(folder.id);
                  return (
                    <div
                      key={folder.id}
                      onClick={(e) => onToggleSelect(folder.id, e.ctrlKey || e.metaKey || e.shiftKey)}
                      onDoubleClick={() => onOpenFolder(folder.id)}
                      onContextMenu={(e) => handleContextMenu(e, { folder })}
                      className={`relative flex flex-col items-center text-center p-3 rounded-lg border transition-all cursor-pointer group ${
                        isSelected 
                          ? 'bg-sky-500/15 border-sky-500/60 text-sky-200' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(folder.id, true); }}
                        className="absolute top-2 left-2 text-slate-500 group-hover:text-slate-300"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                      </button>

                      <Folder className="w-12 h-12 text-amber-400 my-2" />
                      <span className="text-xs font-medium truncate w-full px-1" title={folder.name}>
                        {folder.name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">Folder</span>
                    </div>
                  );
                })}

                {/* Files */}
                {files.map(file => {
                  const isSelected = selectedIds.has(file.id);
                  return (
                    <div
                      key={file.id}
                      onClick={(e) => {
                        onToggleSelect(file.id, e.ctrlKey || e.metaKey || e.shiftKey);
                        onOpenFileDetails(file);
                      }}
                      onDoubleClick={() => onOpenFileDetails(file)}
                      onContextMenu={(e) => handleContextMenu(e, { file })}
                      className={`relative flex flex-col items-center text-center p-3 rounded-lg border transition-all cursor-pointer group ${
                        isSelected 
                          ? 'bg-sky-500/15 border-sky-500/60 text-sky-200' 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id, true); }}
                        className="absolute top-2 left-2 text-slate-500 group-hover:text-slate-300"
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4 opacity-0 group-hover:opacity-100" />}
                      </button>

                      <div className="my-2 relative">
                        {renderFileIcon(file, "w-12 h-12")}
                        <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded bg-slate-950 text-[9px] uppercase font-mono border border-slate-700">
                          {file.extension}
                        </span>
                      </div>

                      <span className="text-xs font-medium truncate w-full px-1" title={file.name}>
                        {file.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                        <span>{file.sizeFormatted}</span>
                        <span>·</span>
                        {renderCloudBadge(file.storageDestination)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE: MEDIUM ICONS */}
            {viewMode === 'medium_icons' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => onToggleSelect(folder.id, false)}
                    onDoubleClick={() => onOpenFolder(folder.id)}
                    className={`flex flex-col items-center p-2 rounded border text-center cursor-pointer ${
                      selectedIds.has(folder.id) ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <Folder className="w-8 h-8 text-amber-400 mb-1" />
                    <span className="text-xs truncate w-full">{folder.name}</span>
                  </div>
                ))}
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => { onToggleSelect(file.id, false); onOpenFileDetails(file); }}
                    className={`flex flex-col items-center p-2 rounded border text-center cursor-pointer ${
                      selectedIds.has(file.id) ? 'bg-sky-500/20 border-sky-500 text-sky-200' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="mb-1">{renderFileIcon(file, "w-8 h-8")}</div>
                    <span className="text-xs truncate w-full">{file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW MODE: TILES */}
            {viewMode === 'tiles' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => onToggleSelect(folder.id, false)}
                    onDoubleClick={() => onOpenFolder(folder.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <Folder className="w-8 h-8 text-amber-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-medium text-slate-200 truncate">{folder.name}</div>
                      <div className="text-[10px] text-slate-500">Folder</div>
                    </div>
                  </div>
                ))}
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => { onToggleSelect(file.id, false); onOpenFileDetails(file); }}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <div className="shrink-0">{renderFileIcon(file, "w-8 h-8")}</div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-medium text-slate-200 truncate">{file.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{file.sizeFormatted}</span>
                        <span>·</span>
                        {renderCloudBadge(file.storageDestination)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Context Menu Dropdown */}
      {contextMenu && contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed w-52 bg-slate-900 border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-xs text-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.file && (
            <>
              <button
                onClick={() => { onOpenFileDetails(contextMenu.file!); closeContextMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Inspect Properties</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => { onIngestFileToBigQuery(contextMenu.file!); closeContextMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-sky-400 font-medium flex items-center gap-2"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Ingest to BigQuery</span>
              </button>

              {['csv', 'excel'].includes(contextMenu.file.fileType) && (
                <button
                  onClick={() => { onProfileFileWithPandas(contextMenu.file!); closeContextMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-emerald-400 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Profile with Pandas</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(contextMenu.file!.cloudStorageUri);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300"
              >
                Copy Cloud URI ({contextMenu.file.storageDestination.toUpperCase()})
              </button>

              <div className="h-px bg-slate-800 my-1" />

              <button
                onClick={() => {
                  onRenameItem({ id: contextMenu.file!.id, name: contextMenu.file!.name, isFolder: false });
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300"
              >
                Rename
              </button>

              <button
                onClick={() => {
                  onDeleteItem(contextMenu.file!.id, false);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-400"
              >
                Delete
              </button>
            </>
          )}

          {contextMenu.folder && (
            <>
              <button
                onClick={() => { onOpenFolder(contextMenu.folder!.id); closeContextMenu(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
              >
                Open Folder
              </button>
              <button
                onClick={() => {
                  onRenameItem({ id: contextMenu.folder!.id, name: contextMenu.folder!.name, isFolder: true });
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  onDeleteItem(contextMenu.folder!.id, true);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-red-950/60 text-red-400"
              >
                Delete Folder
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
