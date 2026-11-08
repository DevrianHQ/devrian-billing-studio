import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileEdit,
  Sliders,
  Calculator,
  FileDown,
  FileCheck2,
  History,
  Eye,
  Columns2,
  Maximize2,
  Download,
  Upload,
  Layers,
  GripVertical,
} from 'lucide-react';
import {
  Clause,
  PolicyVariables,
  DocumentVersion,
  AcceptanceRecord,
  PolicySettings,
  PolicyTab,
} from './types';
import { PoliciesStorage } from './utils/storageAdapter';
import { ClauseEditor } from './components/editor/ClauseEditor';
import { PolicyVariablesView } from './components/variables/PolicyVariablesView';
import { RefundCalculatorView } from './components/calculator/RefundCalculatorView';
import { DocumentsExportView } from './components/documents/DocumentsExportView';
import { AcceptanceLogView } from './components/acceptance/AcceptanceLogView';
import { VersionHistoryView } from './components/versions/VersionHistoryView';
import { PoliciesPreview } from './components/preview/PoliciesPreview';
import { PoliciesErrorBoundary } from './components/PoliciesErrorBoundary';

export const POLICIES_MODULE_ENABLED = true;

export type ViewLayoutMode = 'editor' | 'split' | 'preview';

export const PoliciesModule: React.FC = () => {
  if (!POLICIES_MODULE_ENABLED) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Terms &amp; Policies module is currently disabled.
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<PolicyTab>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devrian.policies.v1.active_tab');
      const validTabs: PolicyTab[] = ['editor', 'variables', 'calculator', 'documents', 'acceptance', 'versions'];
      if (saved && validTabs.includes(saved as PolicyTab)) return saved as PolicyTab;
    }
    return 'editor';
  });
  const [viewMode, setViewMode] = useState<ViewLayoutMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devrian.policies.v1.view_mode');
      const validModes: ViewLayoutMode[] = ['editor', 'split', 'preview'];
      if (saved && validModes.includes(saved as ViewLayoutMode)) return saved as ViewLayoutMode;
    }
    return 'split';
  });
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devrian.policies.v1.split_ratio');
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed >= 20 && parsed <= 80) return parsed;
    }
    return 50;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleTabChange = useCallback((tab: PolicyTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devrian.policies.v1.active_tab', tab);
    }
  }, []);

  const handleViewModeChange = useCallback((mode: ViewLayoutMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devrian.policies.v1.view_mode', mode);
    }
  }, []);

  const handleSplitRatioChange = useCallback((ratio: number) => {
    setSplitRatio(ratio);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devrian.policies.v1.split_ratio', String(ratio));
    }
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  // Module state
  const [clauses, setClauses] = useState<Clause[]>(() => PoliciesStorage.loadClauses());
  const [variables, setVariables] = useState<PolicyVariables>(() => PoliciesStorage.loadVariables());
  const [versions, setVersions] = useState<DocumentVersion[]>(() => PoliciesStorage.loadVersions());
  const [acceptanceLog, setAcceptanceLog] = useState<AcceptanceRecord[]>(() =>
    PoliciesStorage.loadAcceptanceLog()
  );
  const [settings, setSettings] = useState<PolicySettings>(() => PoliciesStorage.loadSettings());

  // Shared read-only assets
  const logoUrl = PoliciesStorage.getAppLogoUrl();
  const signatureUrl = PoliciesStorage.getAppSignatureImage();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autosave to storage
  useEffect(() => {
    PoliciesStorage.saveClauses(clauses);
  }, [clauses]);

  useEffect(() => {
    PoliciesStorage.saveVariables(variables);
  }, [variables]);

  useEffect(() => {
    PoliciesStorage.saveVersions(versions);
  }, [versions]);

  useEffect(() => {
    PoliciesStorage.saveAcceptanceLog(acceptanceLog);
  }, [acceptanceLog]);

  useEffect(() => {
    PoliciesStorage.saveSettings(settings);
  }, [settings]);

  // Draggable Splitter Handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = (offsetX / rect.width) * 100;
      // Clamp between 25% and 75%
      const clamped = Math.min(Math.max(percentage, 25), 75);
      setSplitRatio(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // Tab definitions
  const tabs: { id: PolicyTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'editor',
      label: 'Clause Library & Editor',
      icon: <FileEdit size={14} />,
      badge: clauses.filter((c) => c.status === 'SUGGESTED' && !c.isReviewed).length || undefined,
    },
    { id: 'variables', label: 'Policy Variables', icon: <Sliders size={14} /> },
    { id: 'calculator', label: 'Refund Calculator', icon: <Calculator size={14} /> },
    { id: 'documents', label: 'Documents & Exports', icon: <FileDown size={14} /> },
    {
      id: 'acceptance',
      label: 'Acceptance Log',
      icon: <FileCheck2 size={14} />,
      badge: acceptanceLog.length || undefined,
    },
    {
      id: 'versions',
      label: 'Version History',
      icon: <History size={14} />,
      badge: versions.length || undefined,
    },
  ];

  // Backup Export / Import Handlers
  const handleExportBackup = () => {
    PoliciesStorage.exportBackup();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = PoliciesStorage.importBackup(content);
      if (success) {
        setClauses(PoliciesStorage.loadClauses());
        setVariables(PoliciesStorage.loadVariables());
        setVersions(PoliciesStorage.loadVersions());
        setAcceptanceLog(PoliciesStorage.loadAcceptanceLog());
        setSettings(PoliciesStorage.loadSettings());
        alert('Policies module backup restored successfully!');
      } else {
        alert('Invalid policies backup file format.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveNewVersion = (newVer: DocumentVersion) => {
    const updated = [newVer, ...versions];
    setVersions(updated);
    setSettings((s) => ({
      ...s,
      currentVersion: newVer.version,
      effectiveDate: newVer.effectiveDate,
      lastUpdated: new Date().toISOString().slice(0, 10),
    }));
  };

  const handleRestoreVersion = (ver: DocumentVersion) => {
    setClauses(JSON.parse(JSON.stringify(ver.clausesSnapshot)));
    setVariables(JSON.parse(JSON.stringify(ver.variablesSnapshot)));
    setSettings((s) => ({
      ...s,
      currentVersion: ver.version,
      effectiveDate: ver.effectiveDate,
      lastUpdated: new Date().toISOString().slice(0, 10),
    }));
    alert(`Restored to milestone version v${ver.version}.`);
  };

  return (
    <PoliciesErrorBoundary>
      <div className="policies-module-root flex flex-col h-[calc(100vh-4rem)] bg-[#121212] text-neutral-200 overflow-hidden">
        {/* Module Sub-Header & Navigation */}
        <div className="bg-[#171717] border-b border-neutral-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
          {/* Module Title / Tag */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-black border border-neutral-700 flex items-center justify-center text-white">
                <Layers size={15} />
              </span>
              <div>
                <span className="text-xs font-bold text-white tracking-wide block">
                  DEVRIAN Terms &amp; Policies Studio
                </span>
                <span className="text-[10px] text-neutral-400 block font-mono">
                  Doc: {settings.documentNumber} &bull; Active: v{settings.currentVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Module Tab Pills (Disabled if in preview-only mode, but accessible if user switches tabs) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 custom-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    handleTabChange(tab.id);
                    if (viewMode === 'preview') {
                      handleViewModeChange('split');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        tab.id === 'editor'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-neutral-900 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Toolbar: View Mode Switcher & Backup */}
          <div className="flex items-center gap-3">
            {/* View Mode Segmented Control: Editor / Split / Preview */}
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs select-none">
              <button
                type="button"
                onClick={() => handleViewModeChange('editor')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
                  viewMode === 'editor'
                    ? 'bg-neutral-800 text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Editor Only (Hide Preview)"
              >
                <FileEdit size={13} />
                <span className="hidden xl:inline">Editor</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('split')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
                  viewMode === 'split'
                    ? 'bg-neutral-800 text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Split View (Editor & Live Preview side by side)"
              >
                <Columns2 size={13} />
                <span className="hidden xl:inline">Split</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('preview')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
                  viewMode === 'preview'
                    ? 'bg-neutral-800 text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Preview Only Mode (Full screen A4 document review)"
              >
                <Eye size={13} />
                <span className="hidden xl:inline">Preview Only</span>
              </button>
            </div>

            {/* Isolated Backup Menu */}
            <div className="flex items-center gap-1 border-l border-neutral-800 pl-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Export Policies Backup JSON"
              >
                <Download size={14} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Import Policies Backup JSON"
              >
                <Upload size={14} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Main Content Workspace */}
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
          {/* Left Panel: Active Tab / Editor View */}
          <div
            style={{
              width:
                viewMode === 'editor'
                  ? '100%'
                  : viewMode === 'preview'
                  ? '0%'
                  : `${splitRatio}%`,
              display: viewMode === 'preview' ? 'none' : 'block',
            }}
            className="h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 transition-[width] duration-75"
          >
            {activeTab === 'editor' && (
              <ClauseEditor
                clauses={clauses}
                variables={variables}
                onChange={setClauses}
                onResetAll={() => setClauses(PoliciesStorage.resetClausesToDefault())}
              />
            )}

            {activeTab === 'variables' && (
              <PolicyVariablesView
                variables={variables}
                clauses={clauses}
                onChange={setVariables}
                onResetAll={() => setVariables(PoliciesStorage.resetVariablesToDefault())}
              />
            )}

            {activeTab === 'calculator' && (
              <RefundCalculatorView
                variables={variables}
                logoUrl={logoUrl}
                signatureUrl={signatureUrl}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsExportView
                clauses={clauses}
                variables={variables}
                settings={settings}
                versions={versions}
                logoUrl={logoUrl}
                signatureUrl={signatureUrl}
                onUpdateSettings={setSettings}
              />
            )}

            {activeTab === 'acceptance' && (
              <AcceptanceLogView
                records={acceptanceLog}
                versions={versions}
                currentVersion={settings.currentVersion}
                onAddRecord={(rec) => setAcceptanceLog([rec, ...acceptanceLog])}
                onDeleteRecord={(id) => setAcceptanceLog(acceptanceLog.filter((r) => r.id !== id))}
              />
            )}

            {activeTab === 'versions' && (
              <VersionHistoryView
                currentClauses={clauses}
                currentVariables={variables}
                currentVersion={settings.currentVersion}
                versions={versions}
                onSaveNewVersion={handleSaveNewVersion}
                onRestoreVersion={handleRestoreVersion}
              />
            )}
          </div>

          {/* Draggable Vertical Splitter (Active only in Split View) */}
          {viewMode === 'split' && (
            <div
              onMouseDown={handleMouseDown}
              onDoubleClick={() => handleSplitRatioChange(50)}
              title="Drag to resize panels • Double click to center (50/50)"
              className={`w-2 hover:w-2 bg-neutral-900 border-x border-neutral-800 hover:border-neutral-600 cursor-col-resize flex items-center justify-center transition-colors select-none z-10 shrink-0 ${
                isDragging ? 'bg-neutral-700 border-neutral-500' : ''
              }`}
            >
              <div className="h-8 w-1 rounded-full bg-neutral-600 flex items-center justify-center">
                <GripVertical size={10} className="text-neutral-400" />
              </div>
            </div>
          )}

          {/* Right Panel: Live Document Preview */}
          <div
            style={{
              width:
                viewMode === 'preview'
                  ? '100%'
                  : viewMode === 'editor'
                  ? '0%'
                  : `${100 - splitRatio}%`,
              display: viewMode === 'editor' ? 'none' : 'block',
            }}
            className="h-full overflow-hidden transition-[width] duration-75"
          >
            <PoliciesPreview
              clauses={clauses}
              variables={variables}
              settings={settings}
              versions={versions}
              logoUrl={logoUrl}
              signatureUrl={signatureUrl}
              isFullscreen={viewMode === 'preview'}
              onToggleFullscreen={() =>
                handleViewModeChange(viewMode === 'preview' ? 'split' : 'preview')
              }
              onSave={() => {
                PoliciesStorage.saveClauses(clauses);
                PoliciesStorage.saveVariables(variables);
                PoliciesStorage.saveSettings(settings);
              }}
            />
          </div>
        </div>
      </div>
    </PoliciesErrorBoundary>
  );
};

export default PoliciesModule;
