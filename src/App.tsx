import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { WindowsTitleBar } from './components/explorer/WindowsTitleBar';
import { RibbonToolbar } from './components/explorer/RibbonToolbar';
import { NavigationTree } from './components/explorer/NavigationTree';
import { FileListGrid } from './components/explorer/FileListGrid';
import { PreviewPane } from './components/explorer/PreviewPane';
import { PostgresCatalogView } from './components/catalog/PostgresCatalogView';
import { BigQueryWarehouseView } from './components/warehouse/BigQueryWarehouseView';
import { PandasAnalyticsView } from './components/analytics/PandasAnalyticsView';
import { FastApiDocsView } from './components/api/FastApiDocsView';
import { UploadModal } from './components/modals/UploadModal';
import { NewFolderModal } from './components/modals/NewFolderModal';
import { RenameModal } from './components/modals/RenameModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { INITIAL_FILES, INITIAL_FOLDERS, CLOUD_PROVIDERS_CONFIG } from './mock/sampleData';
import { FileMetadata, FolderItem, CloudProvider, ViewMode, SortField, SortDirection, BigQueryIngestionJob } from './types';
import { simulateBigQueryIngest } from './utils/bigqueryEngine';
import { parseUploadedFile } from './utils/fileParser';

export default function App() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<'explorer' | 'postgres' | 'bigquery' | 'pandas' | 'fastapi'>('explorer');
  const [selectedCloud, setSelectedCloud] = useState<CloudProvider>('s3');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  // File & Folder Storage State
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [files, setFiles] = useState<FileMetadata[]>(INITIAL_FILES);
  const [currentFolderId, setCurrentFolderId] = useState<string>('folder_sales_q1');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedFileForDetails, setSelectedFileForDetails] = useState<FileMetadata | null>(INITIAL_FILES[0]);
  const [showPreviewPane, setShowPreviewPane] = useState<boolean>(true);

  // Explorer Toolbar Controls
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [sortField, setSortField] = useState<SortField>('modifiedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // BigQuery Ingestion Stream Jobs
  const [ingestionJobs, setIngestionJobs] = useState<BigQueryIngestionJob[]>([
    {
      jobId: 'bq_job_20260310_sales_01',
      fileId: 'file_sales_transactions_csv',
      fileName: 'q1_omnichannel_sales.csv',
      targetTable: 'sales_transactions',
      rowsInserted: 1250,
      status: 'DONE',
      startedAt: '2026-03-10T09:14:30Z',
      completedAt: '2026-03-10T09:15:00Z',
      slotMillis: 412,
      bytesBilledMb: 18.4
    },
    {
      jobId: 'bq_job_20260308_churn_02',
      fileId: 'file_customer_churn_xlsx',
      fileName: 'q1_churn_telemetry_model.xlsx',
      targetTable: 'customer_churn_analytics',
      rowsInserted: 850,
      status: 'DONE',
      startedAt: '2026-03-08T14:20:45Z',
      completedAt: '2026-03-08T14:21:05Z',
      slotMillis: 580,
      bytesBilledMb: 42.1
    }
  ]);

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string; isFolder: boolean } | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    count: number;
    itemNames: string[];
    ids: string[];
    isFolder: boolean;
  }>({
    isOpen: false,
    count: 0,
    itemNames: [],
    ids: [],
    isFolder: false
  });

  // Current folder object
  const currentFolder = useMemo(() => {
    return folders.find(f => f.id === currentFolderId) || folders[0];
  }, [folders, currentFolderId]);

  // Breadcrumbs calculation
  const breadcrumbs = useMemo(() => {
    const list: FolderItem[] = [];
    let cur: FolderItem | undefined = currentFolder;
    while (cur && cur.id !== 'root') {
      list.unshift(cur);
      cur = folders.find(f => f.id === cur?.parentId);
    }
    return list;
  }, [currentFolder, folders]);

  // Filtered and sorted files in current folder
  const currentSubFolders = useMemo(() => {
    let list = folders.filter(f => f.parentId === currentFolderId);
    if (searchQuery.trim()) {
      list = list.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [folders, currentFolderId, searchQuery]);

  const currentFolderFiles = useMemo(() => {
    let list = files.filter(f => f.folderId === currentFolderId);
    if (searchQuery.trim()) {
      list = list.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.extension.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.storageDestination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'modifiedAt') {
        comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      } else if (sortField === 'fileType') {
        comparison = a.fileType.localeCompare(b.fileType);
      } else if (sortField === 'sizeBytes') {
        comparison = a.sizeBytes - b.sizeBytes;
      } else if (sortField === 'storageDestination') {
        comparison = a.storageDestination.localeCompare(b.storageDestination);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [files, currentFolderId, searchQuery, sortField, sortDirection]);

  // Selection handlers
  const handleToggleSelect = (id: string, isMulti: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(isMulti ? prev : []);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set<string>();
    currentSubFolders.forEach(f => allIds.add(f.id));
    currentFolderFiles.forEach(f => allIds.add(f.id));
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Folder navigation
  const handleNavigateUp = () => {
    if (currentFolder.parentId) {
      setCurrentFolderId(currentFolder.parentId);
      setSelectedIds(new Set());
    }
  };

  // Actions
  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedIds(new Set());
    setSearchQuery('');
  };

  const handleOpenFileDetails = (file: FileMetadata) => {
    setSelectedFileForDetails(file);
    if (!showPreviewPane) setShowPreviewPane(true);
  };

  // Create folder
  const handleCreateFolder = (name: string) => {
    const newFolder: FolderItem = {
      id: `folder_${Date.now()}`,
      name,
      parentId: currentFolder.id,
      path: `${currentFolder.path === '/' ? '' : currentFolder.path}/${name}`,
      storageDestination: selectedCloud,
      createdAt: new Date().toISOString()
    };
    setFolders(prev => [...prev, newFolder]);
  };

  // Rename
  const handleConfirmRename = (id: string, newName: string, isFolder: boolean) => {
    if (isFolder) {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    } else {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const extension = newName.includes('.') ? newName.split('.').pop() || f.extension : f.extension;
          const updated = { ...f, name: newName, extension };
          if (selectedFileForDetails?.id === id) {
            setSelectedFileForDetails(updated);
          }
          return updated;
        }
        return f;
      }));
    }
  };

  // Delete
  const handleDeleteTrigger = (id?: string, isFolder = false) => {
    if (id) {
      const name = isFolder ? folders.find(f => f.id === id)?.name : files.find(f => f.id === id)?.name;
      setDeleteModalState({
        isOpen: true,
        count: 1,
        itemNames: [name || 'Item'],
        ids: [id],
        isFolder
      });
    } else {
      // Bulk delete of selectedIds
      const selectedNames: string[] = [];
      const selectedIdsArray = Array.from(selectedIds);
      selectedIdsArray.forEach(selId => {
        const f = files.find(item => item.id === selId);
        if (f) selectedNames.push(f.name);
        const folder = folders.find(item => item.id === selId);
        if (folder) selectedNames.push(folder.name);
      });

      setDeleteModalState({
        isOpen: true,
        count: selectedIds.size,
        itemNames: selectedNames,
        ids: selectedIdsArray,
        isFolder: false
      });
    }
  };

  const handleConfirmDelete = () => {
    const idsToDelete = new Set(deleteModalState.ids);
    setFiles(prev => prev.filter(f => !idsToDelete.has(f.id)));
    setFolders(prev => prev.filter(f => !idsToDelete.has(f.id)));
    setSelectedIds(new Set());
    if (selectedFileForDetails && idsToDelete.has(selectedFileForDetails.id)) {
      setSelectedFileForDetails(null);
    }
  };

  // Drag & drop file upload
  const handleFilesDropped = async (droppedFiles: FileList) => {
    const parsedFiles: FileMetadata[] = [];
    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];
      const parsed = await parseUploadedFile(
        file,
        currentFolder.id,
        currentFolder.path,
        selectedCloud,
        CLOUD_PROVIDERS_CONFIG[selectedCloud].bucket,
        'sales_transactions'
      );
      parsedFiles.push(parsed);
    }
    setFiles(prev => [...parsedFiles, ...prev]);
    if (parsedFiles[0]) {
      setSelectedFileForDetails(parsedFiles[0]);
    }
  };

  // Upload modal callback
  const handleFilesUploaded = (newFiles: FileMetadata[]) => {
    setFiles(prev => [...newFiles, ...prev]);
    if (newFiles[0]) {
      setSelectedFileForDetails(newFiles[0]);
    }
  };

  // Trigger BigQuery ingestion
  const handleIngestToBigQuery = (file: FileMetadata) => {
    const job = simulateBigQueryIngest(file);
    setIngestionJobs(prev => [job, ...prev]);
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, ingestionStatus: 'ingested', ingestionJobId: job.jobId } : f));
    if (selectedFileForDetails?.id === file.id) {
      setSelectedFileForDetails(prev => prev ? { ...prev, ingestionStatus: 'ingested', ingestionJobId: job.jobId } : null);
    }
  };

  // Jump helpers
  const handleProfileWithPandas = (file: FileMetadata) => {
    setSelectedFileForDetails(file);
    setActiveTab('pandas');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* 3-Zone Global Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCloud={selectedCloud}
        setSelectedCloud={setSelectedCloud}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* VIEW 1: WINDOWS STYLE FILE EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="flex-1 flex flex-col h-full bg-slate-900/40 overflow-hidden">
            {/* Windows 11 Fluent Title Bar */}
            <WindowsTitleBar
              currentFolder={currentFolder}
              breadcrumbs={breadcrumbs}
              onNavigateToFolder={handleOpenFolder}
              onNavigateUp={handleNavigateUp}
              canNavigateUp={currentFolder.id !== 'root'}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isMaximized={isMaximized}
              setIsMaximized={setIsMaximized}
              onRefresh={() => setSearchQuery('')}
            />

            {/* Ribbon Toolbar */}
            <RibbonToolbar
              selectedCount={selectedIds.size}
              onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onDeleteSelected={() => handleDeleteTrigger()}
              onRenameSelected={() => {
                const selId = Array.from(selectedIds)[0];
                const f = files.find(item => item.id === selId);
                if (f) setRenameTarget({ id: f.id, name: f.name, isFolder: false });
                const folder = folders.find(item => item.id === selId);
                if (folder) setRenameTarget({ id: folder.id, name: folder.name, isFolder: true });
              }}
              onCopySelectedLink={() => {
                const selId = Array.from(selectedIds)[0];
                const f = files.find(item => item.id === selId);
                if (f) navigator.clipboard.writeText(f.cloudStorageUri);
              }}
              viewMode={viewMode}
              setViewMode={setViewMode}
              sortField={sortField}
              setSortField={setSortField}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              showPreviewPane={showPreviewPane}
              setShowPreviewPane={setShowPreviewPane}
            />

            {/* Explorer Body: Left Navigation Tree + File List + Right Details Pane */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Navigation Tree */}
              <NavigationTree
                folders={folders}
                currentFolderId={currentFolderId}
                onSelectFolder={handleOpenFolder}
                onSelectCloudTarget={(provider) => {
                  setSelectedCloud(provider);
                  // Find folder associated with this provider
                  const matched = folders.find(f => f.storageDestination === provider);
                  if (matched) handleOpenFolder(matched.id);
                }}
                onJumpToPostgres={() => setActiveTab('postgres')}
                onJumpToBigQuery={() => setActiveTab('bigquery')}
              />

              {/* Main File Canvas */}
              <FileListGrid
                currentFolder={currentFolder}
                folders={currentSubFolders}
                files={currentFolderFiles}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onOpenFolder={handleOpenFolder}
                onOpenFileDetails={handleOpenFileDetails}
                onIngestFileToBigQuery={handleIngestToBigQuery}
                onProfileFileWithPandas={handleProfileWithPandas}
                onRenameItem={(item) => setRenameTarget(item)}
                onDeleteItem={(id, isFolder) => handleDeleteTrigger(id, isFolder)}
                onFilesDropped={handleFilesDropped}
                viewMode={viewMode}
              />

              {/* Right Details & Preview Pane */}
              {showPreviewPane && (
                <PreviewPane
                  file={selectedFileForDetails}
                  onClose={() => setShowPreviewPane(false)}
                  onIngestToBigQuery={handleIngestToBigQuery}
                  onProfileWithPandas={handleProfileWithPandas}
                  onJumpToPostgres={() => setActiveTab('postgres')}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: POSTGRESQL METADATA CATALOG */}
        {activeTab === 'postgres' && (
          <PostgresCatalogView
            files={files}
            onSelectFile={(f) => {
              setSelectedFileForDetails(f);
              setActiveTab('explorer');
              setShowPreviewPane(true);
            }}
            onJumpToBigQuery={() => setActiveTab('bigquery')}
          />
        )}

        {/* VIEW 3: BIGQUERY WAREHOUSE */}
        {activeTab === 'bigquery' && (
          <BigQueryWarehouseView
            files={files}
            ingestionJobs={ingestionJobs}
            onTriggerIngest={handleIngestToBigQuery}
            onJumpToPandas={(f) => {
              setSelectedFileForDetails(f);
              setActiveTab('pandas');
            }}
          />
        )}

        {/* VIEW 4: PANDAS ANALYTICS & CHARTS */}
        {activeTab === 'pandas' && (
          <PandasAnalyticsView
            files={files}
            selectedFileId={selectedFileForDetails?.id || null}
            onSelectFile={(id) => {
              const f = files.find(item => item.id === id);
              if (f) setSelectedFileForDetails(f);
            }}
          />
        )}

        {/* VIEW 5: FASTAPI ENGINE & PYTHON PIPELINE */}
        {activeTab === 'fastapi' && (
          <FastApiDocsView
            files={files}
            onTriggerIngest={handleIngestToBigQuery}
          />
        )}
      </main>

      {/* MODALS */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentFolder={currentFolder}
        initialDestination={selectedCloud}
        onFilesUploaded={handleFilesUploaded}
      />

      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        currentFolder={currentFolder}
        onCreateFolder={handleCreateFolder}
      />

      <RenameModal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        targetItem={renameTarget}
        onConfirmRename={handleConfirmRename}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        count={deleteModalState.count}
        itemNames={deleteModalState.itemNames}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
