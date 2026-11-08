import { AppBackupData } from './storage';

const STORAGE_KEYS = {
  GDRIVE_URL: 'devrian_gdrive_sync_url_v1',
  GDRIVE_AUTO_SYNC: 'devrian_gdrive_auto_sync_v1',
  GDRIVE_LAST_SYNC: 'devrian_gdrive_last_sync_v1',
  GDRIVE_PIN: 'devrian_gdrive_secret_pin_v1',
};

export interface DriveSyncConfig {
  url: string;
  secretPin: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
}

export const GoogleDriveSyncService = {
  getConfig(): DriveSyncConfig {
    return {
      url: localStorage.getItem(STORAGE_KEYS.GDRIVE_URL) || '',
      secretPin: localStorage.getItem(STORAGE_KEYS.GDRIVE_PIN) ?? 'DEVRIAN@2026',
      autoSync: localStorage.getItem(STORAGE_KEYS.GDRIVE_AUTO_SYNC) === 'true',
      lastSyncedAt: localStorage.getItem(STORAGE_KEYS.GDRIVE_LAST_SYNC),
    };
  },

  saveConfig(url: string, autoSync: boolean, secretPin?: string): void {
    localStorage.setItem(STORAGE_KEYS.GDRIVE_URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.GDRIVE_AUTO_SYNC, autoSync ? 'true' : 'false');
    if (secretPin !== undefined) {
      localStorage.setItem(STORAGE_KEYS.GDRIVE_PIN, secretPin.trim());
    }
  },

  setLastSynced(isoDate: string): void {
    localStorage.setItem(STORAGE_KEYS.GDRIVE_LAST_SYNC, isoDate);
  },

  /**
   * Test the connection to the Google Apps Script Web App
   */
  async testConnection(scriptUrl?: string, secretPin?: string): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = (scriptUrl || config.url).trim();
    const pin = (secretPin !== undefined ? secretPin : config.secretPin).trim();

    if (!targetUrl) {
      return { success: false, message: 'Google Apps Script URL is empty.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'ping',
          secretPin: pin,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json && json.success) {
        return { success: true, message: json.message || 'Connected to Google Drive successfully!' };
      }
      return { success: false, message: json.error || 'Received unsuccessful response from Google Script.' };
    } catch (err: any) {
      console.error('Drive connection test failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to connect. Please check the Web App URL and deployment permissions ("Anyone").',
      };
    }
  },

  /**
   * Sync the full database (documents, clients, settings) to Google Drive
   */
  async syncDatabase(
    payload: AppBackupData,
    scriptUrl?: string,
    secretPin?: string
  ): Promise<{ success: boolean; message: string; updatedAt?: string }> {
    const config = this.getConfig();
    const targetUrl = (scriptUrl || config.url).trim();
    const pin = (secretPin !== undefined ? secretPin : config.secretPin).trim();

    if (!targetUrl) {
      return { success: false, message: 'Google Drive sync URL is not configured.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'syncDatabase',
          secretPin: pin,
          payload,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json && json.success) {
        const now = new Date().toISOString();
        this.setLastSynced(now);
        return { success: true, message: 'Database backed up to Google Drive.', updatedAt: now };
      }
      return { success: false, message: json.error || 'Failed to sync database to Drive.' };
    } catch (err: any) {
      console.error('Drive syncDatabase error:', err);
      return { success: false, message: err.message || 'Network error during Google Drive sync.' };
    }
  },

  /**
   * Fetch the latest database from Google Drive
   */
  async fetchDatabase(
    scriptUrl?: string,
    secretPin?: string
  ): Promise<{ success: boolean; data?: AppBackupData; message?: string }> {
    const config = this.getConfig();
    const targetUrl = (scriptUrl || config.url).trim();
    const pin = (secretPin !== undefined ? secretPin : config.secretPin).trim();

    if (!targetUrl) {
      return { success: false, message: 'Google Drive sync URL is not configured.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'fetchDatabase',
          secretPin: pin,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json && json.success && json.data) {
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message || json.error || 'No database found on Google Drive.' };
    } catch (err: any) {
      console.error('Drive fetchDatabase error:', err);
      return { success: false, message: err.message || 'Failed to fetch database from Google Drive.' };
    }
  },

  /**
   * Upload an exported PDF file directly into Invoices or Receipts folder on Google Drive
   */
  async uploadPdf(
    docType: 'invoice' | 'receipt',
    fileName: string,
    pdfBase64: string,
    scriptUrl?: string,
    secretPin?: string
  ): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const targetUrl = (scriptUrl || config.url).trim();
    const pin = (secretPin !== undefined ? secretPin : config.secretPin).trim();

    if (!targetUrl) {
      return { success: false, message: 'Google Drive sync URL is not configured.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'uploadPdf',
          secretPin: pin,
          docType,
          fileName,
          base64Pdf: pdfBase64,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (json && json.success) {
        return { success: true, message: json.message || `Uploaded ${fileName} to Drive.` };
      }
      return { success: false, message: json.error || 'Failed to upload PDF to Drive.' };
    } catch (err: any) {
      console.error('Drive uploadPdf error:', err);
      return { success: false, message: err.message || 'Network error while uploading PDF to Drive.' };
    }
  },
};
