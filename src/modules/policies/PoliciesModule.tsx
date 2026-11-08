import React, { useState, useEffect, useRef } from 'react';
import {
  FileEdit,
  Sliders,
  Calculator,
  FileDown,
  FileCheck2,
  History,
  Eye,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Layers,
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

export const PoliciesModule: React.FC = () => {
  // Feature flag check
  if (!POLICIES_MODULE_ENABLED) {
    return (
      <div className="p-8 text-center text-neutral-400">
        Terms &amp; Policies module is currently disabled.
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<PolicyTab>('editor');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

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

  // Autosave to isolated storage namespace
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

  // Version save handler
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
      <div className="policies-module-root flex flex-col min-h-screen bg-[#121212] text-neutral-200">
        {/* Module Sub-Header & Navigation */}
        <div className="bg-[#171717] border-b border-neutral-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
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

          {/* Module Tab Pills */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 custom-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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

          {/* Right Toolbar: Live Preview Toggle & Backup */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                showLivePreview
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              title="Toggle Live A4 PDF Preview"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Preview</span>
            </button>

            {/* Isolated Backup Menu */}
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

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Active Tab Panel (Left) */}
          <div
            className={`p-4 sm:p-6 overflow-y-auto custom-scrollbar transition-all duration-200 ${
              showLivePreview ? 'w-full lg:w-7/12 xl:w-3/5' : 'w-full'
            }`}
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

          {/* Live Preview Panel (Right) */}
          {showLivePreview && (
            <div className="hidden lg:block lg:w-5/12 xl:w-2/5 border-l border-neutral-800 h-[calc(100vh-4rem)] sticky top-16">
              <PoliciesPreview
                clauses={clauses}
                variables={variables}
                settings={settings}
                versions={versions}
                logoUrl={logoUrl}
                signatureUrl={signatureUrl}
                onSave={() => {
                  PoliciesStorage.saveClauses(clauses);
                  PoliciesStorage.saveVariables(variables);
                  PoliciesStorage.saveSettings(settings);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </PoliciesErrorBoundary>
  );
};

export default PoliciesModule;

