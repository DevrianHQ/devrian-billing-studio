import {
  QuotationTemplateType,
  SavedQuotationTemplate,
  QuotationTemplatesStore,
} from './types';

export const QUOTATION_TEMPLATES_STORAGE_KEY = 'devrian.quotation.templates.v1';

export const PROJECT_DEFAULT_TERMS = [
  'Advance of 50% is required to initiate work.',
  'Remaining 50% due within 48 hours of project completion and prior to final asset handover.',
  'Valid for 15 days from the date of issue.',
  'Work starts within 2 business days of advance clearance.',
  'Full Terms & Conditions and Service Policies apply: devrian.in/terms',
];

export const MONTHLY_DEFAULT_TERMS = [
  'Advance payment of Month 1 retainer (and setup fee, if applicable) is required to begin work.',
  'Subsequent monthly invoices are raised 5 days before each billing cycle and are due on or before cycle start.',
  'Minimum commitment of {{min_term_months}} months. Early termination requires payment for the remaining months of the minimum term.',
  'Either party may terminate by providing {{notice_days}} days written notice prior to the next billing cycle.',
  'Deliverables not utilised within a monthly cycle expire and do not roll over to subsequent months.',
  'Work outside the agreed monthly deliverables will be quoted separately as an add-on.',
  'Full Terms & Conditions and Service Policies apply: devrian.in/terms',
];

export const FACTORY_PROJECT_TEMPLATE: SavedQuotationTemplate = {
  type: 'project',
  labels: {
    eyebrow: 'QUOTATION · ONE-TIME PROJECT',
    documentTitle: 'QUOTATION',
    clientHeading: 'PREPARED FOR',
    projectHeading: 'PROJECT',
    tableHeading: 'SCOPE OF WORK',
    colNumber: '#',
    colDescription: 'DESCRIPTION',
    colQty: 'QTY',
    colRate: 'RATE (₹)',
    colAmount: 'AMOUNT (₹)',
    labelSubtotal: 'Subtotal',
    labelDiscount: 'Discount',
    labelTotal: 'TOTAL',
    labelAdvanceToStart: 'Advance to start (50%)',
    labelBalanceDue: 'Balance due on completion (within 48 hrs)',
    gstLine: 'Prices exclude GST. Taxes will be added if applicable at billing.',
    paymentSectionHeading: 'PAYMENT DETAILS',
    termsSectionHeading: 'TERMS & NOTES',
    instructionLine: 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.',
    closingLine: 'Thank you for the opportunity to work together. We look forward to creating exceptional work for you.',
    signatureProprietor: 'Dev Rajpoot',
    signatureTitle: 'Founder, DEVRIAN',
  },
  terms: [...PROJECT_DEFAULT_TERMS],
  paymentToggles: {
    showBank: true,
    showUpi: true,
    showQr: true,
  },
  validityDays: 15,
  advancePercentDefault: 50,
  balanceDueHoursDefault: 48,
  visibility: {
    showPaymentDetails: true,
    showGstLine: true,
    showTermsAndNotes: true,
    showAcceptance: true,
    showClosingLine: true,
    showClientSignature: true,
    showLegalDisclaimer: true,
    hideZeroRows: true,
  },
  sampleData: {
    clientName: 'Apex Global Enterprises',
    contactPerson: 'Rohan Mehra',
    clientAddress: 'Tech Park, Whitefield, Bengaluru, KA 560066',
    clientPhone: '+91 98765 43210',
    clientEmail: 'rohan@apexglobal.com',
    projectName: 'High-Converting Brand Identity & Marketing Suite',
    estimatedDelivery: '10 working days after advance and assets received',
    items: [
      {
        id: 'sample-p1',
        description: 'Brand Identity System',
        subDescription: 'Logo, typography, color palette and comprehensive brand guidelines',
        qty: 1,
        rate: 45000,
        amount: 45000,
      },
      {
        id: 'sample-p2',
        description: 'Investor Pitch Deck & Presentation',
        subDescription: '15 investor-ready slides with custom infographics and narrative pacing',
        qty: 1,
        rate: 25000,
        amount: 25000,
      },
      {
        id: 'sample-p3',
        description: 'Marketing Collateral & Social Launch Kit',
        subDescription: '30 social media templates, banners, brochures and digital stationery',
        qty: 1,
        rate: 20000,
        amount: 20000,
      },
      {
        id: 'sample-p4',
        description: 'High-Converting Landing Page Design',
        subDescription: 'Figma UI/UX design with responsive mobile views and conversion copywriting',
        qty: 1,
        rate: 30000,
        amount: 30000,
      },
    ],
  },
};

export const FACTORY_MONTHLY_TEMPLATE: SavedQuotationTemplate = {
  type: 'monthly',
  labels: {
    eyebrow: 'QUOTATION · MONTHLY RETAINER',
    documentTitle: 'QUOTATION',
    clientHeading: 'PREPARED FOR',
    projectHeading: 'SERVICE',
    tableHeading: 'MONTHLY RETAINER PRICING',
    colNumber: '#',
    colDescription: 'DESCRIPTION',
    colQty: 'QTY',
    colRate: 'RATE (₹)',
    colAmount: 'AMOUNT (₹)',
    labelSubtotal: 'Monthly Retainer',
    labelDiscount: 'Discount',
    labelTotal: 'DUE TO START',
    labelAdvanceToStart: 'First Month Retainer Fee',
    labelBalanceDue: 'Balance Payable',
    gstLine: 'Prices exclude GST. Taxes will be added if applicable at billing.',
    paymentSectionHeading: 'PAYMENT DETAILS',
    termsSectionHeading: 'TERMS & NOTES',
    instructionLine: 'To accept, confirm in writing (WhatsApp/email) or sign below, and pay the amount due to start.',
    closingLine: 'Thank you for choosing DEVRIAN as your creative partner. We look forward to a long and successful collaboration.',
    signatureProprietor: 'Dev Rajpoot',
    signatureTitle: 'Founder, DEVRIAN',
  },
  terms: [...MONTHLY_DEFAULT_TERMS],
  billingDefaults: {
    billingCycle: 'Monthly',
    minTermMonths: 3,
    paymentDue: 'In advance, on or before the 1st of each cycle',
    noticeDays: 30,
    autoRenewal: 'Auto-renews monthly until cancelled in writing',
    minTermMonthsReviewed: false,
    noticeDaysReviewed: false,
  },
  paymentToggles: {
    showBank: true,
    showUpi: true,
    showQr: true,
  },
  validityDays: 15,
  advancePercentDefault: 50,
  balanceDueHoursDefault: 48,
  visibility: {
    showPaymentDetails: true,
    showGstLine: true,
    showTermsAndNotes: true,
    showAcceptance: true,
    showClosingLine: true,
    showClientSignature: true,
    showLegalDisclaimer: true,
    hideZeroRows: true,
    showSetupRow: true,
    showMinimumCommitment: true,
  },
  sampleData: {
    clientName: 'Nexus Creative Labs',
    contactPerson: 'Simran Kaur',
    clientAddress: 'Cyber City, Phase II, Gurugram, HR 122002',
    clientPhone: '+91 98112 34567',
    clientEmail: 'simran@nexuslabs.in',
    projectName: 'Organic Social Media Growth & Content Engine',
    platforms: 'Instagram, LinkedIn, YouTube Shorts',
    deliverables: [
      { id: 'del-1', item: 'Instagram Reels', quantity: '8 / month' },
      { id: 'del-2', item: 'Posts / Carousels', quantity: '12 / month' },
      { id: 'del-3', item: 'Stories', quantity: 'as per plan' },
      { id: 'del-4', item: 'Content calendar', quantity: '1' },
      { id: 'del-5', item: 'Monthly performance report', quantity: '1' },
    ],
    items: [
      {
        id: 'sample-m1',
        description: 'Organic Social Growth & Video Retainer',
        subDescription: 'Full production, vertical video editing, caption copywriting and scheduling',
        qty: 1,
        rate: 40000,
        amount: 40000,
        billing: 'monthly',
      },
      {
        id: 'sample-m2',
        description: 'Brand Asset Library & Channel Setup',
        subDescription: 'One-time setup: bio optimisation, story highlights, template kit and audio curation',
        qty: 1,
        rate: 15000,
        amount: 15000,
        billing: 'one_time',
      },
    ],
  },
};

export const QuotationTemplateService = {
  loadTemplates(): QuotationTemplatesStore {
    if (typeof window === 'undefined') {
      return {
        schemaVersion: 1,
        project: FACTORY_PROJECT_TEMPLATE,
        monthly: FACTORY_MONTHLY_TEMPLATE,
      };
    }
    try {
      const raw = localStorage.getItem(QUOTATION_TEMPLATES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.schemaVersion === 1 && parsed.project && parsed.monthly) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[QuotationTemplateService] Failed to load templates:', e);
    }
    const factoryStore: QuotationTemplatesStore = {
      schemaVersion: 1,
      project: FACTORY_PROJECT_TEMPLATE,
      monthly: FACTORY_MONTHLY_TEMPLATE,
    };
    this.saveTemplates(factoryStore);
    return factoryStore;
  },

  saveTemplates(store: QuotationTemplatesStore): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUOTATION_TEMPLATES_STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('[QuotationTemplateService] Failed to save templates:', e);
    }
  },

  getTemplate(type: QuotationTemplateType): SavedQuotationTemplate {
    const store = this.loadTemplates();
    return type === 'monthly' ? store.monthly : store.project;
  },

  updateTemplate(type: QuotationTemplateType, template: SavedQuotationTemplate): void {
    const store = this.loadTemplates();
    if (type === 'monthly') {
      store.monthly = { ...template, type: 'monthly' };
    } else {
      store.project = { ...template, type: 'project' };
    }
    this.saveTemplates(store);
  },

  resetTemplate(type: QuotationTemplateType): SavedQuotationTemplate {
    const store = this.loadTemplates();
    if (type === 'monthly') {
      store.monthly = JSON.parse(JSON.stringify(FACTORY_MONTHLY_TEMPLATE));
    } else {
      store.project = JSON.parse(JSON.stringify(FACTORY_PROJECT_TEMPLATE));
    }
    this.saveTemplates(store);
    return type === 'monthly' ? store.monthly : store.project;
  },

  resetAllToFactory(): QuotationTemplatesStore {
    const factoryStore: QuotationTemplatesStore = {
      schemaVersion: 1,
      project: JSON.parse(JSON.stringify(FACTORY_PROJECT_TEMPLATE)),
      monthly: JSON.parse(JSON.stringify(FACTORY_MONTHLY_TEMPLATE)),
    };
    this.saveTemplates(factoryStore);
    return factoryStore;
  },
};
