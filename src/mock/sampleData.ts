import { CloudStorageConfig, FolderItem, FileMetadata } from '../types';

export const CLOUD_PROVIDERS_CONFIG: Record<string, CloudStorageConfig> = {
  s3: {
    provider: 's3',
    name: 'AWS S3 Data Lake',
    bucket: 'lakehouse-raw-production',
    region: 'us-east-1',
    endpoint: 'https://s3.us-east-1.amazonaws.com',
    icon: 'HardDrive',
    color: '#FF9900'
  },
  blob: {
    provider: 'blob',
    name: 'Azure Blob Storage',
    bucket: 'datalake-analytics-eastus',
    region: 'eastus',
    endpoint: 'https://datalakeanalytics.blob.core.windows.net',
    icon: 'Database',
    color: '#008AD7'
  },
  gcs: {
    provider: 'gcs',
    name: 'GCP Cloud Storage',
    bucket: 'bigquery-staging-lake',
    region: 'us-central1',
    endpoint: 'https://storage.googleapis.com',
    icon: 'Cloud',
    color: '#4285F4'
  },
  r2: {
    provider: 'r2',
    name: 'Cloudflare R2 Objects',
    bucket: 'lakehouse-distributed-assets',
    region: 'auto',
    endpoint: 'https://pub-r2.cf-datalake.net',
    icon: 'Globe',
    color: '#F38020'
  }
};

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: 'root',
    name: 'Root',
    parentId: null,
    path: '/',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'folder_datasets',
    name: 'datasets',
    parentId: 'root',
    path: '/datasets',
    storageDestination: 's3',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'folder_sales_q1',
    name: 'sales_2026_q1',
    parentId: 'folder_datasets',
    path: '/datasets/sales_2026_q1',
    storageDestination: 's3',
    createdAt: '2026-02-15T11:30:00Z'
  },
  {
    id: 'folder_marketing',
    name: 'growth_campaigns',
    parentId: 'folder_datasets',
    path: '/datasets/growth_campaigns',
    storageDestination: 'gcs',
    createdAt: '2026-02-20T14:15:00Z'
  },
  {
    id: 'folder_finance',
    name: 'corporate_finance',
    parentId: 'root',
    path: '/corporate_finance',
    storageDestination: 'blob',
    createdAt: '2026-01-20T09:00:00Z'
  },
  {
    id: 'folder_docs',
    name: 'compliance_documents',
    parentId: 'root',
    path: '/compliance_documents',
    storageDestination: 'r2',
    createdAt: '2026-03-01T16:45:00Z'
  },
  {
    id: 'folder_media',
    name: 'product_media',
    parentId: 'root',
    path: '/product_media',
    storageDestination: 'r2',
    createdAt: '2026-03-05T12:00:00Z'
  }
];

export const INITIAL_FILES: FileMetadata[] = [
  {
    id: 'file_sales_transactions_csv',
    name: 'q1_omnichannel_sales.csv',
    originalName: 'q1_omnichannel_sales.csv',
    extension: 'csv',
    fileType: 'csv',
    mimeType: 'text/csv',
    sizeBytes: 184520,
    sizeFormatted: '180.2 KB',
    folderId: 'folder_sales_q1',
    folderPath: '/datasets/sales_2026_q1',
    storageDestination: 's3',
    bucketOrContainer: 'lakehouse-raw-production',
    cloudStorageUri: 's3://lakehouse-raw-production/datasets/sales_2026_q1/q1_omnichannel_sales.csv',
    cdnDirectUrl: 'https://lakehouse-raw-production.s3.amazonaws.com/datasets/sales_2026_q1/q1_omnichannel_sales.csv',
    md5Checksum: '7d92cf44b58e3981882d9213efc991a0',
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploadedAt: '2026-03-10T09:14:22Z',
    modifiedAt: '2026-03-10T09:12:00Z',
    extraMetadata: {
      headers: ['transaction_id', 'customer_id', 'product_category', 'amount', 'tax', 'payment_method', 'transaction_date', 'region', 'status'],
      rowCount: 1250,
      columnCount: 9,
      sampleRows: [
        { transaction_id: 'TXN-9021', customer_id: 'CUST-1044', product_category: 'Enterprise SaaS', amount: 4890.00, tax: 391.20, payment_method: 'ACH Transfer', transaction_date: '2026-03-01T10:14:00Z', region: 'US-East', status: 'COMPLETED' },
        { transaction_id: 'TXN-9022', customer_id: 'CUST-2189', product_category: 'Compute Clusters', amount: 12400.50, tax: 992.04, payment_method: 'Corporate Card', transaction_date: '2026-03-01T11:22:15Z', region: 'EMEA', status: 'COMPLETED' },
        { transaction_id: 'TXN-9023', customer_id: 'CUST-3310', product_category: 'Cloud Storage Tier', amount: 840.00, tax: 67.20, payment_method: 'Corporate Card', transaction_date: '2026-03-02T08:05:40Z', region: 'APAC', status: 'COMPLETED' },
        { transaction_id: 'TXN-9024', customer_id: 'CUST-1044', product_category: 'Security Add-on', amount: 1500.00, tax: 120.00, payment_method: 'ACH Transfer', transaction_date: '2026-03-02T13:40:10Z', region: 'US-East', status: 'COMPLETED' },
        { transaction_id: 'TXN-9025', customer_id: 'CUST-4091', product_category: 'Enterprise SaaS', amount: 6200.00, tax: 496.00, payment_method: 'Wire Transfer', transaction_date: '2026-03-03T15:10:00Z', region: 'US-West', status: 'COMPLETED' },
        { transaction_id: 'TXN-9026', customer_id: 'CUST-5221', product_category: 'Support Contract', amount: 3500.00, tax: 280.00, payment_method: 'Corporate Card', transaction_date: '2026-03-04T09:30:00Z', region: 'EMEA', status: 'COMPLETED' },
        { transaction_id: 'TXN-9027', customer_id: 'CUST-6112', product_category: 'Compute Clusters', amount: 9800.00, tax: 784.00, payment_method: 'ACH Transfer', transaction_date: '2026-03-05T16:45:00Z', region: 'US-East', status: 'COMPLETED' },
        { transaction_id: 'TXN-9028', customer_id: 'CUST-7088', product_category: 'Cloud Storage Tier', amount: 1120.00, tax: 89.60, payment_method: 'PayPal B2B', transaction_date: '2026-03-06T14:12:00Z', region: 'APAC', status: 'REFUNDED' }
      ]
    },
    targetBigQueryTable: 'sales_transactions',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260310_sales_01',
    ingestedAt: '2026-03-10T09:15:00Z',
    tags: ['CSV', 'REVENUE', 'S3', 'SALES']
  },
  {
    id: 'file_customer_churn_xlsx',
    name: 'q1_churn_telemetry_model.xlsx',
    originalName: 'q1_churn_telemetry_model.xlsx',
    extension: 'xlsx',
    fileType: 'excel',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 421090,
    sizeFormatted: '411.2 KB',
    folderId: 'folder_datasets',
    folderPath: '/datasets',
    storageDestination: 'gcs',
    bucketOrContainer: 'bigquery-staging-lake',
    cloudStorageUri: 'gs://bigquery-staging-lake/datasets/q1_churn_telemetry_model.xlsx',
    cdnDirectUrl: 'https://storage.googleapis.com/bigquery-staging-lake/datasets/q1_churn_telemetry_model.xlsx',
    md5Checksum: '81a4b9c1d2e3f405162738495a6b7c8d',
    sha256Checksum: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    uploadedAt: '2026-03-08T14:20:10Z',
    modifiedAt: '2026-03-08T14:18:00Z',
    extraMetadata: {
      sheetNames: ['CustomerScores', 'HistoricalCohort', 'RiskFactors'],
      headers: ['customer_id', 'tenure_months', 'monthly_charges', 'contract_type', 'churn_flag', 'support_tickets', 'last_active_date'],
      rowCount: 850,
      columnCount: 7,
      sampleRows: [
        { customer_id: 'CUST-1001', tenure_months: 24, monthly_charges: 149.99, contract_type: 'Two-year', churn_flag: false, support_tickets: 1, last_active_date: '2026-03-08' },
        { customer_id: 'CUST-1002', tenure_months: 3, monthly_charges: 299.00, contract_type: 'Month-to-month', churn_flag: true, support_tickets: 6, last_active_date: '2026-02-14' },
        { customer_id: 'CUST-1003', tenure_months: 18, monthly_charges: 189.50, contract_type: 'One-year', churn_flag: false, support_tickets: 2, last_active_date: '2026-03-07' },
        { customer_id: 'CUST-1004', tenure_months: 6, monthly_charges: 450.00, contract_type: 'Month-to-month', churn_flag: true, support_tickets: 8, last_active_date: '2026-02-28' },
        { customer_id: 'CUST-1005', tenure_months: 36, monthly_charges: 120.00, contract_type: 'Two-year', churn_flag: false, support_tickets: 0, last_active_date: '2026-03-09' }
      ]
    },
    targetBigQueryTable: 'customer_churn_analytics',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260308_churn_02',
    ingestedAt: '2026-03-08T14:21:05Z',
    tags: ['EXCEL', 'CHURN', 'GCS', 'ML']
  },
  {
    id: 'file_financial_ledger_csv',
    name: 'general_ledger_q1_posted.csv',
    originalName: 'general_ledger_q1_posted.csv',
    extension: 'csv',
    fileType: 'csv',
    mimeType: 'text/csv',
    sizeBytes: 256800,
    sizeFormatted: '250.7 KB',
    folderId: 'folder_finance',
    folderPath: '/corporate_finance',
    storageDestination: 'blob',
    bucketOrContainer: 'datalake-analytics-eastus',
    cloudStorageUri: 'blob://datalake-analytics-eastus/corporate_finance/general_ledger_q1_posted.csv',
    cdnDirectUrl: 'https://datalakeanalytics.blob.core.windows.net/corporate_finance/general_ledger_q1_posted.csv',
    md5Checksum: '4f29a081c7e6d5b3a1928374650f9e8d',
    sha256Checksum: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    uploadedAt: '2026-03-05T11:00:00Z',
    modifiedAt: '2026-03-05T10:45:00Z',
    extraMetadata: {
      headers: ['entry_id', 'account_code', 'debit', 'credit', 'fiscal_period', 'cost_center', 'posted_at'],
      rowCount: 640,
      columnCount: 7,
      sampleRows: [
        { entry_id: 'JE-2026-001', account_code: '1010-CASH', debit: 450000.00, credit: 0.00, fiscal_period: '2026-Q1', cost_center: 'TREASURY', posted_at: '2026-01-02T08:00:00Z' },
        { entry_id: 'JE-2026-002', account_code: '4010-REVENUE', debit: 0.00, credit: 450000.00, fiscal_period: '2026-Q1', cost_center: 'SALES', posted_at: '2026-01-02T08:00:00Z' },
        { entry_id: 'JE-2026-003', account_code: '5020-INFRASTRUCTURE', debit: 62400.00, credit: 0.00, fiscal_period: '2026-Q1', cost_center: 'ENG', posted_at: '2026-01-15T12:00:00Z' },
        { entry_id: 'JE-2026-004', account_code: '2010-AP', debit: 0.00, credit: 62400.00, fiscal_period: '2026-Q1', cost_center: 'FIN', posted_at: '2026-01-15T12:00:00Z' }
      ]
    },
    targetBigQueryTable: 'financial_ledger_records',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260305_ledger_03',
    ingestedAt: '2026-03-05T11:01:20Z',
    tags: ['LEDGER', 'FINANCE', 'AZURE', 'CSV']
  },
  {
    id: 'file_growth_campaign_csv',
    name: 'adwords_attribution_conversions.csv',
    originalName: 'adwords_attribution_conversions.csv',
    extension: 'csv',
    fileType: 'csv',
    mimeType: 'text/csv',
    sizeBytes: 98120,
    sizeFormatted: '95.8 KB',
    folderId: 'folder_marketing',
    folderPath: '/datasets/growth_campaigns',
    storageDestination: 'gcs',
    bucketOrContainer: 'bigquery-staging-lake',
    cloudStorageUri: 'gs://bigquery-staging-lake/datasets/growth_campaigns/adwords_attribution_conversions.csv',
    cdnDirectUrl: 'https://storage.googleapis.com/bigquery-staging-lake/datasets/growth_campaigns/adwords_attribution_conversions.csv',
    md5Checksum: 'a8b9c0d1e2f31425364758697a8b9c0d',
    sha256Checksum: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    uploadedAt: '2026-03-02T16:00:00Z',
    modifiedAt: '2026-03-02T15:50:00Z',
    extraMetadata: {
      headers: ['lead_id', 'campaign_source', 'conversions', 'cost_per_lead', 'utm_medium', 'lead_score', 'created_at'],
      rowCount: 420,
      columnCount: 7,
      sampleRows: [
        { lead_id: 'LEAD-901', campaign_source: 'Google Ads Search', conversions: 42, cost_per_lead: 84.50, utm_medium: 'cpc', lead_score: 88.5, created_at: '2026-02-10T11:00:00Z' },
        { lead_id: 'LEAD-902', campaign_source: 'LinkedIn B2B Sponsored', conversions: 28, cost_per_lead: 142.00, utm_medium: 'paid_social', lead_score: 94.0, created_at: '2026-02-12T14:30:00Z' },
        { lead_id: 'LEAD-903', campaign_source: 'Organic SEO Lakehouse', conversions: 89, cost_per_lead: 12.30, utm_medium: 'organic', lead_score: 76.2, created_at: '2026-02-15T09:15:00Z' },
        { lead_id: 'LEAD-904', campaign_source: 'Cloud Summit Webinar', conversions: 65, cost_per_lead: 45.00, utm_medium: 'event', lead_score: 91.8, created_at: '2026-02-20T17:00:00Z' }
      ]
    },
    targetBigQueryTable: 'marketing_campaign_leads',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260302_leads_04',
    ingestedAt: '2026-03-02T16:02:10Z',
    tags: ['MARKETING', 'LEADS', 'GCS', 'CSV']
  },
  {
    id: 'file_compliance_pdf',
    name: 'SOC2_Type_II_Audit_Report_2026.pdf',
    originalName: 'SOC2_Type_II_Audit_Report_2026.pdf',
    extension: 'pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    sizeBytes: 3450200,
    sizeFormatted: '3.3 MB',
    folderId: 'folder_docs',
    folderPath: '/compliance_documents',
    storageDestination: 'r2',
    bucketOrContainer: 'lakehouse-distributed-assets',
    cloudStorageUri: 'r2://lakehouse-distributed-assets/compliance_documents/SOC2_Type_II_Audit_Report_2026.pdf',
    cdnDirectUrl: 'https://pub-r2.cf-datalake.net/compliance_documents/SOC2_Type_II_Audit_Report_2026.pdf',
    md5Checksum: '112233445566778899aabbccddeeff00',
    sha256Checksum: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    uploadedAt: '2026-03-01T17:00:00Z',
    modifiedAt: '2026-02-28T18:00:00Z',
    extraMetadata: {
      pageCount: 48,
      title: 'SOC 2 Type II Independent Service Auditor Report',
      author: 'Deloitte Risk & Financial Advisory LLP'
    },
    targetBigQueryTable: 'unstructured_document_index',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260301_pdf_05',
    ingestedAt: '2026-03-01T17:01:00Z',
    tags: ['PDF', 'COMPLIANCE', 'SOC2', 'R2']
  },
  {
    id: 'file_data_governance_docx',
    name: 'Enterprise_Data_Governance_SLA.docx',
    originalName: 'Enterprise_Data_Governance_SLA.docx',
    extension: 'docx',
    fileType: 'word',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 854000,
    sizeFormatted: '834.0 KB',
    folderId: 'folder_docs',
    folderPath: '/compliance_documents',
    storageDestination: 'r2',
    bucketOrContainer: 'lakehouse-distributed-assets',
    cloudStorageUri: 'r2://lakehouse-distributed-assets/compliance_documents/Enterprise_Data_Governance_SLA.docx',
    cdnDirectUrl: 'https://pub-r2.cf-datalake.net/compliance_documents/Enterprise_Data_Governance_SLA.docx',
    md5Checksum: '0102030405060708090a0b0c0d0e0f10',
    sha256Checksum: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    uploadedAt: '2026-03-01T17:10:00Z',
    modifiedAt: '2026-02-27T10:15:00Z',
    extraMetadata: {
      wordCount: 14200,
      title: 'Enterprise BigQuery Data Warehouse SLA Specification',
      author: 'Office of the Chief Data Officer'
    },
    targetBigQueryTable: 'unstructured_document_index',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260301_docx_06',
    ingestedAt: '2026-03-01T17:11:00Z',
    tags: ['WORD', 'GOVERNANCE', 'SLA', 'R2']
  },
  {
    id: 'file_architecture_diagram_png',
    name: 'cloud_lakehouse_topology.png',
    originalName: 'cloud_lakehouse_topology.png',
    extension: 'png',
    fileType: 'image',
    mimeType: 'image/png',
    sizeBytes: 1540200,
    sizeFormatted: '1.47 MB',
    folderId: 'folder_media',
    folderPath: '/product_media',
    storageDestination: 'r2',
    bucketOrContainer: 'lakehouse-distributed-assets',
    cloudStorageUri: 'r2://lakehouse-distributed-assets/product_media/cloud_lakehouse_topology.png',
    cdnDirectUrl: 'https://pub-r2.cf-datalake.net/product_media/cloud_lakehouse_topology.png',
    md5Checksum: '99887766554433221100ffeeddccbbaa',
    sha256Checksum: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    uploadedAt: '2026-03-05T12:30:00Z',
    modifiedAt: '2026-03-05T12:20:00Z',
    extraMetadata: {
      width: 2560,
      height: 1440,
      aspectRatio: '16:9',
      colorSpace: 'sRGB (Display P3 profile)'
    },
    targetBigQueryTable: 'unstructured_document_index',
    ingestionStatus: 'ingested',
    ingestionJobId: 'bq_job_20260305_img_07',
    ingestedAt: '2026-03-05T12:31:00Z',
    tags: ['IMAGE', 'TOPOLOGY', 'ARCHITECTURE', 'PNG']
  }
];
