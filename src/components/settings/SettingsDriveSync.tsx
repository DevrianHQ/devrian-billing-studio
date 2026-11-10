import React, { useState } from 'react';
import { GoogleDriveSyncService, DriveSyncConfig } from '../../services/googleDriveSync';
import { DRIVE_SYNC_SCRIPT_TEMPLATE } from '../../services/googleScriptTemplate';
import { StorageService } from '../../services/storage';
import {
  Cloud,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
} from 'lucide-react';

interface SettingsDriveSyncProps {
  includeSigInBackup: boolean;
  onRefreshParent: () => void;
}

export const SettingsDriveSync: React.FC<SettingsDriveSyncProps> = ({
  includeSigInBackup,
  onRefreshParent,
}) => {
  const [driveConfig, setDriveConfig] = useState<DriveSyncConfig>(() => GoogleDriveSyncService.getConfig());
  const [driveTestStatus, setDriveTestStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [drivePulling, setDrivePulling] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

  const handleTestDriveConnection = async () => {
    if (!driveConfig.url) {
      setDriveTestStatus({ status: 'error', message: 'Please enter your Google Apps Script Web App URL first.' });
      return;
    }
    setDriveTestStatus({ status: 'loading', message: 'Testing Google Drive connection...' });
    const result = await GoogleDriveSyncService.testConnection(driveConfig.url, driveConfig.secretPin);
    if (result.success) {
      setDriveTestStatus({ status: 'success', message: result.message || 'Connection successful! Google Drive folder structure verified.' });
      GoogleDriveSyncService.saveConfig(driveConfig.url, driveConfig.autoSync, driveConfig.secretPin);
      // Auto-push master database to create folders right away on successful connection
      try {
        const backupData = StorageService.exportFullBackup(includeSigInBackup);
        GoogleDriveSyncService.syncDatabase(backupData, driveConfig.url, driveConfig.secretPin).catch(console.warn);
      } catch (err) {
        console.warn('Initial background sync note:', err);
      }
    } else {
      setDriveTestStatus({ status: 'error', message: result.message || 'Connection failed. Please check the Web App URL and permissions.' });
    }
  };

  const handleSyncToDriveNow = async () => {
    if (!driveConfig.url) {
      alert('Please configure your Google Apps Script URL first.');
      return;
    }
    setDriveSyncing(true);
    try {
      const backupData = StorageService.exportFullBackup(includeSigInBackup);
      const res = await GoogleDriveSyncService.syncDatabase(backupData, driveConfig.url, driveConfig.secretPin);
      if (res.success) {
        setDriveConfig(GoogleDriveSyncService.getConfig());
        alert(res.message || 'All Invoices, Receipts, Clients, and Settings synced to Google Drive successfully!');
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
      alert('Please configure your Google Apps Script URL first.');
      return;
    }
    const confirm = window.confirm(
      'This will download your latest devrian_database.json from Google Drive and merge/restore it into this studio. Continue?'
    );
    if (!confirm) return;

    setDrivePulling(true);
    try {
      const res = await GoogleDriveSyncService.fetchDatabase(driveConfig.url, driveConfig.secretPin);
      if (res.success && res.data) {
        StorageService.importFullBackup(res.data);
        onRefreshParent();
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
    <div className="p-5 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Cloud size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Google Drive Cloud Sync &amp; Auto-Backup
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
            <li>Click <strong className="text-white">"Deploy"</strong>, review &amp; allow Google permissions, then copy the generated <strong className="text-white">Web app URL</strong>.</li>
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
                GoogleDriveSyncService.saveConfig(driveConfig.url, val, driveConfig.secretPin);
              }}
              className="accent-white cursor-pointer"
            />
            <label htmlFor="autoDriveSync" className="text-xs text-neutral-300 font-medium cursor-pointer">
              Auto-sync database on Save · Upload PDF to Drive on Download
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

            <a
              href="https://drive.google.com/drive/search?q=DEVRIAN%20AGENCY"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 transition"
              title="Opens DEVRIAN AGENCY folder in Google Drive in a new tab"
            >
              <ExternalLink size={13} className="text-emerald-400" />
              <span>Open in Drive</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
