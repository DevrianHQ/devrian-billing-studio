import React, { useState, useMemo } from 'react';
import { BillingDocument, DocumentType, DocumentStatus, BusinessProfile } from '../../types';
import { formatDisplayDate } from '../../services/dateUtils';
import { formatINR } from '../../services/indianCurrency';
import { exportElementsToPdf } from '../../services/pdfExport';
import { DocumentPreview } from '../document/DocumentPreview';
import {
  Search,
  Filter,
  FileText,
  Receipt,
  FileCheck,
  Edit3,
  Copy,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface HistoryViewProps {
  documents: BillingDocument[];
  business: BusinessProfile;
  onEditDocument: (doc: BillingDocument) => void;
  onDuplicateDocument: (doc: BillingDocument) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: DocumentStatus) => void;
  onExportCSV: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  documents,
  business,
  onEditDocument,
  onDuplicateDocument,
  onDeleteDocument,
  onUpdateStatus,
  onExportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatus>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // Extract unique available months from documents
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.date && d.date.length >= 7) {
        set.add(d.date.substring(0, 7)); // YYYY-MM
      }
    });
    return Array.from(set).sort().reverse();
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      // Search
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.documentNumber.toLowerCase().includes(q) ||
        d.clientName.toLowerCase().includes(q) ||
        (d.projectName && d.projectName.toLowerCase().includes(q));

      // Type filter
      const matchType = typeFilter === 'all' || d.type === typeFilter;

      // Status filter
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;

      // Month filter
      const matchMonth = monthFilter === 'all' || d.date.startsWith(monthFilter);

      return matchSearch && matchType && matchStatus && matchMonth;
    });
  }, [documents, search, typeFilter, statusFilter, monthFilter]);

  // Handle direct download from history
  const handleDownload = async (doc: BillingDocument) => {
    try {
      setDownloadingDocId(doc.id);
      // Create hidden container to render preview
      const mountDiv = document.createElement('div');
      mountDiv.style.position = 'fixed';
      mountDiv.style.left = '-9999px';
      mountDiv.style.top = '-9999px';
      document.body.appendChild(mountDiv);

      // Render the pages for this doc
      // Wait for next frame
      setTimeout(async () => {
        try {
          const pageElements = Array.from(
            document.querySelectorAll<HTMLElement>(`#export-temp-${doc.id} .a4-page-export`)
          );
          if (pageElements.length > 0) {
            await exportElementsToPdf(pageElements, `${doc.documentNumber}_DEVRIAN.pdf`);
          } else {
            // fallback: open in editor
            onEditDocument(doc);
          }
        } finally {
          setDownloadingDocId(null);
        }
      }, 300);
    } catch (e) {
      console.error(e);
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Document History</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage, search, duplicate and track all DEVRIAN invoices and payment receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={onExportCSV}
          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
        >
          <FileSpreadsheet size={14} className="text-emerald-400" />
          <span>Export All CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-900/80 p-3.5 border border-neutral-800 rounded-xl">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search doc #, client, project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs pl-8 pr-3 py-2 rounded-lg outline-none"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-neutral-500 shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2.5 py-2 rounded-lg outline-none"
          >
            <option value="all">All Document Types</option>
            <option value="invoice">Invoices</option>
            <option value="receipt">Payment Receipts</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2.5 py-2 rounded-lg outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PARTIALLY PAID">PARTIALLY PAID</option>
            <option value="ADVANCE RECEIVED">ADVANCE RECEIVED</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-2.5 py-2 rounded-lg outline-none"
          >
            <option value="all">All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Doc No.</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client & Project</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    No documents found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const displayAmount =
                    doc.type === 'receipt'
                      ? (doc.amountReceived ?? doc.advanceReceived)
                      : doc.type === 'invoice'
                      ? doc.balanceDue
                      : doc.subtotal;

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-neutral-800/40 transition group"
                    >
                      {/* Document Number */}
                      <td className="py-3 px-4 font-bold text-white font-mono">
                        {doc.documentNumber}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-300">
                          {doc.type === 'invoice' && <FileText size={12} className="text-sky-400" />}
                          {doc.type === 'receipt' && <Receipt size={12} className="text-emerald-400" />}
                          {doc.type === 'quotation' && <FileCheck size={12} className="text-amber-400" />}
                          <span className="capitalize">{doc.type}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-neutral-300">
                        {formatDisplayDate(doc.date)}
                        {doc.dueDate && (
                          <div className="text-[10px] text-neutral-500">
                            Due: {formatDisplayDate(doc.dueDate)}
                          </div>
                        )}
                      </td>

                      {/* Client & Project */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{doc.clientName}</div>
                        {doc.projectName && (
                          <div className="text-[11px] text-neutral-400 truncate max-w-xs">
                            {doc.projectName}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {formatINR(displayAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <select
                          value={doc.status}
                          onChange={(e) => onUpdateStatus(doc.id, e.target.value as DocumentStatus)}
                          className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase cursor-pointer outline-none ${
                            doc.status === 'PAID'
                              ? 'border-emerald-600 bg-emerald-950/60 text-emerald-400'
                              : doc.status === 'OVERDUE'
                              ? 'border-red-600 bg-red-950/60 text-red-400'
                              : doc.status === 'PARTIALLY PAID'
                              ? 'border-amber-600 bg-amber-950/60 text-amber-400'
                              : 'border-neutral-600 bg-neutral-900 text-neutral-300'
                          }`}
                        >
                          <option value="PAID">PAID</option>
                          <option value="UNPAID">UNPAID</option>
                          <option value="PARTIALLY PAID">PARTIALLY PAID</option>
                          <option value="ADVANCE RECEIVED">ADVANCE RECEIVED</option>
                          <option value="OVERDUE">OVERDUE</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit / Open */}
                          <button
                            type="button"
                            onClick={() => onEditDocument(doc)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700/60 rounded transition"
                            title="Open & Edit"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => onDuplicateDocument(doc)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700/60 rounded transition"
                            title="Duplicate"
                          >
                            <Copy size={13} />
                          </button>

                          {/* Re-download PDF */}
                          <button
                            type="button"
                            onClick={() => onEditDocument(doc)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-700/60 rounded transition"
                            title="Download PDF"
                          >
                            <Download size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(doc.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/40 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={24} />
              <h3 className="font-bold text-sm text-white">Delete Document?</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDocument(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

