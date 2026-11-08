import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Download,
  Search,
  Trash2,
  Calendar,
  User,
  Folder,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { AcceptanceRecord, AcceptanceMethod, DocumentVersion } from '../../types';

interface AcceptanceLogViewProps {
  records: AcceptanceRecord[];
  versions: DocumentVersion[];
  currentVersion: string;
  onAddRecord: (record: AcceptanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const AcceptanceLogView: React.FC<AcceptanceLogViewProps> = ({
  records,
  versions,
  currentVersion,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding new record
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [proposalNo, setProposalNo] = useState('');
  const [versionAccepted, setVersionAccepted] = useState(`v${currentVersion}`);
  const [method, setMethod] = useState<AcceptanceMethod>('payment');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchClient = r.clientName.toLowerCase().includes(q);
        const matchProject = r.projectName.toLowerCase().includes(q);
        const matchNote = r.note.toLowerCase().includes(q);
        if (!matchClient && !matchProject && !matchNote) return false;
      }

      if (methodFilter !== 'all') {
        if (r.method !== methodFilter) return false;
      }

      return true;
    });
  }, [records, searchQuery, methodFilter]);

  const handleExportCsv = () => {
    if (records.length === 0) {
      alert('No acceptance records to export.');
      return;
    }

    const headers = ['Record ID', 'Client Name', 'Project Name', 'Date', 'Version Accepted', 'Method', 'Proof Reference'];
    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.clientName.replace(/"/g, '""')}"`,
      `"${r.projectName.replace(/"/g, '""')}"`,
      `"${r.date}"`,
      `"${r.versionAccepted}"`,
      `"${r.method}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `devrian-acceptance-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !projectName.trim()) {
      alert('Client Name and Project Name are required.');
      return;
    }

    const newRecord: AcceptanceRecord = {
      id: `acc-${Date.now()}`,
      clientName: clientName.trim(),
      projectName: projectName.trim(),
      date,
      versionAccepted,
      method,
      note: note.trim() || (proposalNo ? `Ref: ${proposalNo}` : 'Direct Acceptance'),
      createdAt: new Date().toISOString(),
    };

    onAddRecord(newRecord);
    setShowAddModal(false);
    // Reset form
    setClientName('');
    setProjectName('');
    setProposalNo('');
    setNote('');
  };

  const getMethodBadge = (m: AcceptanceMethod) => {
    switch (m) {
      case 'payment':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Advance Payment
          </span>
        );
      case 'signed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
            Signed Document
          </span>
        );
      case 'email':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
            Email Confirmation
          </span>
        );
      case 'WhatsApp':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800">
            WhatsApp Approval
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileCheck2 size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Client Acceptance &amp; Consent Log</h2>
            <p className="text-[11px] text-neutral-400">
              Audit trail of client acceptance across advance payments, signed contracts, email authorizations, and WhatsApp agreements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Download size={13} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={13} />
            Log Acceptance
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, project, or reference note..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Methods</option>
            <option value="payment">Advance Payment</option>
            <option value="signed">Signed Document</option>
            <option value="email">Email Confirmation</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs">
            No client acceptance records logged yet. Click <strong>Log Acceptance</strong> above to record terms agreed upon with clients.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-950 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Client &amp; Project</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Audit Note / Proof</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{r.clientName}</div>
                      <div className="text-[11px] text-neutral-400">{r.projectName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300">{r.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px]">
                        {r.versionAccepted}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getMethodBadge(r.method)}</td>
                    <td className="py-3 px-4 text-neutral-400 text-[11px] max-w-xs truncate">
                      {r.note || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete acceptance record for ${r.clientName}?`)) {
                            onDeleteRecord(r.id);
                          }
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400 transition"
                        title="Delete Record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Log Client Acceptance
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Anshita Singh Parihar"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. FMCG Video Editing – 15 Videos"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">Doc / Ref No.</label>
                  <input
                    type="text"
                    value={proposalNo}
                    onChange={(e) => setProposalNo(e.target.value)}
                    placeholder="DEV-2026-001"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">Acceptance Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">Version Accepted</label>
                  <select
                    value={versionAccepted}
                    onChange={(e) => setVersionAccepted(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value={`v${currentVersion}`}>v{currentVersion} (Current)</option>
                    {versions.map((ver) => (
                      <option key={ver.id} value={`v${ver.version}`}>
                        v{ver.version} ({ver.effectiveDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-400 block mb-1">Method of Acceptance</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as AcceptanceMethod)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="payment">Advance Payment</option>
                    <option value="signed">Signed Document</option>
                    <option value="email">Email Confirmation</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-1">Audit / Proof Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. UPI Ref #409823... / PDF countersigned / WhatsApp chat screenshot stored"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

