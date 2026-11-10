import React, { useState } from 'react';
import { 
  FolderGit2, 
  Database, 
  Layers, 
  BarChart3, 
  Code2, 
  UploadCloud, 
  CloudSun, 
  Moon,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'explorer' as const, label: 'File Explorer', icon: FolderGit2 },
    { id: 'postgres' as const, label: 'PostgreSQL Catalog', icon: Database },
    { id: 'bigquery' as const, label: 'BigQuery Warehouse', icon: Layers },
    { id: 'pandas' as const, label: 'Pandas & Charts', icon: BarChart3 },
    { id: 'fastapi' as const, label: 'FastAPI Engine', icon: Code2 },
  ];

  return (
    <>
      <header className="flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 select-none">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold shrink-0">
            <FolderGit2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white font-display whitespace-nowrap">
            OmniStore
            <span className="hidden sm:inline text-slate-400 font-normal ml-1">Lakehouse</span>
          </span>
        </div>

        {/* Zone 2: Desktop 4-5 concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-sky-400 border-sky-400 font-semibold'
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions + Cloud target + Mobile hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Storage Quick Switcher */}
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Target:</span>
            <select
              value={selectedCloud}
              onChange={(e) => setSelectedCloud(e.target.value as CloudProvider)}
              aria-label="Cloud Target"
              className="bg-transparent text-sky-300 font-semibold focus:outline-none cursor-pointer max-w-[90px] sm:max-w-none text-xs"
            >
              <option value="s3" className="bg-slate-800 text-white">AWS S3</option>
              <option value="blob" className="bg-slate-800 text-white">Azure Blob</option>
              <option value="gcs" className="bg-slate-800 text-white">GCP Cloud Storage</option>
              <option value="r2" className="bg-slate-800 text-white">Cloudflare R2</option>
            </select>
          </div>

          {/* Primary CTA */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm shadow-sky-600/30 transition-colors whitespace-nowrap shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden xs:inline">Upload</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            {isDarkMode ? <CloudSun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle Button (< lg) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden shrink-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer / Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-col gap-1 text-sm z-30 select-none shadow-xl animate-in slide-in-from-top-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  isActive 
                    ? 'bg-sky-500/20 text-sky-300 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
