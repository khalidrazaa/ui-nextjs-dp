import React, { useState } from 'react';
import { 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Table, 
  Database, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Cpu
} from 'lucide-react';
import { FileMetadata, PredefinedBigQueryTable, BigQueryIngestionJob } from '../../types';
import { PREDEFINED_BIGQUERY_TABLES, validateFileAgainstSchema, simulateBigQueryIngest } from '../../utils/bigqueryEngine';

interface BigQueryWarehouseViewProps {
  files: FileMetadata[];
  ingestionJobs: BigQueryIngestionJob[];
  onTriggerIngest: (file: FileMetadata) => void;
  onJumpToPandas: (file: FileMetadata) => void;
}

export const BigQueryWarehouseView: React.FC<BigQueryWarehouseViewProps> = ({
  files,
  ingestionJobs,
  onTriggerIngest,
  onJumpToPandas
}) => {
  const [selectedTableId, setSelectedTableId] = useState<string>('sales_transactions');
  const [selectedFileForValidation, setSelectedFileForValidation] = useState<string>(files[0]?.id || '');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT product_category, COUNT(*) as tx_count, ROUND(SUM(amount), 2) as total_revenue, ROUND(AVG(amount), 2) as avg_order_val FROM retail_lakehouse.sales_transactions GROUP BY product_category ORDER BY total_revenue DESC;'
  );
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [queryMetrics, setQueryMetrics] = useState<{ bytesBilled: string; elapsedMs: number; slotMs: number } | null>(null);

  const currentTable = PREDEFINED_BIGQUERY_TABLES.find(t => t.id === selectedTableId) || PREDEFINED_BIGQUERY_TABLES[0];
  const fileToValidate = files.find(f => f.id === selectedFileForValidation) || files[0];
  const validationReport = fileToValidate ? validateFileAgainstSchema(fileToValidate) : null;

  // Filter files mapped to current table
  const mappedFiles = files.filter(f => f.targetBigQueryTable === currentTable.id);

  const handleExecuteBigQuery = () => {
    const start = performance.now();
    // Simulate BigQuery execution against mapped file sample rows
    const salesFile = files.find(f => f.targetBigQueryTable === 'sales_transactions');
    const rows = salesFile?.extraMetadata?.sampleRows || [];

    let result: any[] = [];
    if (sqlQuery.toLowerCase().includes('group by product_category')) {
      const grouped: Record<string, { category: string; tx_count: number; total_revenue: number; avg_order_val: number }> = {};
      rows.forEach(r => {
        const cat = r.product_category || 'General';
        const amt = Number(r.amount) || 0;
        if (!grouped[cat]) {
          grouped[cat] = { category: cat, tx_count: 0, total_revenue: 0, avg_order_val: 0 };
        }
        grouped[cat].tx_count += 1;
        grouped[cat].total_revenue += amt;
      });
      result = Object.values(grouped).map(g => ({
        product_category: g.category,
        tx_count: g.tx_count * 150, // Scaled for warehouse representation
        total_revenue: `$${(g.total_revenue * 150).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        avg_order_val: `$${(g.total_revenue / g.tx_count).toFixed(2)}`
      }));
    } else {
      result = rows.slice(0, 10);
    }

    const elapsed = Math.round(performance.now() - start) + 42; // Real BigQuery query execution time ~45ms
    setQueryMetrics({
      bytesBilled: '24.5 MB',
      elapsedMs: elapsed,
      slotMs: 310
    });
    setQueryOutput(result);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white font-display">Google Cloud BigQuery Lakehouse</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                project: omnistore-lakehouse-prod
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated ingestion pipeline with strict schema enforcement and live query runner.
            </p>
          </div>
        </div>

        {/* BigQuery Quick Switcher */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-slate-400 font-medium hidden sm:inline">Table Target:</span>
          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-sky-300 font-mono font-medium focus:outline-none focus:border-blue-500 max-w-[200px] sm:max-w-none truncate"
          >
            {PREDEFINED_BIGQUERY_TABLES.map(table => (
              <option key={table.id} value={table.id}>
                {table.dataset}.{table.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-4 sm:gap-6">
        {/* TOP SECTION: PREDEFINED SCHEMA & VALIDATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Predefined Schema Card */}
          <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-slate-900/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white text-xs">
                  Target Table Schema: <span className="font-mono text-sky-300">{currentTable.dataset}.{currentTable.name}</span>
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">{currentTable.fields.length} predefined fields</span>
            </div>
            <p className="text-[11px] text-slate-400">{currentTable.description}</p>

            <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-56 bg-slate-950/60">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                    <th className="py-2 px-3">Field Name</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Mode</th>
                    <th className="py-2 px-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTable.fields.map(f => (
                    <tr key={f.name} className="border-b border-slate-900 hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono font-medium text-slate-200">{f.name}</td>
                      <td className="py-2 px-3 font-mono text-blue-400">{f.type}</td>
                      <td className="py-2 px-3 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded ${f.mode === 'REQUIRED' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                          {f.mode}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400">{f.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schema Validation Scorecard */}
          <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white text-xs">Schema Mapping Engine</h3>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Test File Mapping</label>
              <select
                value={selectedFileForValidation}
                onChange={(e) => setSelectedFileForValidation(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
              >
                {files.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.targetBigQueryTable})</option>
                ))}
              </select>
            </div>

            {validationReport ? (
              <div className="flex flex-col gap-2 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  {validationReport.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span className={`font-semibold ${validationReport.isValid ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {validationReport.isValid ? 'Schema Validated (Ready to Stream)' : 'Column Mismatch Detected'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{validationReport.summary}</p>

                <div className="flex flex-col gap-1 mt-1 text-[10px]">
                  <div className="text-slate-500 font-semibold uppercase">Matched Fields ({validationReport.matchedColumns.length}):</div>
                  <div className="flex flex-wrap gap-1">
                    {validationReport.matchedColumns.map(col => (
                      <span key={col} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                        ✓ {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onTriggerIngest(fileToValidate)}
                    disabled={fileToValidate.ingestionStatus === 'ingested'}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{fileToValidate.ingestionStatus === 'ingested' ? 'Re-stream Records to BigQuery' : 'Trigger Ingestion Pipeline'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs">No file selected for validation.</div>
            )}
          </div>
        </div>

        {/* INGESTION JOBS STREAMING MONITOR */}
        <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <h3 className="font-semibold text-white text-xs">Automated BigQuery Ingestion Job Stream</h3>
            </div>
            <span className="text-xs text-slate-400">{ingestionJobs.length} active jobs</span>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950/60 max-h-48">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                  <th className="py-2 px-3">Job ID</th>
                  <th className="py-2 px-3">File Source</th>
                  <th className="py-2 px-3">Target Table</th>
                  <th className="py-2 px-3 text-right">Rows Ingested</th>
                  <th className="py-2 px-3 text-right">Slot Time</th>
                  <th className="py-2 px-3 text-right">Bytes Billed</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ingestionJobs.map(job => (
                  <tr key={job.jobId} className="border-b border-slate-900 hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="py-2 px-3 text-sky-400">{job.jobId}</td>
                    <td className="py-2 px-3 text-slate-200">{job.fileName}</td>
                    <td className="py-2 px-3 text-slate-300">{job.targetTable}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 tabular-nums">+{job.rowsInserted.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{job.slotMillis} ms</td>
                    <td className="py-2 px-3 text-right text-slate-400 tabular-nums">{job.bytesBilledMb} MB</td>
                    <td className="py-2 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BIGQUERY SQL CONSOLE & QUERY RUNNER */}
        <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-xs">BigQuery SQL Analytics Workspace</h3>
            </div>
            <button
              onClick={handleExecuteBigQuery}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run BigQuery</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-sky-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
          />

          {queryMetrics && (
            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Query completed in <strong className="text-white font-mono">{queryMetrics.elapsedMs} ms</strong></span>
              <span>·</span>
              <span>Bytes processed: <strong className="text-white font-mono">{queryMetrics.bytesBilled}</strong></span>
              <span>·</span>
              <span>Slot time: <strong className="text-white font-mono">{queryMetrics.slotMs} ms</strong></span>
            </div>
          )}

          {queryOutput && (
            <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950/60 max-h-56">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-mono">
                    {Object.keys(queryOutput[0] || {}).map(k => (
                      <th key={k} className="py-2 px-3 font-medium">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryOutput.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-900 hover:bg-slate-800/40 font-mono text-[11px]">
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className="py-2 px-3 text-slate-200 whitespace-nowrap">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
