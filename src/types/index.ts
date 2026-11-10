export type CloudProvider = 's3' | 'blob' | 'gcs' | 'r2';

export interface CloudStorageConfig {
  provider: CloudProvider;
  name: string;
  bucket: string;
  region: string;
  endpoint: string;
  icon: string;
  color: string;
}

export type FileType = 'csv' | 'excel' | 'pdf' | 'word' | 'image' | 'other';

export type IngestionStatus = 'pending' | 'validating' | 'parsed' | 'ingested' | 'failed';

export interface PredefinedBigQuerySchemaField {
  name: string;
  type: 'STRING' | 'INT64' | 'FLOAT64' | 'BOOLEAN' | 'TIMESTAMP' | 'DATE';
  mode: 'REQUIRED' | 'NULLABLE' | 'REPEATED';
  description?: string;
}

export interface PredefinedBigQueryTable {
  id: string;
  name: string;
  dataset: string;
  description: string;
  supportedFileTypes: FileType[];
  fields: PredefinedBigQuerySchemaField[];
}

export interface FileMetadata {
  id: string; // UUID
  name: string;
  originalName: string;
  extension: string;
  fileType: FileType;
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  folderId: string;
  folderPath: string;
  
  // Storage Destination
  storageDestination: CloudProvider;
  bucketOrContainer: string;
  cloudStorageUri: string; // e.g. s3://bucket/key or gs://bucket/key
  cdnDirectUrl: string; // Public / signed URL
  
  // Checksums & timestamps
  md5Checksum: string;
  sha256Checksum: string;
  uploadedAt: string;
  modifiedAt: string;
  
  // Extra metadata based on file type
  extraMetadata: {
    // Images
    width?: number;
    height?: number;
    aspectRatio?: string;
    colorSpace?: string;
    
    // PDFs & Docs
    pageCount?: number;
    wordCount?: number;
    title?: string;
    author?: string;
    
    // Spreadsheets & CSV
    sheetNames?: string[];
    rowCount?: number;
    columnCount?: number;
    headers?: string[];
    sampleRows?: Record<string, any>[];
  };

  // BigQuery Ingestion Mapping
  targetBigQueryTable: string;
  ingestionStatus: IngestionStatus;
  ingestionJobId?: string;
  ingestedAt?: string;
  validationErrors?: string[];
  tags: string[];
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  storageDestination?: CloudProvider;
  createdAt: string;
  color?: string;
}

export type ViewMode = 'details' | 'large_icons' | 'medium_icons' | 'tiles';
export type SortField = 'name' | 'modifiedAt' | 'fileType' | 'sizeBytes' | 'storageDestination';
export type SortDirection = 'asc' | 'desc';

export interface PandasSummaryNumeric {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
  nullCount: number;
  nullPercentage: number;
}

export interface PandasSummaryCategorical {
  column: string;
  count: number;
  unique: number;
  top: string;
  freq: number;
  nullCount: number;
  nullPercentage: number;
}

export interface PandasProfileResult {
  fileName: string;
  totalRows: number;
  totalColumns: number;
  memoryUsageKb: number;
  numericSummary: PandasSummaryNumeric[];
  categoricalSummary: PandasSummaryCategorical[];
  head: Record<string, any>[];
  tail: Record<string, any>[];
  columnTypes: Record<string, string>;
}

export interface BigQueryIngestionJob {
  jobId: string;
  fileId: string;
  fileName: string;
  targetTable: string;
  rowsInserted: number;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  slotMillis: number;
  bytesBilledMb: number;
  errors?: string[];
}
