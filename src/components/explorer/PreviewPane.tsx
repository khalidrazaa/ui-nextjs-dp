import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  FileImage, 
  Database, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TableProperties
} from 'lucide-react';
import { FileMetadata } from '../../types';

interface PreviewPaneProps {
  file: FileMetadata | null;
  onClose: () => void;
  onIngestToBigQuery: (file: FileMetadata) => void;
  onProfileWithPandas: (file: FileMetadata) => void;
  onJumpToPostgres: () => void;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  file,
  onClose,
  onIngestToBigQuery,
  onProfileWithPandas,
  onJumpToPostgres
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!file) {
    return (
      <aside className="w-80 border-l border-slate-800 bg-slate-900/80 p-4 flex flex-col items-center justify-center text-center text-slate-500 text-xs shrink-0 select-none">
        <TableProperties className="w-10 h-10 text-slate-600 mb-2 stroke-[1.5]" />
        <p className="font-medium text-slate-400">Select an item to view its details</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Cloud storage URI, PostgreSQL catalog attributes, schema validation, and content preview.
        </p>
      </aside>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleRows = file.extraMetadata.sampleRows || [];
  const headers = file.extraMetadata.headers || [];

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        aria-hidden="true"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 lg:static lg:w-80 lg:z-auto border-l border-slate-800 bg-slate-900/95 lg:bg-slate-900/90 flex flex-col h-full text-xs text-slate-200 shrink-0 select-none overflow-y-auto shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-200 truncate">Details &amp; Preview</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close details"
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5">
        {/* File Hero / Visual Card */}
        <div className="flex flex-col items-center p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
          {file.fileType === 'excel' && <FileSpreadsheet className="w-12 h-12 text-emerald-400 my-2" />}
          {file.fileType === 'csv' && <FileSpreadsheet className="w-12 h-12 text-teal-400 my-2" />}
          {file.fileType === 'pdf' && <FileText className="w-12 h-12 text-rose-400 my-2" />}
          {file.fileType === 'word' && <FileText className="w-12 h-12 text-sky-400 my-2" />}
          {file.fileType === 'image' && (
            <div className="my-2 w-full h-32 rounded bg-slate-900 flex items-center justify-center border border-slate-800 overflow-hidden">
              <FileImage className="w-12 h-12 text-violet-400" />
            </div>
          )}

          <div className="text-sm font-semibold text-white break-all px-1 mt-1">
            {file.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {file.sizeFormatted} · {file.mimeType}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onIngestToBigQuery(file)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Ingest to BigQuery</span>
          </button>

          {['csv', 'excel'].includes(file.fileType) && (
            <button
              onClick={() => onProfileWithPandas(file)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspect in Pandas Profiler</span>
            </button>
          )}
        </div>

        {/* Cloud Storage Destination */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cloud Storage Link
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
            <div>
              <div className="text-[10px] text-slate-400">URI</div>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="font-mono text-[11px] text-sky-300 truncate" title={file.cloudStorageUri}>
                  {file.cloudStorageUri}
                </span>
                <button
                  onClick={() => handleCopy(file.cloudStorageUri, 'uri')}
                  className="p-1 text-slate-400 hover:text-white shrink-0"
                  title="Copy URI"
                >
                  {copiedKey === 'uri' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400">Public CDN / Direct Link</div>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="font-mono text-[10px] text-slate-400 truncate" title={file.cdnDirectUrl}>
                  {file.cdnDirectUrl}
                </span>
                <button
                  onClick={() => handleCopy(file.cdnDirectUrl, 'cdn')}
                  className="p-1 text-slate-400 hover:text-white shrink-0"
                  title="Copy CDN Link"
                >
                  {copiedKey === 'cdn' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sample Preview (if CSV/Excel) */}
        {sampleRows.length > 0 && headers.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Table Preview ({file.extraMetadata.rowCount || sampleRows.length} rows)
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-950/80 max-h-48">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400">
                    {headers.slice(0, 4).map(h => (
                      <th key={h} className="p-1.5 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleRows.slice(0, 4).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-900">
                      {headers.slice(0, 4).map(h => (
                        <td key={h} className="p-1.5 text-slate-300 font-mono whitespace-nowrap">
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PostgreSQL Database Metadata Attributes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              PostgreSQL Metadata Record
            </span>
            <button
              onClick={onJumpToPostgres}
              className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View Table</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col gap-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Database ID</span>
              <span className="font-mono text-slate-200">{file.id.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">MD5 Checksum</span>
              <span className="font-mono text-slate-300">{file.md5Checksum.slice(0, 14)}...</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">SHA-256</span>
              <span className="font-mono text-slate-300">{file.sha256Checksum.slice(0, 14)}...</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Uploaded At</span>
              <span className="tabular-nums text-slate-300">{new Date(file.uploadedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Target BigQuery Table</span>
              <span className="font-mono text-sky-400 font-medium">{file.targetBigQueryTable}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </>
);
};
