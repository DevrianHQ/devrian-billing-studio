import {
  Clause,
  DocumentVersion,
  AcceptanceRecord,
  PolicySettings,
  PolicyVariables,
  PoliciesModuleState,
  PoliciesBackupData,
} from '../types';
import { POLICIES_STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_CLAUSES } from '../constants/defaultClauses';
import { DEFAULT_POLICY_VARIABLES } from '../constants/defaultVariables';

const DEFAULT_SETTINGS: PolicySettings = {
  documentNumber: 'DEV-TNC-v1.0',
  currentVersion: '1.0',
  effectiveDate: '2026-11-01',
  lastUpdated: new Date().toISOString().split('T')[0],
  showTableOfContents: true,
  showKeyTermsBox: true,
  showRevisionHistoryAppendix: true,
  showAcknowledgementSignatures: true,
  showWorkedExampleBox: true,
  smartFitSummary: true,
  summaryScale: 1.0,
  stampAcceptedVersion: true,
};

const INITIAL_VERSIONS: DocumentVersion[] = [
  {
    id: 'ver-initial-1-0',
    version: '1.0',
    effectiveDate: '2026-11-01',
    changeNote: 'Initial baseline DEVRIAN master terms and conditions',
    savedAt: '2026-11-01T00:00:00.000Z',
    clausesSnapshot: DEFAULT_CLAUSES,
    variablesSnapshot: DEFAULT_POLICY_VARIABLES,
    includeInAppendix: true,
  },
];

export const PoliciesStorage = {
  // --- Clauses ---
  loadClauses(): Clause[] {
    try {
      const raw = localStorage.getItem(POLICIES_STORAGE_KEYS.CLAUSES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[PoliciesStorage] Failed to parse clauses from localStorage:', e);
    }
    return DEFAULT_CLAUSES;
  },

  saveClauses(clauses: Clause[]): void {
    try {
      localStorage.setItem(POLICIES_STORAGE_KEYS.CLAUSES, JSON.stringify(clauses));
    } catch (e) {
      console.error('[PoliciesStorage] Failed to save clauses:', e);
    }
  },

  resetClausesToDefault(): Clause[] {
    this.saveClauses(DEFAULT_CLAUSES);
    return DEFAULT_CLAUSES;
  },

  // --- Variables ---
  loadVariables(): PolicyVariables {
    try {
      const raw = localStorage.getItem(POLICIES_STORAGE_KEYS.VARIABLES);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_POLICY_VARIABLES,
          ...parsed,
          custom: {
            ...DEFAULT_POLICY_VARIABLES.custom,
            ...(parsed.custom || {}),
          },
        };
      }
    } catch (e) {
      console.warn('[PoliciesStorage] Failed to parse variables from localStorage:', e);
    }
    return DEFAULT_POLICY_VARIABLES;
  },

  saveVariables(variables: PolicyVariables): void {
    try {
      localStorage.setItem(POLICIES_STORAGE_KEYS.VARIABLES, JSON.stringify(variables));
    } catch (e) {
      console.error('[PoliciesStorage] Failed to save variables:', e);
    }
  },

  resetVariablesToDefault(): PolicyVariables {
    this.saveVariables(DEFAULT_POLICY_VARIABLES);
    return DEFAULT_POLICY_VARIABLES;
  },

  // --- Versions ---
  loadVersions(): DocumentVersion[] {
    try {
      const raw = localStorage.getItem(POLICIES_STORAGE_KEYS.VERSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[PoliciesStorage] Failed to parse versions:', e);
    }
    return INITIAL_VERSIONS;
  },

  saveVersions(versions: DocumentVersion[]): void {
    try {
      localStorage.setItem(POLICIES_STORAGE_KEYS.VERSIONS, JSON.stringify(versions));
    } catch (e) {
      console.error('[PoliciesStorage] Failed to save versions:', e);
    }
  },

  // --- Acceptance Log ---
  loadAcceptanceLog(): AcceptanceRecord[] {
    try {
      const raw = localStorage.getItem(POLICIES_STORAGE_KEYS.ACCEPTANCE_LOG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[PoliciesStorage] Failed to parse acceptance log:', e);
    }
    return [];
  },

  saveAcceptanceLog(records: AcceptanceRecord[]): void {
    try {
      localStorage.setItem(POLICIES_STORAGE_KEYS.ACCEPTANCE_LOG, JSON.stringify(records));
    } catch (e) {
      console.error('[PoliciesStorage] Failed to save acceptance log:', e);
    }
  },

  // --- Settings ---
  loadSettings(): PolicySettings {
    try {
      const raw = localStorage.getItem(POLICIES_STORAGE_KEYS.SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('[PoliciesStorage] Failed to parse settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: PolicySettings): void {
    try {
      localStorage.setItem(POLICIES_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('[PoliciesStorage] Failed to save settings:', e);
    }
  },

  // --- Read-Only Shared App Getters ---
  /**
   * Strictly read-only getter to retrieve signature image from main app if available.
   */
  getAppSignatureImage(): string {
    try {
      const raw = localStorage.getItem('devrian_business_profile_v4');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.signatureDataUrl === 'string') {
          return parsed.signatureDataUrl;
        }
      }
    } catch {
      // Safe fallback
    }
    return '';
  },

  /**
   * Strictly read-only getter to retrieve logo image from main app if available.
   */
  getAppLogoUrl(): string {
    try {
      const raw = localStorage.getItem('devrian_business_profile_v4');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.logoDataUrl === 'string' && parsed.logoDataUrl.trim() !== '') {
          return parsed.logoDataUrl;
        }
      }
    } catch {
      // Safe fallback
    }
    return '/brand/devrian-symbol-pure-white.png';
  },

  // --- Full Module State & Backup ---
  getFullState(): PoliciesModuleState {
    return {
      clauses: this.loadClauses(),
      variables: this.loadVariables(),
      versions: this.loadVersions(),
      acceptanceLog: this.loadAcceptanceLog(),
      settings: this.loadSettings(),
    };
  },

  exportBackup(): void {
    const fullState = this.getFullState();
    const backup: PoliciesBackupData = {
      namespace: 'devrian.policies.v1',
      version: fullState.settings.currentVersion || '1.0',
      exportedAt: new Date().toISOString(),
      data: fullState,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devrian-policies-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as PoliciesBackupData;
      if (!parsed || parsed.namespace !== 'devrian.policies.v1' || !parsed.data) {
        throw new Error('Invalid backup file structure or incorrect namespace');
      }
      if (parsed.data.clauses) this.saveClauses(parsed.data.clauses);
      if (parsed.data.variables) this.saveVariables(parsed.data.variables);
      if (parsed.data.versions) this.saveVersions(parsed.data.versions);
      if (parsed.data.acceptanceLog) this.saveAcceptanceLog(parsed.data.acceptanceLog);
      if (parsed.data.settings) this.saveSettings(parsed.data.settings);
      return true;
    } catch (e) {
      console.error('[PoliciesStorage] Import error:', e);
      return false;
    }
  },
};

