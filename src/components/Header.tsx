import React from 'react';
import { 
  FolderGit2, 
  Database, 
  Layers, 
  BarChart3, 
  Code2, 
  UploadCloud, 
  CloudSun, 
  Moon
} from 'lucide-react';
import { CloudProvider } from '../types';
import { CLOUD_PROVIDERS_CONFIG } from '../mock/sampleData';

interface HeaderProps {
  activeTab: 'explorer' | 'postgres' | 'bigquery' | 'pandas' | 'fastapi';
  setActiveTab: (tab: 'explorer' | 'postgres' | 'bigquery' | 'pandas' | 'fastapi') => void;
  selectedCloud: CloudProvider;
  setSelectedCloud: (provider: CloudProvider) => void;
  onOpenUpload: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCloud,
  setSelectedCloud,
  onOpenUpload,
  isDarkMode,
  setIsDarkMode
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold">
          <FolderGit2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap">
          OmniStore Lakehouse
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'explorer'
              ? 'text-sky-400 border-sky-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>File Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('postgres')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'postgres'
              ? 'text-sky-400 border-sky-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>PostgreSQL Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('bigquery')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'bigquery'
              ? 'text-sky-400 border-sky-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>BigQuery Warehouse</span>
        </button>

        <button
          onClick={() => setActiveTab('pandas')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'pandas'
              ? 'text-sky-400 border-sky-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Pandas &amp; Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('fastapi')}
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'fastapi'
              ? 'text-sky-400 border-sky-400 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>FastAPI Engine</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action + cloud destination selector */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Storage Quick Switcher */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs">
          <span className="text-slate-400 font-medium">Cloud Target:</span>
          <select
            value={selectedCloud}
            onChange={(e) => setSelectedCloud(e.target.value as CloudProvider)}
            aria-label="Cloud Target"
            className="bg-transparent text-sky-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="s3" className="bg-slate-800 text-white">AWS S3 (us-east-1)</option>
            <option value="blob" className="bg-slate-800 text-white">Azure Blob (eastus)</option>
            <option value="gcs" className="bg-slate-800 text-white">GCP Cloud Storage (us-central1)</option>
            <option value="r2" className="bg-slate-800 text-white">Cloudflare R2 (auto)</option>
          </select>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm shadow-sky-600/30 transition-colors whitespace-nowrap shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Switch to Windows Light Mode" : "Switch to Windows Dark Mode"}
          aria-label={isDarkMode ? "Switch to Windows Light Mode" : "Switch to Windows Dark Mode"}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <CloudSun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
