import React, { useState } from 'react';
import { 
  Database, 
  Play, 
  Download, 
  Search, 
  FileCode, 
  Check, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Layers,
  Sparkles
} from 'lucide-react';
import { FileMetadata } from '../../types';

interface PostgresCatalogViewProps {
  files: FileMetadata[];
  onSelectFile: (file: FileMetadata) => void;
  onJumpToBigQuery: () => void;
}

export const PostgresCatalogView: React.FC<PostgresCatalogViewProps> = ({
  files,
  onSelectFile,
  onJumpToBigQuery
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'sql_console' | 'ddl_schema'>('records');
  const [searchFilter, setSearchFilter] = useState('');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT file_name, storage_destination, target_bigquery_table, size_bytes, ingestion_status FROM storage_file_catalog ORDER BY uploaded_at DESC;'
  );
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryLatency, setQueryLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter records
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.storageDestination.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.targetBigQueryTable.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.extension.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleRunSql = () => {
    const startTime = performance.now();
    const queryLower = sqlQuery.toLowerCase();

    let result: any[] = [];
    if (queryLower.includes('group by storage_destination')) {
      const grouped: Record<string, { destination: string; count: number; total_bytes: number }> = {};
      files.forEach(f => {
        if (!grouped[f.storageDestination]) {
          grouped[f.storageDestination] = { destination: f.storageDestination, count: 0, total_bytes: 0 };
        }
        grouped[f.storageDestination].count += 1;
        grouped[f.storageDestination].total_bytes += f.sizeBytes;
      });
      result = Object.values(grouped);
    } else if (queryLower.includes('group by')) {
      const grouped: Record<string, any> = {};
      files.forEach(f => {
        const key = `${f.targetBigQueryTable}_${f.ingestionStatus}`;
        if (!grouped[key]) {
          grouped[key] = { target_table: f.targetBigQueryTable, status: f.ingestionStatus, count: 0 };
        }
        grouped[key].count += 1;
      });
      result = Object.values(grouped);
    } else {
      result = files.map(f => ({
        id: f.id.slice(0, 8),
        file_name: f.name,
        storage_destination: f.storageDestination,
        target_bigquery_table: f.targetBigQueryTable,
        size_bytes: f.sizeBytes,
        ingestion_status: f.ingestionStatus,
        uploaded_at: f.uploadedAt.split('T')[0]
      }));
    }

    const duration = Math.round(performance.now() - startTime) + 3; // Realistic ~4ms Postgres query time
    setQueryLatency(duration);
    setQueryResult(result);
  };

  const ddlSchemaText = `-- PostgreSQL 16 Data Lake Catalog Schema
CREATE TABLE storage_file_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_extension VARCHAR(32) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    
    -- Cryptographic Integrity Checksums
    md5_checksum CHAR(32) NOT NULL,
    sha256_checksum CHAR(64) NOT NULL,
    
    -- Multi-Cloud Storage Pointers
    storage_destination VARCHAR(16) NOT NULL CHECK (storage_destination IN ('s3', 'blob', 'gcs', 'r2')),
    bucket_or_container VARCHAR(128) NOT NULL,
    cloud_storage_uri TEXT NOT NULL,
    cdn_direct_url TEXT NOT NULL,
    folder_path TEXT NOT NULL DEFAULT '/',
    
    -- Ingestion Pipeline & BigQuery Table Mapping
    target_bigquery_table VARCHAR(128) NOT NULL,
    ingestion_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    ingestion_job_id VARCHAR(128),
    ingested_at TIMESTAMP WITH TIME ZONE,
    
    -- Dynamic Metadata Attributes (JSONB)
    extra_metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Audit Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_catalog_storage_dest ON storage_file_catalog(storage_destination);
CREATE INDEX idx_catalog_target_bq ON storage_file_catalog(target_bigquery_table);
CREATE INDEX idx_catalog_checksum_sha256 ON storage_file_catalog(sha256_checksum);
CREATE INDEX idx_catalog_metadata_gin ON storage_file_catalog USING gin(extra_metadata);`;

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(files, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `postgres_storage_catalog_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Top Banner */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white font-display">PostgreSQL Lakehouse Metadata Catalog</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                postgres:16-alpine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Persistent relational catalog tracking cloud storage pointers, SHA-256 digests, and BigQuery table routing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 px-3 sm:px-4 border-b border-slate-800 bg-slate-900/40 text-xs font-medium overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveTab('records')}
          className={`py-2.5 border-b-2 transition-colors shrink-0 ${
            activeTab === 'records'
              ? 'border-indigo-400 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Catalog Records ({files.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('sql_console');
            if (!queryResult) handleRunSql();
          }}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'sql_console'
              ? 'border-indigo-400 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Interactive SQL Query Console</span>
        </button>
        <button
          onClick={() => setActiveTab('ddl_schema')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'ddl_schema'
              ? 'border-indigo-400 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Postgres DDL Schema</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: CATALOG RECORDS */}
        {activeTab === 'records' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-72 relative">
                <input
                  type="text"
                  placeholder="Filter catalog records..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <span className="text-xs text-slate-400">
                Displaying {filteredFiles.length} cataloged documents
              </span>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-900/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                    <th className="py-2.5 px-3">id</th>
                    <th className="py-2.5 px-3">file_name</th>
                    <th className="py-2.5 px-3">storage_dest</th>
                    <th className="py-2.5 px-3">cloud_storage_uri</th>
                    <th className="py-2.5 px-3 text-right">size_bytes</th>
                    <th className="py-2.5 px-3">sha256_checksum</th>
                    <th className="py-2.5 px-3">target_bigquery_table</th>
                    <th className="py-2.5 px-3">status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <tr
                      key={file.id}
                      onClick={() => onSelectFile(file)}
                      className="border-b border-slate-900 hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-indigo-300">{file.id.slice(0, 10)}...</td>
                      <td className="py-2.5 px-3 font-medium text-white">{file.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {file.storageDestination}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-sky-400 truncate max-w-xs" title={file.cloudStorageUri}>
                        {file.cloudStorageUri}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                        {file.sizeBytes.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={file.sha256Checksum}>
                        {file.sha256Checksum}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">
                        {file.targetBigQueryTable}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          file.ingestionStatus === 'ingested'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {file.ingestionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SQL CONSOLE */}
        {activeTab === 'sql_console' && (
          <div className="flex flex-col gap-4">
            {/* Quick Queries */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Pre-canned SQL:</span>
              <button
                onClick={() => {
                  setSqlQuery('SELECT file_name, storage_destination, target_bigquery_table, size_bytes, ingestion_status FROM storage_file_catalog ORDER BY uploaded_at DESC;');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
              >
                SELECT * FROM storage_file_catalog
              </button>
              <button
                onClick={() => {
                  setSqlQuery('SELECT storage_destination, COUNT(*) AS file_count, SUM(size_bytes) AS total_bytes FROM storage_file_catalog GROUP BY storage_destination;');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
              >
                GROUP BY storage_destination
              </button>
              <button
                onClick={() => {
                  setSqlQuery('SELECT target_bigquery_table, ingestion_status, COUNT(*) FROM storage_file_catalog GROUP BY 1, 2;');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px]"
              >
                GROUP BY target_bigquery_table
              </button>
            </div>

            {/* SQL Editor */}
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
              <div className="bg-slate-850 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-300">psql console (lakehouse_catalog)</span>
                </div>
                <button
                  onClick={handleRunSql}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute SQL</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full bg-slate-950 p-3 font-mono text-xs text-sky-200 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Query Result */}
            {queryResult && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Query Output ({queryResult.length} rows returned)</span>
                  {queryLatency && <span className="font-mono text-emerald-400">{queryLatency} ms</span>}
                </div>

                <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-900/60 max-h-64">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                        {Object.keys(queryResult[0] || {}).map(k => (
                          <th key={k} className="py-2 px-3 font-medium font-mono">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-900 hover:bg-slate-800/40">
                          {Object.values(row).map((val: any, vIdx) => (
                            <td key={vIdx} className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">
                              {typeof val === 'number' ? val.toLocaleString() : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DDL SCHEMA */}
        {activeTab === 'ddl_schema' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">PostgreSQL Schema Definition with GIN indexing for JSONB</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(ddlSchemaText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy DDL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto leading-relaxed">
              {ddlSchemaText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
