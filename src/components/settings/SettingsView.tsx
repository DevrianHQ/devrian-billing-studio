import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BusinessProfile, MonthlyDeliverable } from '../../types';
import { StorageService, AppBackupData } from '../../services/storage';
import { formatDisplayDate } from '../../services/dateUtils';
import { DEFAULT_QUOTATION_TERMS, DEFAULT_MONTHLY_TERMS, DEFAULT_MONTHLY_DELIVERABLES } from '../../services/seedData';
import { SignatureStudioModal } from '../common/SignatureStudioModal';
import { SettingsDriveSync } from './SettingsDriveSync';
import { SettingsPaymentConfig } from './SettingsPaymentConfig';
import { SettingsBrandAssetsSection } from './SettingsBrandAssetsSection';
import { SettingsQuotationDefaultsSection } from './SettingsQuotationDefaultsSection';
import { QuotationTemplatesSettings } from '../../modules/quotation/components/QuotationTemplatesSettings';
import { QuotationStyleGuide } from '../../modules/quotation/components/QuotationStyleGuide';
import { LayoutBudgetPanel } from '../../modules/quotation/components/LayoutBudgetPanel';
import { QuotationTemplateService } from '../../modules/quotation';
import { BillingDocument } from '../../types';
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
  Sliders,
  Palette,
  Briefcase,
  Calendar,
  BarChart3,
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
  const [settingsTab, setSettingsTab] = useState<'profile' | 'templates' | 'styleguide' | 'budget'>('profile');
  const isInternalChangeRef = useRef(false);

  const sampleProjectDoc = useMemo<BillingDocument>(() => ({
    id: 'budget-sample-project',
    type: 'quotation',
    quotationType: 'project',
    documentNumber: 'DEV-QT-2026-001',
    date: '2026-11-10',
    validTill: '2026-11-25',
    status: 'DRAFT',
    clientName: 'Apex Global Enterprises',
    clientContactPerson: 'Rohan Mehra',
    clientAddress: 'Tech Park, Whitefield, Bengaluru, KA 560066',
    clientPhone: '+91 98765 43210',
    clientEmail: 'rohan@apexglobal.com',
    projectName: 'Enterprise Brand Identity & Digital Launch Kit',
    items: [
      { id: 'bp-1', description: 'Brand Identity System', subDescription: 'Logo, typography, color palette and brand guidelines', qty: 1, rate: 45000, amount: 45000 },
      { id: 'bp-2', description: 'Investor Pitch Deck & Presentation', subDescription: '15 investor-ready slides with custom infographics', qty: 1, rate: 25000, amount: 25000 },
      { id: 'bp-3', description: 'Marketing Collateral & Social Kit', subDescription: '30 social media templates, banners and collateral', qty: 1, rate: 20000, amount: 20000 },
      { id: 'bp-4', description: 'High-Converting Landing Page Design', subDescription: 'Figma UI/UX design with responsive mobile views', qty: 1, rate: 30000, amount: 30000 },
    ],
    subtotal: 120000,
    discountAmount: 0,
    totalTaxAmount: 0,
    advancePercent: 50,
    sectionVisibility: {
      showPaymentDetails: true,
      showGstLine: true,
      showTermsAndNotes: true,
      showAcceptance: true,
      showClosingLine: true,
      showClientSignature: true,
      showLegalDisclaimer: true,
      showUpiQr: true,
      showDiscount: true,
      showAdvance: true,
      showSignature: true,
      showAuditLine: true,
      showAmountInWords: false,
    },
    notes: [
      'Advance of 50% is required to initiate work.',
      'Remaining 50% due within 48 hours of project completion and prior to final asset handover.',
      'Valid for 15 days from the date of issue.',
      'Work starts within 2 business days of advance clearance.',
      'Full Terms & Conditions and Service Policies apply: devrian.in/terms',
    ],
    updatedAt: new Date().toISOString(),
  } as unknown as BillingDocument), []);

  const sampleMonthlyDoc = useMemo<BillingDocument>(() => ({
    id: 'budget-sample-monthly',
    type: 'quotation',
    quotationType: 'monthly',
    documentNumber: 'DEV-QT-2026-002',
    date: '2026-11-10',
    validTill: '2026-11-25',
    status: 'DRAFT',
    clientName: 'Nexus Creative Labs',
    clientContactPerson: 'Simran Kaur',
    clientAddress: 'Cyber City, Phase II, Gurugram, HR 122002',
    clientPhone: '+91 98112 34567',
    clientEmail: 'simran@nexuslabs.in',
    projectName: 'Organic Social Media Growth & Content Engine',
    platforms: 'Instagram, LinkedIn, YouTube Shorts',
    monthlyDeliverables: [
      { id: 'del-1', item: 'Instagram Reels', quantity: '8 / month' },
      { id: 'del-2', item: 'Posts / Carousels', quantity: '12 / month' },
      { id: 'del-3', item: 'Stories', quantity: 'as per plan' },
      { id: 'del-4', item: 'Content calendar', quantity: '1' },
      { id: 'del-5', item: 'Monthly performance report', quantity: '1' },
    ],
    items: [
      { id: 'bm-1', description: 'Organic Social Growth & Video Retainer', subDescription: 'Full production, vertical video editing, caption copywriting and scheduling', qty: 1, rate: 40000, amount: 40000, billing: 'monthly' },
      { id: 'bm-2', description: 'Brand Asset Library & Channel Setup', subDescription: 'One-time setup: bio optimisation, highlights, template kit', qty: 1, rate: 15000, amount: 15000, billing: 'one_time' },
    ],
    subtotal: 55000,
    oneTimeSetupFee: 15000,
    billingCycle: 'Monthly',
    minTermMonths: 3,
    paymentDueDescription: 'In advance, on or before the 1st of each cycle',
    noticePeriodDays: 30,
    autoRenewalDescription: 'Auto-renews monthly until cancelled in writing',
    sectionVisibility: {
      showPaymentDetails: true,
      showGstLine: true,
      showTermsAndNotes: true,
      showAcceptance: true,
      showClosingLine: true,
      showClientSignature: true,
      showLegalDisclaimer: true,
      showUpiQr: true,
      showDiscount: true,
      showAdvance: true,
      showSignature: true,
      showAuditLine: true,
      showAmountInWords: false,
    },
    notes: [
      'Advance payment of Month 1 retainer (and setup fee, if applicable) is required to begin work.',
      'Subsequent monthly invoices are raised 5 days before each billing cycle and are due on or before cycle start.',
      'Minimum commitment of 3 months. Early termination requires payment for the remaining months of the minimum term.',
      'Either party may terminate by providing 30 days written notice prior to the next billing cycle.',
      'Deliverables not utilised within a monthly cycle expire and do not roll over to subsequent months.',
      'Work outside the agreed monthly deliverables will be quoted separately as an add-on.',
      'Full Terms & Conditions and Service Policies apply: devrian.in/terms',
    ],
    updatedAt: new Date().toISOString(),
  } as unknown as BillingDocument), []);

  // Synchronize local form data if profile prop changes from external source (e.g. restore)
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    setFormData(profile);
  }, [profile]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const whiteLogoInputRef = useRef<HTMLInputElement>(null);
  const blackLogoInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => {
    isInternalChangeRef.current = true;
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      onSaveProfile(next);
      return next;
    });
  };

  const updateProjectDefault = <K extends keyof NonNullable<BusinessProfile['projectQuotationDefaults']>>(
    key: K,
    value: NonNullable<BusinessProfile['projectQuotationDefaults']>[K]
  ) => {
    isInternalChangeRef.current = true;
    setFormData((prev) => {
      const current = prev.projectQuotationDefaults || {
        validityDays: prev.quotationValidityDays || 15,
        advancePercent: prev.advancePercentDefault || 50,
        balanceDueHours: prev.balanceDueHoursDefault || 48,
        deliveryTimeline: '10 working days after advance and required materials',
        termsTemplate: [...(prev.quotationTermsTemplate && prev.quotationTermsTemplate.length > 0 ? prev.quotationTermsTemplate : DEFAULT_QUOTATION_TERMS)],
        closingLine: prev.quotationClosingTemplate || 'Thank you for considering DEVRIAN. We look forward to working with you.',
      };
      const updatedProj = { ...current, [key]: value };
      const next = {
        ...prev,
        projectQuotationDefaults: updatedProj,
        // Keep root fallback fields in sync
        quotationValidityDays: updatedProj.validityDays,
        advancePercentDefault: updatedProj.advancePercent,
        balanceDueHoursDefault: updatedProj.balanceDueHours,
        quotationClosingTemplate: updatedProj.closingLine,
        quotationTermsTemplate: updatedProj.termsTemplate,
      };
      onSaveProfile(next);
      return next;
    });
  };

  const updateMonthlyDefault = <K extends keyof NonNullable<BusinessProfile['monthlyQuotationDefaults']>>(
    key: K,
    value: NonNullable<BusinessProfile['monthlyQuotationDefaults']>[K]
  ) => {
    isInternalChangeRef.current = true;
    setFormData((prev) => {
      const current = prev.monthlyQuotationDefaults || {
        validityDays: 15,
        minTermMonths: 3,
        noticePeriodDays: 30,
        billingCycle: 'Monthly',
        paymentDueDescription: 'In advance, before each cycle begins',
        autoRenewalDescription: 'Auto-renews monthly until cancelled',
        termsTemplate: [...DEFAULT_MONTHLY_TERMS],
        deliverables: [...DEFAULT_MONTHLY_DELIVERABLES],
        closingLine: 'Thank you for considering DEVRIAN. We look forward to working with you.',
      };
      const updatedMonthly = { ...current, [key]: value };
      const next = {
        ...prev,
        monthlyQuotationDefaults: updatedMonthly,
        minTermMonthsDefault: updatedMonthly.minTermMonths,
        noticePeriodDaysDefault: updatedMonthly.noticePeriodDays,
      };
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



  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Studio Settings & Business Profile</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure DEVRIAN legal identity, isolated business signature, quotation templates, and backups.
          </p>
        </div>

        {settingsTab === 'profile' && (
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold flex items-center gap-2 shadow"
          >
            <Save size={14} /> Save Changes
          </button>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setSettingsTab('profile')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            settingsTab === 'profile'
              ? 'bg-white text-black shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Sliders size={14} /> Studio &amp; Profile
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab('templates')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            settingsTab === 'templates'
              ? 'bg-white text-black shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Palette size={14} /> Quotation Saved Templates
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab('styleguide')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            settingsTab === 'styleguide'
              ? 'bg-white text-black shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Briefcase size={14} /> Quotation Style Guide
        </button>
        <button
          type="button"
          onClick={() => setSettingsTab('budget')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            settingsTab === 'budget'
              ? 'bg-white text-black shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <BarChart3 size={14} /> Developer Layout Budget
        </button>
      </div>

      {settingsTab === 'templates' && <QuotationTemplatesSettings />}

      {settingsTab === 'styleguide' && <QuotationStyleGuide />}

      {settingsTab === 'budget' && (
        <div className="space-y-6">
          <LayoutBudgetPanel
            document={sampleProjectDoc}
            template={QuotationTemplateService.getTemplate('project')}
          />
          <LayoutBudgetPanel
            document={sampleMonthlyDoc}
            template={QuotationTemplateService.getTemplate('monthly')}
          />
        </div>
      )}

      {settingsTab === 'profile' && (
        <>
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
          <SettingsDriveSync
            includeSigInBackup={includeSigInBackup}
            onRefreshParent={() => setFormData(StorageService.getProfile())}
          />

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
        <SettingsBrandAssetsSection
          formData={formData}
          updateField={updateField}
          onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        />

        {/* 3. PAYMENT CONFIGURATION */}
        <SettingsPaymentConfig formData={formData} updateField={updateField} />

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

        {/* 6. QUOTATION DEFAULTS (PROJECT & MONTHLY) */}
        <SettingsQuotationDefaultsSection
          formData={formData}
          updateProjectDefault={updateProjectDefault}
          updateMonthlyDefault={updateMonthlyDefault}
        />

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
      </>
      )}

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
