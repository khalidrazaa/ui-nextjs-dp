import { PandasProfileResult, PandasSummaryNumeric, PandasSummaryCategorical } from '../types';

function calculateQuantile(sortedValues: number[], q: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }
  return sortedValues[base];
}

export function profileDataFrame(fileName: string, rows: Record<string, any>[]): PandasProfileResult {
  if (!rows || rows.length === 0) {
    return {
      fileName,
      totalRows: 0,
      totalColumns: 0,
      memoryUsageKb: 0,
      numericSummary: [],
      categoricalSummary: [],
      head: [],
      tail: [],
      columnTypes: {}
    };
  }

  const columns = Object.keys(rows[0] || {});
  const totalRows = rows.length;
  const totalColumns = columns.length;

  const numericSummary: PandasSummaryNumeric[] = [];
  const categoricalSummary: PandasSummaryCategorical[] = [];
  const columnTypes: Record<string, string> = {};

  columns.forEach(col => {
    const values = rows.map(r => r[col]);
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = totalRows - nonNullValues.length;
    const nullPercentage = Number(((nullCount / totalRows) * 100).toFixed(1));

    // Check if numeric
    const parsedNums = nonNullValues
      .map(v => typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, '')))
      .filter(v => !isNaN(v) && isFinite(v));

    const isNumeric = parsedNums.length > 0 && parsedNums.length >= nonNullValues.length * 0.8;

    if (isNumeric) {
      columnTypes[col] = parsedNums.every(n => Number.isInteger(n)) ? 'int64' : 'float64';
      parsedNums.sort((a, b) => a - b);
      const count = parsedNums.length;
      const sum = parsedNums.reduce((acc, curr) => acc + curr, 0);
      const mean = count > 0 ? sum / count : 0;
      
      const variance = count > 1
        ? parsedNums.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / (count - 1)
        : 0;
      const std = Math.sqrt(variance);

      const min = parsedNums[0] ?? 0;
      const max = parsedNums[parsedNums.length - 1] ?? 0;
      const p25 = calculateQuantile(parsedNums, 0.25);
      const median = calculateQuantile(parsedNums, 0.50);
      const p75 = calculateQuantile(parsedNums, 0.75);

      numericSummary.push({
        column: col,
        count,
        mean: Number(mean.toFixed(2)),
        std: Number(std.toFixed(2)),
        min: Number(min.toFixed(2)),
        p25: Number(p25.toFixed(2)),
        median: Number(median.toFixed(2)),
        p75: Number(p75.toFixed(2)),
        max: Number(max.toFixed(2)),
        nullCount,
        nullPercentage
      });
    } else {
      // Categorical column
      columnTypes[col] = 'object';
      const count = nonNullValues.length;
      const freqMap: Record<string, number> = {};
      
      nonNullValues.forEach(val => {
        const strVal = String(val);
        freqMap[strVal] = (freqMap[strVal] || 0) + 1;
      });

      const uniqueEntries = Object.entries(freqMap);
      const unique = uniqueEntries.length;
      
      let top = 'N/A';
      let freq = 0;
      uniqueEntries.forEach(([key, countVal]) => {
        if (countVal > freq) {
          top = key;
          freq = countVal;
        }
      });

      categoricalSummary.push({
        column: col,
        count,
        unique,
        top,
        freq,
        nullCount,
        nullPercentage
      });
    }
  });

  const memoryUsageKb = Number((JSON.stringify(rows).length / 1024).toFixed(1));
  const head = rows.slice(0, 10);
  const tail = rows.slice(-5);

  return {
    fileName,
    totalRows,
    totalColumns,
    memoryUsageKb,
    numericSummary,
    categoricalSummary,
    head,
    tail,
    columnTypes
  };
}
