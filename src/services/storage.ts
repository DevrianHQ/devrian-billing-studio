import { BillingDocument, BusinessProfile, Client } from '../types';
import { DEFAULT_BUSINESS_PROFILE, SEED_RECEIPT, SEED_INVOICE, SEED_CLIENTS } from './seedData';
import { isAfter, parseISO } from 'date-fns';
import { GoogleDriveSyncService } from './googleDriveSync';

const STORAGE_KEYS = {
  PROFILE: 'devrian_business_profile_v4',
  DOCUMENTS: 'devrian_documents_v4',
  CLIENTS: 'devrian_clients_v4',
  DRAFT: 'devrian_active_draft_v4',
  LAST_BACKUP: 'devrian_last_backup_date_v4',
};

export interface AppBackupData {
  version: string;
  exportedAt: string;
  businessProfile: BusinessProfile;
  documents: BillingDocument[];
  clients: Client[];
}

let persistTimeout: any = null;

export const StorageService = {
  /**
   * Automatically persists the current database to both:
   * 1. Local Hard Drive via Vite API (/api/storage -> d:\Personal\INVOICE GEN\data\devrian_database.json)
   * 2. Google Drive Cloud (if configured)
   * Debounced by 300ms so rapid typing doesn't overload.
   */
  persistToDiskAndCloud(): void {
    if (typeof window === 'undefined') return;
    if (persistTimeout) clearTimeout(persistTimeout);

    persistTimeout = setTimeout(async () => {
      try {
        const fullBackup = this.exportFullBackup(true);

        // 1. Local Hard Drive Persistence (Vite middleware)
        try {
          fetch('/api/storage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullBackup),
          }).catch((err) => console.warn('[Storage] Local disk write error:', err));
        } catch {
          // ignore network fetch issues
        }

        // 2. Google Drive Cloud Auto-Sync
        try {
          const driveConfig = GoogleDriveSyncService.getConfig();
          if (driveConfig.url && driveConfig.autoSync) {
            GoogleDriveSyncService.syncDatabase(fullBackup).catch((err) =>
              console.warn('[Storage] Background Google Drive sync error:', err)
            );
          }
        } catch {
          // ignore
        }
      } catch (e) {
        console.warn('[Storage] Failed to run persistToDiskAndCloud:', e);
      }
    }, 300);
  },

  // --- Profile ---
  getProfile(): BusinessProfile {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      // Fallback check older versions if v4 is missing
      if (!data) {
        const legacyKeys = [
          'devrian_business_profile_v3',
          'devrian_business_profile_v2',
          'devrian_business_profile_v1',
          'devrian_business_profile',
        ];
        for (const k of legacyKeys) {
          const legacyData = localStorage.getItem(k);
          if (legacyData) {
            data = legacyData;
            localStorage.setItem(STORAGE_KEYS.PROFILE, legacyData);
            break;
          }
        }
      }

      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_BUSINESS_PROFILE,
          ...parsed,
          upiId: parsed.upiId || 'inquiry@devrian.in',
          whiteLogoDataUrl: parsed.whiteLogoDataUrl || '/brand/devrian-symbol-pure-white.png',
          blackLogoDataUrl: parsed.blackLogoDataUrl || '/brand/devrian-symbol-dark.png',
          contactLine: parsed.contactLine || 'inquiry@devrian.in | devrian.in',
        };
      }
    } catch (e) {
      console.error('Failed to load profile from localStorage', e);
    }
    return DEFAULT_BUSINESS_PROFILE;
  },

  saveProfile(profile: BusinessProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      this.persistToDiskAndCloud();
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  // --- Documents ---
  getDocuments(): BillingDocument[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      // Fallback check older versions if v4 is missing
      if (!data) {
        const legacyKeys = [
          'devrian_documents_v3',
          'devrian_documents_v2',
          'devrian_documents_v1',
          'devrian_documents',
          'devrian_billing_documents',
        ];
        for (const k of legacyKeys) {
          const legacyData = localStorage.getItem(k);
          if (legacyData) {
            data = legacyData;
            localStorage.setItem(STORAGE_KEYS.DOCUMENTS, legacyData);
            break;
          }
        }
      }

      if (!data) {
        const initialDocs = [SEED_RECEIPT, SEED_INVOICE];
        this.saveDocuments(initialDocs);
        return initialDocs;
      }
      const docs: BillingDocument[] = JSON.parse(data);
      // Auto-update overdue status for invoices that are unpaid or partially paid
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let updated = false;

      const checkedDocs = docs.map((doc) => {
        if (doc.type === 'invoice' && (doc.status === 'UNPAID' || doc.status === 'PARTIALLY PAID') && doc.dueDate) {
          const due = parseISO(doc.dueDate);
          if (isAfter(today, due)) {
            updated = true;
            return { ...doc, status: 'OVERDUE' as const };
          }
        }
        return doc;
      });

      if (updated) {
        this.saveDocuments(checkedDocs);
      }
      return checkedDocs;
    } catch (e) {
      console.error('Failed to load documents', e);
      return [SEED_RECEIPT];
    }
  },

  saveDocuments(docs: BillingDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      this.persistToDiskAndCloud();
    } catch (e) {
      console.error('Failed to save documents', e);
    }
  },

  saveDocument(doc: BillingDocument): BillingDocument[] {
    const docs = this.getDocuments();
    const cleanNum = doc.documentNumber?.trim().toLowerCase();
    // Match by ID, or if same type & same documentNumber, update existing record to prevent duplicates
    const index = docs.findIndex(
      (d) =>
        d.id === doc.id ||
        (Boolean(cleanNum) &&
          d.type === doc.type &&
          d.documentNumber?.trim().toLowerCase() === cleanNum)
    );
    let updatedDocs: BillingDocument[];
    if (index >= 0) {
      updatedDocs = [...docs];
      // Keep original id if matched by documentNumber so cross-references remain intact
      updatedDocs[index] = { ...doc, id: docs[index].id, updatedAt: new Date().toISOString() };
    } else {
      updatedDocs = [{ ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...docs];
    }
    this.saveDocuments(updatedDocs);
    return updatedDocs;
  },

  deleteDocument(id: string): BillingDocument[] {
    const docs = this.getDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    this.saveDocuments(filtered);
    return filtered;
  },

  // --- Clients ---
  getClients(): Client[] {
    try {
      let data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      // Fallback check older versions if v4 is missing
      if (!data) {
        const legacyKeys = [
          'devrian_clients_v3',
          'devrian_clients_v2',
          'devrian_clients_v1',
          'devrian_clients',
        ];
        for (const k of legacyKeys) {
          const legacyData = localStorage.getItem(k);
          if (legacyData) {
            data = legacyData;
            localStorage.setItem(STORAGE_KEYS.CLIENTS, legacyData);
            break;
          }
        }
      }

      if (!data) {
        this.saveClients(SEED_CLIENTS);
        return SEED_CLIENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load clients', e);
      return SEED_CLIENTS;
    }
  },

  saveClients(clients: Client[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      this.persistToDiskAndCloud();
    } catch (e) {
      console.error('Failed to save clients', e);
    }
  },

  saveOrUpdateClient(clientData: Partial<Client> & { name: string }): Client {
    const clients = this.getClients();
    const cleanName = clientData.name.trim().toLowerCase();
    const cleanPhone = (clientData.phone || '').trim();
    const cleanEmail = (clientData.email || '').trim().toLowerCase();

    // Prevent duplicate clients: match by ID, Name, Phone (>=10 digits), or Email
    const existingIndex = clients.findIndex((c) => {
      if (clientData.id && c.id === clientData.id) return true;
      if (cleanName && c.name.trim().toLowerCase() === cleanName) return true;
      if (cleanPhone && cleanPhone.length >= 10 && c.phone && c.phone.trim() === cleanPhone) return true;
      if (cleanEmail && c.email && c.email.trim().toLowerCase() === cleanEmail) return true;
      return false;
    });

    let savedClient: Client;

    if (existingIndex >= 0) {
      savedClient = {
        ...clients[existingIndex],
        ...clientData,
        name: clientData.name.trim(),
      };
      clients[existingIndex] = savedClient;
    } else {
      savedClient = {
        id: clientData.id || `client-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: clientData.name.trim(),
        contactPerson: clientData.contactPerson || '',
        address: clientData.address || '',
        phone: clientData.phone || '',
        email: clientData.email || '',
        gstin: clientData.gstin || '',
        createdAt: new Date().toISOString(),
      };
      clients.unshift(savedClient);
    }

    this.saveClients(clients);
    return savedClient;
  },

  deleteClient(id: string): Client[] {
    const clients = this.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    this.saveClients(filtered);
    return filtered;
  },

  // --- Drafts ---
  saveDraft(doc: BillingDocument): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(doc));
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  },

  getDraft(): BillingDocument | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to get draft', e);
    }
    return null;
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    } catch (e) {
      console.error('Failed to clear draft', e);
    }
  },

  // --- Backup & Restore ---
  getLastBackupDate(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
  },

  setLastBackupDate(dateIso: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, dateIso);
  },

  exportFullBackup(includeSignature = false): AppBackupData {
    const currentProfile = this.getProfile();
    const exportedProfile: BusinessProfile = {
      ...currentProfile,
      // Security guardrail: EXCLUDE signature from backup unless explicitly requested
      signatureDataUrl: includeSignature ? currentProfile.signatureDataUrl : '',
    };

    const backup: AppBackupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      businessProfile: exportedProfile,
      documents: this.getDocuments(),
      clients: this.getClients(),
    };
    this.setLastBackupDate(new Date().toISOString());
    return backup;
  },

  importFullBackup(backupData: AppBackupData): boolean {
    try {
      if (!backupData || !backupData.documents || !backupData.businessProfile) {
        throw new Error('Invalid backup file format');
      }
      this.saveProfile(backupData.businessProfile);
      this.saveDocuments(backupData.documents);
      if (backupData.clients) {
        this.saveClients(backupData.clients);
      }
      this.setLastBackupDate(new Date().toISOString());
      this.persistToDiskAndCloud();
      return true;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  },

  exportHistoryCSV(): string {
    const docs = this.getDocuments();
    const headers = [
      'Document No',
      'Type',
      'Date',
      'Due / Valid Date',
      'Client Name',
      'Project Name',
      'Status',
      'Subtotal',
      'Discount',
      'Tax',
      'Advance',
      'Total/Balance Due',
      'Amount Received',
    ];

    const rows = docs.map((d) => [
      `"${d.documentNumber}"`,
      `"${d.type}"`,
      `"${d.date}"`,
      `"${d.dueDate || d.validTill || ''}"`,
      `"${(d.clientName || '').replace(/"/g, '""')}"`,
      `"${(d.projectName || '').replace(/"/g, '""')}"`,
      `"${d.status}"`,
      d.subtotal || 0,
      d.discountAmount || 0,
      d.totalTaxAmount || 0,
      d.advanceReceived || 0,
      d.balanceDue || 0,
      d.amountReceived || 0,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
