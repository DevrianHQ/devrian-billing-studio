import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile } from '../../types';
import { StorageService, AppBackupData } from '../../services/storage';
import { formatDisplayDate } from '../../services/dateUtils';
import { SignatureStudioModal } from '../common/SignatureStudioModal';
import { GoogleDriveSyncService, DriveSyncConfig } from '../../services/googleDriveSync';
import { DRIVE_SYNC_SCRIPT_TEMPLATE } from '../../services/googleScriptTemplate';
import {
  Save,
  Upload,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  PenTool,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff,
  Cloud,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  profile: BusinessProfile;
  onSaveProfile: (updated: BusinessProfile) => void;
  onRestoreData: (backup: AppBackupData) => void;
  onExportCSV: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onSaveProfile,
  onRestoreData,
}) => {
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemRate, setNewItemRate] = useState<number | ''>('');
  const [saveToast, setSaveToast] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(StorageService.getLastBackupDate());
  const [includeSigInBackup, setIncludeSigInBackup] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [showAccountNum, setShowAccountNum] = useState(false);

  // Google Drive Cloud Sync State
  const [driveConfig, setDriveConfig] = useState<DriveSyncConfig>(() => GoogleDriveSyncService.getConfig());
  const [driveTestStatus, setDriveTestStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [drivePulling, setDrivePulling] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  // Synchronize local form data if profile prop changes
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const whiteLogoInputRef = useRef<HTMLInputElement>(null);
  const blackLogoInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      onSaveProfile(next);
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('logoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWhiteLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('whiteLogoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBlackLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('blackLogoDataUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPreset = () => {
    if (!newItemTitle.trim()) return;
    const updatedPresets = [
      ...formData.itemPresets,
      { title: newItemTitle.trim(), defaultRate: newItemRate ? Number(newItemRate) : undefined },
    ];
    updateField('itemPresets', updatedPresets);
    setNewItemTitle('');
    setNewItemRate('');
  };

  const handleRemovePreset = (index: number) => {
    const updated = [...formData.itemPresets];
    updated.splice(index, 1);
    updateField('itemPresets', updated);
  };

  // Export JSON backup with security exclusion option
  const handleExportJson = () => {
    const data = StorageService.exportFullBackup(includeSigInBackup);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DEVRIAN_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackup(new Date().toISOString());
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (confirm('Importing this backup will overwrite current documents and settings. Continue?')) {
          onRestoreData(json);
          setFormData(json.businessProfile || profile);
          setLastBackup(new Date().toISOString());
          alert('Backup restored successfully!');
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Google Drive Sync Handlers
  const handleTestDriveConnection = async () => {
    if (!driveConfig.url) {
      setDriveTestStatus({ status: 'error', message: 'Please enter your Google Apps Script Web App URL first.' });
      return;
    }
    setDriveTestStatus({ status: 'loading', message: 'Connecting to Google Drive...' });
    const result = await GoogleDriveSyncService.testConnection(driveConfig.url);
    if (result.success) {
      setDriveTestStatus({ status: 'success', message: result.message });
      GoogleDriveSyncService.saveConfig(driveConfig.url, driveConfig.autoSync);
    } else {
      setDriveTestStatus({ status: 'error', message: result.message });
    }
  };

  const handleSyncToDriveNow = async () => {
    if (!driveConfig.url) {
      alert('Please enter and test your Google Apps Script Web App URL first.');
      return;
    }
    try {
      setDriveSyncing(true);
      const backupData = StorageService.exportFullBackup(includeSigInBackup);
      const res = await GoogleDriveSyncService.syncDatabase(backupData, driveConfig.url);
      if (res.success) {
        setDriveConfig(GoogleDriveSyncService.getConfig());
        alert('All Invoices, Receipts, Clients, and Settings synced to Google Drive successfully!');
      } else {
        alert(`Google Drive Sync Failed: ${res.message}`);
      }
    } catch (e: any) {
      alert(`Sync error: ${e.message}`);
    } finally {
      setDriveSyncing(false);
    }
  };

  const handlePullFromDriveNow = async () => {
    if (!driveConfig.url) {
      alert('Please enter and test your Google Apps Script Web App URL first.');
      return;
    }
    if (!confirm('This will load all documents, clients, and settings from your Google Drive. Continue?')) {
      return;
    }
    try {
      setDrivePulling(true);
      const res = await GoogleDriveSyncService.fetchDatabase(driveConfig.url);
      if (res.success && res.data) {
        onRestoreData(res.data);
        alert('All documents and clients restored from Google Drive successfully!');
      } else {
        alert(res.message || 'Could not fetch database from Google Drive.');
      }
    } catch (e: any) {
      alert(`Restore error: ${e.message}`);
    } finally {
      setDrivePulling(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(DRIVE_SYNC_SCRIPT_TEMPLATE);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Studio Settings & Business Profile</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure DEVRIAN legal identity, isolated business signature, payment methods, and backups.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold flex items-center gap-2 shadow"
        >
          <Save size={14} /> Save Changes
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} /> Settings saved successfully!
        </div>
      )}

      {/* Persistent Backup Reminder Banner */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              Data Safety & Local Storage Backup
            </span>
            <p className="text-[11px] text-neutral-400">
              {lastBackup
                ? `Last backup performed on ${formatDisplayDate(lastBackup)}. Keep your records safe with offline JSON backups.`
                : 'No backup performed yet. Download a JSON backup to keep your records safe.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 border border-neutral-700"
            >
              <Download size={13} /> Export JSON
            </button>
            <label className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 cursor-pointer">
              <Upload size={13} /> Import JSON
              <input
                type="file"
                ref={jsonInputRef}
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Security Signature Backup Toggle */}
        <div className="pt-2 border-t border-neutral-800 flex items-center gap-2">
          <input
            type="checkbox"
            id="includeSigBackup"
            checked={includeSigInBackup}
            onChange={(e) => setIncludeSigInBackup(e.target.checked)}
            className="accent-white cursor-pointer"
          />
          <label htmlFor="includeSigBackup" className="text-xs text-neutral-400 cursor-pointer">
            Include business signature in JSON backup (default OFF for security)
          </label>
        </div>
      </div>

      {/* Google Drive Cloud Sync & Auto-Backup */}
      <div className="p-5 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Cloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Google Drive Cloud Sync & Auto-Backup
                </h3>
                {driveConfig.url ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Target Account: <span className="text-neutral-200 font-medium">neelamrajput658@gmail.com</span> · Auto-creates: <code className="text-neutral-300">DEVRIAN AGENCY / PRIVATE / (DOCS + CLIENTS / [Client] / PAYMENTS)</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDriveGuide(!showDriveGuide)}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-lg border border-neutral-700/80 flex items-center gap-1.5 transition self-start sm:self-center"
          >
            <HelpCircle size={13} />
            <span>{showDriveGuide ? 'Hide Setup Guide' : 'Setup Guide (2 Min)'}</span>
          </button>
        </div>

        {/* Setup Guide Collapsible */}
        {showDriveGuide && (
          <div className="p-4 bg-neutral-950/90 border border-neutral-800 rounded-lg space-y-3 text-xs">
            <div className="font-bold text-neutral-200 flex items-center justify-between">
              <span>Quick 2-Minute Google Drive Setup:</span>
              <button
                type="button"
                onClick={handleCopyScript}
                className="px-2.5 py-1 bg-white hover:bg-neutral-200 text-black rounded text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
              >
                {scriptCopied ? <Check size={12} className="text-emerald-700" /> : <Copy size={12} />}
                <span>{scriptCopied ? 'Script Copied!' : 'Copy Google Script'}</span>
              </button>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pl-1 leading-relaxed">
              <li>
                Open <a href="https://script.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 underline inline-flex items-center gap-0.5">script.google.com <ExternalLink size={10} /></a> logged into <strong className="text-white">neelamrajput658@gmail.com</strong>.
              </li>
              <li>Click <strong className="text-white">"New project"</strong> (top-left) and name it <strong className="text-white">"DEVRIAN Drive Sync"</strong>.</li>
              <li>Delete any existing code in <code className="text-amber-300">Code.gs</code>, click the <strong>"Copy Google Script"</strong> button above, and paste it.</li>
              <li>
                Click <strong className="text-white">"Deploy"</strong> (blue button, top-right) ➔ <strong className="text-white">"New deployment"</strong>:
                <ul className="list-disc list-inside pl-4 text-neutral-400 mt-0.5 space-y-0.5">
                  <li>Click gear icon next to "Select type" ➔ Choose <strong className="text-neutral-200">"Web app"</strong></li>
                  <li>Execute as: <strong className="text-neutral-200">"Me"</strong></li>
                  <li>Who has access: <strong className="text-neutral-200">"Anyone"</strong></li>
                </ul>
              </li>
              <li>Click <strong className="text-white">"Deploy"</strong>, review & allow Google permissions, then copy the generated <strong className="text-white">Web app URL</strong>.</li>
              <li>Paste that Web app URL below and click <strong className="text-white">"Test Connection"</strong>.</li>
            </ol>
          </div>
        )}

        {/* Input & Action Row */}
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Google Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={driveConfig.url}
                onChange={(e) => {
                  const val = e.target.value;
                  setDriveConfig((prev) => ({ ...prev, url: val }));
                  GoogleDriveSyncService.saveConfig(val, driveConfig.autoSync, driveConfig.secretPin);
                }}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleTestDriveConnection}
                disabled={driveTestStatus.status === 'loading'}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold border border-neutral-700 flex items-center gap-1.5 transition shrink-0"
              >
                {driveTestStatus.status === 'loading' ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                <span>Test Connection</span>
              </button>
            </div>
            {driveTestStatus.message && (
              <p
                className={`text-[11px] mt-1.5 font-medium flex items-center gap-1.5 ${
                  driveTestStatus.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {driveTestStatus.status === 'success' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                <span>{driveTestStatus.message}</span>
              </p>
            )}
          </div>

          {/* Security PIN Field */}
          <div className="pt-2 border-t border-neutral-800/60">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase flex items-center gap-1">
                <Lock size={11} className="text-emerald-400" />
                <span>Private Security PIN Lock (Bank-Grade Protection)</span>
              </label>
              <span className="text-[10px] text-neutral-500">
                Matches <code className="text-neutral-400">SYNC_SECURITY_PIN</code> in your Google Script
              </span>
            </div>
            <input
              type="text"
              value={driveConfig.secretPin}
              onChange={(e) => {
                const val = e.target.value;
                setDriveConfig((prev) => ({ ...prev, secretPin: val }));
                GoogleDriveSyncService.saveConfig(driveConfig.url, driveConfig.autoSync, val);
              }}
              placeholder="DEVRIAN@2026"
              className="w-full sm:w-80 bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-mono font-bold tracking-wider"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Any unauthorized person with your URL is completely blocked unless they provide this exact matching PIN.
            </p>
          </div>

          {/* Sync Actions & Auto-Sync Toggle */}
          <div className="pt-2 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDriveSync"
                checked={driveConfig.autoSync}
                onChange={(e) => {
                  const val = e.target.checked;
                  setDriveConfig((prev) => ({ ...prev, autoSync: val }));
                  GoogleDriveSyncService.saveConfig(driveConfig.url, val);
                }}
                className="accent-white cursor-pointer"
              />
              <label htmlFor="autoDriveSync" className="text-xs text-neutral-300 font-medium cursor-pointer">
                Auto-sync database & upload generated PDFs to Drive on Save / Download
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncToDriveNow}
                disabled={driveSyncing || !driveConfig.url}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition ${
                  driveConfig.url
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
                }`}
                title="Pushes all clients, documents, and settings to Google Drive"
              >
                {driveSyncing ? <Loader2 size={13} className="animate-spin" /> : <Cloud size={13} />}
                <span>{driveSyncing ? 'Syncing...' : 'Sync to Drive Now'}</span>
              </button>

              <button
                type="button"
                onClick={handlePullFromDriveNow}
                disabled={drivePulling || !driveConfig.url}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 border transition ${
                  driveConfig.url
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700'
                    : 'bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed'
                }`}
                title="Fetches and restores your entire studio from Google Drive"
              >
                {drivePulling ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span>{drivePulling ? 'Restoring...' : 'Restore from Drive'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. BUSINESS PROFILE */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
            1. Business Profile (DEVRIAN)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Proprietor Name & Title
              </label>
              <input
                type="text"
                value={formData.proprietor}
                onChange={(e) => updateField('proprietor', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none font-semibold"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Official legal spelling: Dev Rajpoot, Founder & CEO
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none italic"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Header Contact Line
            </label>
            <input
              type="text"
              value={formData.contactLine || ''}
              onChange={(e) => updateField('contactLine', e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none"
              placeholder="Devrian.official@gmail.com | inquiry@devrian.in | devrian.in"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Official: Devrian.official@gmail.com | inquiry@devrian.in | devrian.in (printed under tagline on every document)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Website
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Udyam Registration No.
              </label>
              <input
                type="text"
                value={formData.udyamNo}
                onChange={(e) => updateField('udyamNo', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none font-mono"
              />
            </div>
          </div>

          {/* Address & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase">
                  Address
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] text-neutral-400">Show on documents</span>
                  <input
                    type="checkbox"
                    checked={formData.showAddress}
                    onChange={(e) => updateField('showAddress', e.target.checked)}
                    className="accent-white"
                  />
                </label>
              </div>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
              />
              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                When ON, displays "Mathura, Uttar Pradesh" (home-based business).
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-neutral-400 font-semibold uppercase">
                  Phone (Optional)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] text-neutral-400">Show on documents</span>
                  <input
                    type="checkbox"
                    checked={formData.showPhone}
                    onChange={(e) => updateField('showPhone', e.target.checked)}
                    className="accent-white"
                  />
                </label>
              </div>
              <input
                type="text"
                placeholder="+91..."
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Business GSTIN (for GST Registration Mode)
            </label>
            <input
              type="text"
              placeholder="e.g. 09ABCDE1234F1Z5"
              value={formData.businessGstin}
              onChange={(e) => updateField('businessGstin', e.target.value.toUpperCase())}
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none uppercase font-mono"
            />
          </div>
        </div>

        {/* 2. SIGNATURE STUDIO & BRAND ASSETS */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
            2. Business Signature & Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Dedicated Signature Studio */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Isolated Business Signature
                </span>
                {formData.signatureDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete business signature from storage?')) {
                        updateField('signatureDataUrl', '');
                      }
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="h-24 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center p-3 relative">
                {formData.signatureDataUrl ? (
                  <img
                    src={formData.signatureDataUrl}
                    alt="Business Signature"
                    className="max-h-full max-w-full object-contain filter invert"
                  />
                ) : (
                  <span className="text-xs text-neutral-500">No signature configured</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className="w-full py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <PenTool size={13} />
                <span>Open Signature Studio (Scan / Draw / Type)</span>
              </button>
            </div>

            {/* Document Logo Lockup Controls */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Full Logo Upload (Optional)</span>
                {formData.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('logoDataUrl', '')}
                    className="text-[11px] text-neutral-400 hover:text-red-400"
                  >
                    Reset to Built-in Lockup
                  </button>
                )}
              </div>

              <div className="h-24 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-center p-3">
                {formData.logoDataUrl ? (
                  <img
                    src={formData.logoDataUrl}
                    alt="Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-neutral-500">Built-in DEVRIAN Vector Wordmark</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold text-center"
              >
                Upload Combined PNG/SVG Logo
              </button>
              <input
                type="file"
                ref={logoInputRef}
                accept="image/png,image/svg+xml,image/jpeg"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Dedicated White & Black Logo Files */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
            <span className="text-xs font-bold text-white block">
              Official Symbol Mark Assets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* White Logo */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-neutral-300">White Mark (Black Header)</span>
                  {formData.whiteLogoDataUrl && (
                    <button
                      type="button"
                      onClick={() => updateField('whiteLogoDataUrl', '')}
                      className="text-[10px] text-neutral-400 hover:text-red-400"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
                <div className="h-16 bg-[#0E0E0E] rounded border border-neutral-800 flex items-center justify-center p-2">
                  <img
                    src={formData.whiteLogoDataUrl || '/brand/devrian-symbol-white.png'}
                    alt="White Logo"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => whiteLogoInputRef.current?.click()}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded font-medium"
                >
                  Upload White Symbol
                </button>
                <input
                  type="file"
                  ref={whiteLogoInputRef}
                  accept="image/png,image/svg+xml"
                  onChange={handleWhiteLogoUpload}
                  className="hidden"
                />
              </div>

              {/* Black Logo */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-neutral-300">Black Mark (Watermark / Light)</span>
                  {formData.blackLogoDataUrl && (
                    <button
                      type="button"
                      onClick={() => updateField('blackLogoDataUrl', '')}
                      className="text-[10px] text-neutral-400 hover:text-red-400"
                    >
                      Reset Default
                    </button>
                  )}
                </div>
                <div className="h-16 bg-white rounded border border-neutral-300 flex items-center justify-center p-2">
                  <img
                    src={formData.blackLogoDataUrl || '/brand/devrian-symbol-black.png'}
                    alt="Black Logo"
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => blackLogoInputRef.current?.click()}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded font-medium"
                >
                  Upload Black Symbol
                </button>
                <input
                  type="file"
                  ref={blackLogoInputRef}
                  accept="image/png,image/svg+xml"
                  onChange={handleBlackLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Typography Scale, Header Shapes, Watermark & Accent Controls */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4">
            <span className="text-xs font-bold text-white block">
              Layout, Geometry & Watermark Settings
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Wordmark Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-neutral-400 font-semibold uppercase">
                    Wordmark Lockup Scale
                  </label>
                  <span className="text-xs font-mono text-white font-bold">
                    {Math.round((formData.wordmarkScale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={formData.wordmarkScale || 1.0}
                  onChange={(e) => updateField('wordmarkScale', parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-neutral-500">
                  <span>Compact (70%)</span>
                  <span>Default (100%)</span>
                  <span>Prominent (150%)</span>
                </div>
              </div>

              {/* Header Diagonal Geometry Toggle */}
              <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                <div>
                  <span className="text-xs font-semibold text-white block">
                    Header Diagonal Geometry
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">
                    Subtle dark angular shapes (#1A1A1A / #151515) on header band
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showHeaderShapes !== false}
                  onChange={(e) => updateField('showHeaderShapes', e.target.checked)}
                  className="accent-white cursor-pointer w-4 h-4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-800">
              {/* Body Watermark Toggle & Opacity */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Body Watermark
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      Default OFF. Placed bottom-right, behind content.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.showWatermark === true}
                    onChange={(e) => updateField('showWatermark', e.target.checked)}
                    className="accent-white cursor-pointer w-4 h-4"
                  />
                </div>

                {formData.showWatermark && (
                  <div className="pt-2 border-t border-neutral-800 space-y-1">
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>Watermark Opacity</span>
                      <span className="font-mono text-white font-bold">
                        {((formData.watermarkOpacity || 0.025) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.06"
                      step="0.005"
                      value={formData.watermarkOpacity || 0.025}
                      onChange={(e) => updateField('watermarkOpacity', parseFloat(e.target.value))}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Accent Colour Picker */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Accent Colour</span>
                  {formData.accentColor && formData.accentColor !== '#0E0E0E' && (
                    <button
                      type="button"
                      onClick={() => updateField('accentColor', '#0E0E0E')}
                      className="text-[10px] text-neutral-400 hover:text-white"
                    >
                      Reset to Black
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor || '#0E0E0E'}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="w-9 h-9 rounded cursor-pointer bg-transparent border border-neutral-700"
                  />
                  <input
                    type="text"
                    value={formData.accentColor || '#0E0E0E'}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs px-2.5 py-1.5 rounded font-mono uppercase"
                  />
                </div>
                <span className="text-[10px] text-neutral-500 block">
                  Default: #0E0E0E (black and monochrome palette).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PAYMENT CONFIGURATION */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
            3. Payment Details Configuration
          </h2>

          {/* Bank Details */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Bank Transfer Details</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-xs text-neutral-300">Show on documents</span>
                <input
                  type="checkbox"
                  checked={formData.showBankDetails}
                  onChange={(e) => updateField('showBankDetails', e.target.checked)}
                  className="accent-white"
                />
              </label>
            </div>

            {formData.showBankDetails &&
              (!formData.bankName?.trim() ||
                !formData.bankAccountNumber?.trim() ||
                !formData.bankIfsc?.trim()) && (
                <div className="text-[11px] text-red-400 flex items-center gap-1.5 bg-red-950/40 p-2 rounded border border-red-800/40">
                  <AlertTriangle size={13} />
                  <span>
                    Warning: Bank transfer is toggled ON, but Bank Name, A/c Number, or IFSC are empty.
                    PDF export will be blocked until filled.
                  </span>
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.bankAccountName}
                  onChange={(e) => updateField('bankAccountName', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bankName}
                  onChange={(e) => updateField('bankName', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] text-neutral-400 font-semibold uppercase">
                    Account Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccountNum(!showAccountNum)}
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
                    title={showAccountNum ? 'Mask account number' : 'Reveal account number'}
                  >
                    {showAccountNum ? <EyeOff size={11} /> : <Eye size={11} />}
                    <span>{showAccountNum ? 'Mask' : 'Reveal'}</span>
                  </button>
                </div>
                <input
                  type={showAccountNum ? "text" : "password"}
                  placeholder="e.g. 50100..."
                  value={formData.bankAccountNumber}
                  onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234"
                  value={formData.bankIfsc}
                  onChange={(e) => updateField('bankIfsc', e.target.value.toUpperCase())}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none uppercase font-mono"
                />
              </div>
            </div>
          </div>

          {/* UPI Details */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">UPI Details & QR Code</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-xs text-neutral-300">Show UPI ID</span>
                  <input
                    type="checkbox"
                    checked={formData.showUpi}
                    onChange={(e) => updateField('showUpi', e.target.checked)}
                    className="accent-white"
                  />
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-xs text-neutral-300">Show UPI QR</span>
                  <input
                    type="checkbox"
                    checked={formData.showUpiQr}
                    onChange={(e) => updateField('showUpiQr', e.target.checked)}
                    className="accent-white"
                  />
                </label>
              </div>
            </div>

            {(formData.showUpi || formData.showUpiQr) && !formData.upiId?.trim() && (
              <div className="text-[11px] text-red-400 flex items-center gap-1.5 bg-red-950/40 p-2 rounded border border-red-800/40">
                <AlertTriangle size={13} />
                <span>
                  Warning: UPI is toggled ON, but UPI ID is empty. PDF export will be blocked until
                  filled.
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                UPI ID (VPA)
              </label>
              <input
                type="text"
                placeholder="e.g. inquiry@devrian.in"
                value={formData.upiId}
                onChange={(e) => updateField('upiId', e.target.value.trim())}
                className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. SERVICE PRESETS */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
            4. Service Presets
          </h2>

          <div className="space-y-2">
            {formData.itemPresets.map((preset, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-white">{preset.title}</span>
                  {preset.defaultRate ? (
                    <span className="text-xs text-neutral-400">₹{preset.defaultRate}</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePreset(idx)}
                  className="p-1 text-neutral-500 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Service Title (e.g. YouTube Video Editing)"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
            />
            <input
              type="number"
              placeholder="Default Rate ₹"
              value={newItemRate}
              onChange={(e) => setNewItemRate(e.target.value ? Number(e.target.value) : '')}
              className="w-36 bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-1.5 rounded outline-none"
            />
            <button
              type="button"
              onClick={handleAddPreset}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold flex items-center gap-1"
            >
              <Plus size={13} /> Add Preset
            </button>
          </div>
        </div>

        {/* 5. NUMBERING PATTERNS */}
        <div className="p-5 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
            5. Document Numbering Patterns
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Invoice Pattern
              </label>
              <input
                type="text"
                value={formData.invoicePattern}
                onChange={(e) => updateField('invoicePattern', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Receipt Pattern
              </label>
              <input
                type="text"
                value={formData.receiptPattern}
                onChange={(e) => updateField('receiptPattern', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Quotation Pattern
              </label>
              <input
                type="text"
                value={formData.quotationPattern}
                onChange={(e) => updateField('quotationPattern', e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white text-xs px-3 py-2 rounded outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-5 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <Save size={14} /> Save All Changes
          </button>
        </div>
      </form>

      {/* Signature Studio Modal */}
      <SignatureStudioModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={(dataUrl) => {
          updateField('signatureDataUrl', dataUrl);
          onSaveProfile({ ...formData, signatureDataUrl: dataUrl });
        }}
        onRemoveSignature={() => {
          updateField('signatureDataUrl', '');
          onSaveProfile({ ...formData, signatureDataUrl: '' });
        }}
        currentSignature={formData.signatureDataUrl}
      />
    </div>
  );
};
