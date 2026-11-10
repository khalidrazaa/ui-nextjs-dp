import { PredefinedBigQueryTable, FileMetadata, BigQueryIngestionJob } from '../types';

export const PREDEFINED_BIGQUERY_TABLES: PredefinedBigQueryTable[] = [
  {
    id: 'sales_transactions',
    name: 'sales_transactions',
    dataset: 'retail_lakehouse',
    description: 'Raw transactional stream capturing orders, payment methods, regional revenue, and taxes.',
    supportedFileTypes: ['csv', 'excel'],
    fields: [
      { name: 'transaction_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique identifier for the transaction (e.g., TXN-9841)' },
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique customer reference' },
      { name: 'product_category', type: 'STRING', mode: 'REQUIRED', description: 'Product classification' },
      { name: 'amount', type: 'FLOAT64', mode: 'REQUIRED', description: 'Gross sale amount in USD' },
      { name: 'tax', type: 'FLOAT64', mode: 'NULLABLE', description: 'Applicable state/local tax' },
      { name: 'payment_method', type: 'STRING', mode: 'NULLABLE', description: 'Credit Card, ACH, Wire, PayPal' },
      { name: 'transaction_date', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'ISO-8601 transaction timestamp' },
      { name: 'region', type: 'STRING', mode: 'NULLABLE', description: 'Geographic market (US-East, EMEA, APAC)' },
      { name: 'status', type: 'STRING', mode: 'REQUIRED', description: 'COMPLETED, REFUNDED, PENDING' }
    ]
  },
  {
    id: 'customer_churn_analytics',
    name: 'customer_churn_analytics',
    dataset: 'customer_intelligence',
    description: 'Customer subscription metrics, tenure, SLA tickets, and churn risk probability indicators.',
    supportedFileTypes: ['csv', 'excel'],
    fields: [
      { name: 'customer_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique customer identifier' },
      { name: 'tenure_months', type: 'INT64', mode: 'REQUIRED', description: 'Months of active subscription' },
      { name: 'monthly_charges', type: 'FLOAT64', mode: 'REQUIRED', description: 'Recurring monthly bill amount' },
      { name: 'contract_type', type: 'STRING', mode: 'REQUIRED', description: 'Month-to-month, One-year, Two-year' },
      { name: 'churn_flag', type: 'BOOLEAN', mode: 'REQUIRED', description: 'Whether the account churned' },
      { name: 'support_tickets', type: 'INT64', mode: 'NULLABLE', description: 'Count of escalated support cases' },
      { name: 'last_active_date', type: 'DATE', mode: 'NULLABLE', description: 'Last platform login date' }
    ]
  },
  {
    id: 'financial_ledger_records',
    name: 'financial_ledger_records',
    dataset: 'corporate_finance',
    description: 'General ledger journal entries, double-entry debits and credits, cost centers, and fiscal accounting.',
    supportedFileTypes: ['csv', 'excel'],
    fields: [
      { name: 'entry_id', type: 'STRING', mode: 'REQUIRED', description: 'General ledger journal entry sequence number' },
      { name: 'account_code', type: 'STRING', mode: 'REQUIRED', description: 'Chart of accounts code (e.g., 4010-REVENUE)' },
      { name: 'debit', type: 'FLOAT64', mode: 'NULLABLE', description: 'Debit amount' },
      { name: 'credit', type: 'FLOAT64', mode: 'NULLABLE', description: 'Credit amount' },
      { name: 'fiscal_period', type: 'STRING', mode: 'REQUIRED', description: 'Fiscal quarter (e.g., 2026-Q1)' },
      { name: 'cost_center', type: 'STRING', mode: 'NULLABLE', description: 'Department code (ENG, MKT, SALES, G&A)' },
      { name: 'posted_at', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'Posting timestamp' }
    ]
  },
  {
    id: 'marketing_campaign_leads',
    name: 'marketing_campaign_leads',
    dataset: 'growth_analytics',
    description: 'Inbound lead attribution, campaign UTM sources, conversion counts, and cost-per-lead metrics.',
    supportedFileTypes: ['csv', 'excel'],
    fields: [
      { name: 'lead_id', type: 'STRING', mode: 'REQUIRED', description: 'Unique marketing attribution ID' },
      { name: 'campaign_source', type: 'STRING', mode: 'REQUIRED', description: 'Google Ads, LinkedIn B2B, Organic, Webinar' },
      { name: 'conversions', type: 'INT64', mode: 'REQUIRED', description: 'Number of MQL to SQL conversions' },
      { name: 'cost_per_lead', type: 'FLOAT64', mode: 'NULLABLE', description: 'Calculated acquisition cost in USD' },
      { name: 'utm_medium', type: 'STRING', mode: 'NULLABLE', description: 'cpc, organic, email, referral' },
      { name: 'lead_score', type: 'FLOAT64', mode: 'NULLABLE', description: 'Predictive qualification score (0-100)' },
      { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'Lead capture timestamp' }
    ]
  },
  {
    id: 'unstructured_document_index',
    name: 'unstructured_document_index',
    dataset: 'document_lake',
    description: 'Metadata index for PDFs, Word documents, and images with storage URIs, checksums, and token counts.',
    supportedFileTypes: ['pdf', 'word', 'image', 'other'],
    fields: [
      { name: 'doc_id', type: 'STRING', mode: 'REQUIRED', description: 'Catalog UUID document reference' },
      { name: 'file_name', type: 'STRING', mode: 'REQUIRED', description: 'Sanitized storage file name' },
      { name: 'document_type', type: 'STRING', mode: 'REQUIRED', description: 'PDF, DOCX, JPEG, PNG, etc.' },
      { name: 'storage_uri', type: 'STRING', mode: 'REQUIRED', description: 'Full cloud object path (s3://, gs://, blob://, r2://)' },
      { name: 'page_or_word_count', type: 'INT64', mode: 'NULLABLE', description: 'Estimated page count or word count' },
      { name: 'checksum_sha256', type: 'STRING', mode: 'REQUIRED', description: 'Cryptographic SHA-256 integrity signature' },
      { name: 'ingestion_timestamp', type: 'TIMESTAMP', mode: 'REQUIRED', description: 'Time indexed in warehouse' }
    ]
  }
];

export interface ValidationReport {
  isValid: boolean;
  targetTable: PredefinedBigQueryTable;
  missingRequiredColumns: string[];
  matchedColumns: string[];
  extraColumns: string[];
  typeMismatches: { column: string; expected: string; detected: string }[];
  summary: string;
}

export function validateFileAgainstSchema(file: FileMetadata): ValidationReport | null {
  const table = PREDEFINED_BIGQUERY_TABLES.find(t => t.id === file.targetBigQueryTable);
  if (!table) return null;

  const fileHeaders = (file.extraMetadata.headers || []).map(h => h.trim().toLowerCase());
  const requiredFields = table.fields.filter(f => f.mode === 'REQUIRED');
  
  const matchedColumns: string[] = [];
  const missingRequiredColumns: string[] = [];

  requiredFields.forEach(field => {
    const found = fileHeaders.some(h => h === field.name.toLowerCase() || h.includes(field.name.toLowerCase()));
    if (found) {
      matchedColumns.push(field.name);
    } else {
      // For unstructured files, auto-match system columns
      if (table.id === 'unstructured_document_index') {
        matchedColumns.push(field.name);
      } else {
        missingRequiredColumns.push(field.name);
      }
    }
  });

  const extraColumns = fileHeaders.filter(h => !table.fields.some(f => f.name.toLowerCase() === h));

  const isValid = missingRequiredColumns.length === 0;

  return {
    isValid,
    targetTable: table,
    missingRequiredColumns,
    matchedColumns,
    extraColumns,
    typeMismatches: [],
    summary: isValid
      ? `All ${requiredFields.length} required fields verified against ${table.dataset}.${table.name}.`
      : `Missing required schema fields: ${missingRequiredColumns.join(', ')}.`
  };
}

export function simulateBigQueryIngest(file: FileMetadata): BigQueryIngestionJob {
  const rowCount = file.extraMetadata.rowCount || 1;
  const slotMillis = Math.floor(Math.random() * 800) + 250;
  const bytesBilledMb = Number((file.sizeBytes / (1024 * 1024) + 0.1).toFixed(2));
  
  return {
    jobId: `bq_job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fileId: file.id,
    fileName: file.name,
    targetTable: file.targetBigQueryTable,
    rowsInserted: rowCount,
    status: 'DONE',
    startedAt: new Date(Date.now() - 1500).toISOString(),
    completedAt: new Date().toISOString(),
    slotMillis,
    bytesBilledMb
  };
}
