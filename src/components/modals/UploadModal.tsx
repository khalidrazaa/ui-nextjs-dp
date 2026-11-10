import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  HardDrive, 
  Database, 
  Cloud, 
  Globe, 
  CheckCircle2, 
  Layers, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  AlertCircle
} from 'lucide-react';
import { CloudProvider, FileMetadata, FolderItem } from '../../types';
import { CLOUD_PROVIDERS_CONFIG } from '../../mock/sampleData';
import { PREDEFINED_BIGQUERY_TABLES } from '../../utils/bigqueryEngine';
import { parseUploadedFile } from '../../utils/fileParser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolder: FolderItem;
  initialDestination: CloudProvider;
  onFilesUploaded: (newFiles: FileMetadata[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentFolder,
  initialDestination,
  onFilesUploaded
}) => {
  const [destination, setDestination] = useState<CloudProvider>(initialDestination);
  const [bucket, setBucket] = useState(CLOUD_PROVIDERS_CONFIG[initialDestination].bucket);
  const [targetTable, setTargetTable] = useState<string>('sales_transactions');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDestinationChange = (provider: CloudProvider) => {
    setDestination(provider);
    setBucket(CLOUD_PROVIDERS_CONFIG[provider].bucket);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setErrorMsg(null);
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Simulate stepped progress
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 20;
        });
      }, 150);

      const parsedList: FileMetadata[] = [];
      for (const file of selectedFiles) {
        const metadata = await parseUploadedFile(
          file,
          currentFolder.id,
          currentFolder.path,
          destination,
          bucket,
          targetTable
        );
        parsedList.push(metadata);
      }

      clearInterval(progressTimer);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        onFilesUploaded(parsedList);
        onClose();
      }, 400);

    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || 'Error parsing and uploading files.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-xl w-full p-6 text-xs text-slate-200 select-none flex flex-col gap-5">
        {/* Modal Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Upload Files to Cloud Lakehouse</h2>
              <p className="text-[11px] text-slate-400">Target Folder: <span className="text-sky-300 font-mono">{currentFolder.path}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close upload dialog"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Storage Destination Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            1. Select Cloud Storage Destination
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* AWS S3 */}
            <button
              type="button"
              onClick={() => handleDestinationChange('s3')}
              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-center ${
                destination === 's3'
                  ? 'border-amber-500 bg-amber-500/15 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <HardDrive className="w-5 h-5 text-amber-500" />
              <span className="text-xs">AWS S3</span>
              <span className="text-[9px] text-slate-400 font-normal">us-east-1</span>
            </button>

            {/* Azure Blob */}
            <button
              type="button"
              onClick={() => handleDestinationChange('blob')}
              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-center ${
                destination === 'blob'
                  ? 'border-sky-500 bg-sky-500/15 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <Database className="w-5 h-5 text-sky-400" />
              <span className="text-xs">Azure Blob</span>
              <span className="text-[9px] text-slate-400 font-normal">eastus</span>
            </button>

            {/* GCP Storage */}
            <button
              type="button"
              onClick={() => handleDestinationChange('gcs')}
              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-center ${
                destination === 'gcs'
                  ? 'border-blue-500 bg-blue-500/15 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <Cloud className="w-5 h-5 text-blue-400" />
              <span className="text-xs">GCP Storage</span>
              <span className="text-[9px] text-slate-400 font-normal">us-central1</span>
            </button>

            {/* Cloudflare R2 */}
            <button
              type="button"
              onClick={() => handleDestinationChange('r2')}
              className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-all text-center ${
                destination === 'r2'
                  ? 'border-orange-500 bg-orange-500/15 text-white font-semibold'
                  : 'border-slate-800 bg-slate-950/50 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <Globe className="w-5 h-5 text-orange-400" />
              <span className="text-xs">Cloudflare R2</span>
              <span className="text-[9px] text-slate-400 font-normal">S3-compatible</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-400">Bucket / Container:</span>
            <input
              type="text"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* 2. Target BigQuery Table Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>2. Predefined BigQuery Target Table &amp; Schema</span>
          </label>
          <select
            value={targetTable}
            onChange={(e) => setTargetTable(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {PREDEFINED_BIGQUERY_TABLES.map(table => (
              <option key={table.id} value={table.id}>
                {table.dataset}.{table.name} — {table.fields.length} predefined columns
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400">
            Uploaded records will be mapped and schema-validated automatically before warehouse streaming.
          </p>
        </div>

        {/* 3. File Drop & Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            3. Choose Files (Excel, CSV, PDF, Word, Images)
          </label>
          <label className="border-2 border-dashed border-slate-700 hover:border-sky-500/80 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition-all">
            <UploadCloud className="w-8 h-8 text-sky-400" />
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-200">Click to select files</span>
              <span className="text-slate-400"> or drag files here</span>
              <p className="text-[10px] text-slate-500 mt-1">
                Supported: .csv, .xlsx, .xls, .pdf, .docx, .doc, .png, .jpg, .webp, .svg
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.svg"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Selected Files Queue */}
          {selectedFiles.length > 0 && (
            <div className="max-h-28 overflow-y-auto flex flex-col gap-1 border border-slate-800 rounded-lg p-2 bg-slate-950/60">
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] py-1 px-1.5 bg-slate-900 rounded">
                  <div className="flex items-center gap-2 truncate">
                    {f.name.endsWith('.csv') && <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />}
                    {f.name.match(/\.xlsx?$/i) && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                    {f.name.endsWith('.pdf') && <FileText className="w-3.5 h-3.5 text-rose-400" />}
                    {f.name.match(/\.docx?$/i) && <FileText className="w-3.5 h-3.5 text-sky-400" />}
                    {f.name.match(/\.(png|jpg|jpeg|webp)$/i) && <FileImage className="w-3.5 h-3.5 text-violet-400" />}
                    <span className="font-medium text-slate-200 truncate">{f.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-sky-300">Calculating MD5/SHA-256 and streaming to {destination.toUpperCase()}...</span>
              <span className="text-white font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm shadow-sky-600/30 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Uploading & Cataloging...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
