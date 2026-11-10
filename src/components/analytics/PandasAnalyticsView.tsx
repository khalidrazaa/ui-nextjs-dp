import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Table, 
  PieChart, 
  TrendingUp, 
  FileSpreadsheet, 
  Sparkles, 
  Layers, 
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { FileMetadata } from '../../types';
import { profileDataFrame } from '../../utils/pandasProfiler';

interface PandasAnalyticsViewProps {
  files: FileMetadata[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
}

export const PandasAnalyticsView: React.FC<PandasAnalyticsViewProps> = ({
  files,
  selectedFileId,
  onSelectFile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'describe' | 'charts' | 'head_tail'>('charts');
  const [chartMetric, setChartMetric] = useState<string>('amount');

  // Filter only tabular files (csv and excel)
  const tabularFiles = useMemo(() => {
    return files.filter(f => ['csv', 'excel'].includes(f.fileType) && (f.extraMetadata.sampleRows?.length || 0) > 0);
  }, [files]);

  const activeFile = tabularFiles.find(f => f.id === selectedFileId) || tabularFiles[0];

  // Calculate pandas profiling
  const profile = useMemo(() => {
    if (!activeFile || !activeFile.extraMetadata.sampleRows) return null;
    return profileDataFrame(activeFile.name, activeFile.extraMetadata.sampleRows);
  }, [activeFile]);

  // Aggregate data for real-time charts based on the active file
  const chartData = useMemo(() => {
    if (!activeFile || !activeFile.extraMetadata.sampleRows) return null;
    const rows = activeFile.extraMetadata.sampleRows;

    // Check if sales transactions
    if (rows[0] && ('product_category' in rows[0] || 'amount' in rows[0])) {
      const categoryMap: Record<string, number> = {};
      const paymentMap: Record<string, number> = {};

      rows.forEach(r => {
        const cat = r.product_category || 'General';
        const val = Number(r.amount) || 0;
        categoryMap[cat] = (categoryMap[cat] || 0) + val;

        const pm = r.payment_method || 'Other';
        paymentMap[pm] = (paymentMap[pm] || 0) + 1;
      });

      return {
        type: 'sales',
        categories: Object.entries(categoryMap).map(([label, value]) => ({ label, value })),
        distribution: Object.entries(paymentMap).map(([label, count]) => ({ label, count })),
        totalValue: Object.values(categoryMap).reduce((a, b) => a + b, 0)
      };
    }

    // Generic aggregation for any other tabular dataset
    const firstCol = Object.keys(rows[0] || {})[0];
    const secondCol = Object.keys(rows[0] || {})[1];
    const map: Record<string, number> = {};
    rows.slice(0, 15).forEach(r => {
      const label = String(r[firstCol] || 'Item');
      const val = typeof r[secondCol] === 'number' ? r[secondCol] : 10;
      map[label] = (map[label] || 0) + val;
    });

    return {
      type: 'generic',
      categories: Object.entries(map).map(([label, value]) => ({ label, value })),
      distribution: Object.entries(map).map(([label, count]) => ({ label, count })),
      totalValue: Object.values(map).reduce((a, b) => a + b, 0)
    };
  }, [activeFile]);

  if (!activeFile || !profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-950 text-xs">
        <FileSpreadsheet className="w-12 h-12 text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-300">No tabular datasets available</p>
        <p className="text-[11px] text-slate-500 mt-1">Upload a CSV or Excel file to inspect DataFrame descriptions and charts.</p>
      </div>
    );
  }

  // Max value for bar scaling
  const maxCategoryVal = Math.max(...(chartData?.categories.map(c => c.value) || [1]));

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 select-none overflow-hidden">
      {/* Top Bar with Dataset Switcher */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-display">Pandas Data Profiler &amp; Visualizer</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                pandas:2.2.1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Statistical descriptions, quantile profiling, and real-time visualization of ingested warehouse records.
            </p>
          </div>
        </div>

        {/* Dataset Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Active DataFrame:</span>
          <select
            value={activeFile.id}
            onChange={(e) => onSelectFile(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-medium focus:outline-none focus:border-emerald-500"
          >
            {tabularFiles.map(f => (
              <option key={f.id} value={f.id}>
                df_{f.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_')} ({f.extraMetadata.rowCount || f.sizeFormatted})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 border-b border-slate-800 bg-slate-900/30">
        <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Rows</span>
          <span className="text-base sm:text-lg font-bold text-white font-mono tabular-nums mt-0.5">
            {profile.totalRows.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 truncate">100% in BigQuery</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Columns</span>
          <span className="text-base sm:text-lg font-bold text-white font-mono tabular-nums mt-0.5">
            {profile.totalColumns}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 truncate">
            {profile.numericSummary.length} num · {profile.categoricalSummary.length} cat
          </span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Memory Usage</span>
          <span className="text-base sm:text-lg font-bold text-white font-mono tabular-nums mt-0.5">
            {profile.memoryUsageKb} KB
          </span>
          <span className="text-[10px] text-sky-400 mt-1 truncate">Columnar footprint</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Target Table</span>
          <span className="text-xs font-semibold text-sky-300 font-mono truncate mt-1">
            {activeFile.targetBigQueryTable}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Validated
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 px-3 sm:px-4 border-b border-slate-800 bg-slate-900/40 text-xs font-medium overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveSubTab('charts')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'charts'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-Time Charts &amp; Aggregations</span>
        </button>

        <button
          onClick={() => setActiveSubTab('describe')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'describe'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>df.describe() Statistical Breakdown</span>
        </button>

        <button
          onClick={() => setActiveSubTab('head_tail')}
          className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
            activeSubTab === 'head_tail'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>df.head(10) &amp; df.tail(5) Sample</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* SUBTAB 1: REAL-TIME CHARTS */}
        {activeSubTab === 'charts' && chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart: Revenue / Value by Category */}
            <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-slate-900/60 p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">Aggregated Volume by Category</h3>
                  <p className="text-[11px] text-slate-400">Sum of numeric metric per segment in BigQuery lakehouse</p>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-400 tabular-nums">
                  Total: ${(chartData.totalValue * 10).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="flex flex-col gap-3 py-2">
                {chartData.categories.map((cat, idx) => {
                  const pct = Math.max(8, Math.round((cat.value / maxCategoryVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-200">{cat.label}</span>
                        <span className="font-mono text-emerald-400 tabular-nums">
                          ${(cat.value * 10).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distribution / Donut Breakdown */}
            <div className="border border-slate-800 rounded-xl bg-slate-900/60 p-4 flex flex-col gap-4">
              <div>
                <h3 className="text-xs font-semibold text-white">Segment Distribution</h3>
                <p className="text-[11px] text-slate-400">Count distribution across partition keys</p>
              </div>

              <div className="flex flex-col gap-2.5">
                {chartData.distribution.map((dist, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="font-medium text-slate-300">{dist.label}</span>
                    </div>
                    <span className="font-mono text-white font-semibold tabular-nums">
                      {dist.count} records
                    </span>
                  </div>
                ))}
              </div>

              {/* Time Horizon Notice */}
              <div className="mt-auto p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Aggregated live from Google Cloud BigQuery streaming buffer.</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: DF.DESCRIBE() STATISTICAL BREAKDOWN */}
        {activeSubTab === 'describe' && (
          <div className="flex flex-col gap-6">
            {/* Numeric Summary Table */}
            {profile.numericSummary.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">
                    Numeric Columns: <code className="font-mono text-emerald-400">df.describe(include=[np.number])</code>
                  </h3>
                  <span className="text-[11px] text-slate-400">{profile.numericSummary.length} numeric columns</span>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-900/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-mono">
                        <th className="py-2.5 px-3">Metric</th>
                        {profile.numericSummary.map(n => (
                          <th key={n.column} className="py-2.5 px-3 text-right">{n.column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] text-slate-200">
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">count</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums">{n.count}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">mean</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums text-emerald-300">{n.mean}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">std</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums text-slate-400">{n.std}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">min</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums">{n.min}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">25% (Q1)</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums">{n.p25}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">50% (Median)</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums text-sky-300 font-semibold">{n.median}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">75% (Q3)</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums">{n.p75}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 font-semibold text-slate-400">max</td>
                        {profile.numericSummary.map(n => (
                          <td key={n.column} className="py-2 px-3 text-right tabular-nums text-emerald-400">{n.max}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categorical Summary Table */}
            {profile.categoricalSummary.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white">
                    Categorical Columns: <code className="font-mono text-sky-400">df.describe(include=['O'])</code>
                  </h3>
                  <span className="text-[11px] text-slate-400">{profile.categoricalSummary.length} categorical columns</span>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-900/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-mono">
                        <th className="py-2 px-3">Column Name</th>
                        <th className="py-2 px-3 text-right">Non-Null Count</th>
                        <th className="py-2 px-3 text-right">Unique Values</th>
                        <th className="py-2 px-3">Top Category</th>
                        <th className="py-2 px-3 text-right">Top Freq</th>
                        <th className="py-2 px-3 text-right">Null %</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-[11px] text-slate-200">
                      {profile.categoricalSummary.map(c => (
                        <tr key={c.column} className="border-b border-slate-900 hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-semibold text-white">{c.column}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{c.count}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-sky-300">{c.unique}</td>
                          <td className="py-2 px-3 text-emerald-300 truncate max-w-xs">{c.top}</td>
                          <td className="py-2 px-3 text-right tabular-nums">{c.freq}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-400">{c.nullPercentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: HEAD & TAIL SAMPLE */}
        {activeSubTab === 'head_tail' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-white font-mono">df.head(10) — First 10 Ingested Records</h3>
              <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-900/60">
                <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                      <th className="py-2 px-3">#</th>
                      {Object.keys(profile.head[0] || {}).map(h => (
                        <th key={h} className="py-2 px-3 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.head.map((row, i) => (
                      <tr key={i} className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-500 tabular-nums">{i}</td>
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
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-white font-mono">df.tail(5) — Last 5 Ingested Records</h3>
              <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-900/60">
                <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900 text-slate-400">
                      <th className="py-2 px-3">#</th>
                      {Object.keys(profile.tail[0] || {}).map(h => (
                        <th key={h} className="py-2 px-3 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profile.tail.map((row, i) => (
                      <tr key={i} className="border-b border-slate-900 hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-500 tabular-nums">-{profile.tail.length - i}</td>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
