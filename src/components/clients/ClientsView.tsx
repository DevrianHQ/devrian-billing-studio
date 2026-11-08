import React, { useState, useMemo } from 'react';
import { Client, BillingDocument } from '../../types';
import { formatINR } from '../../services/indianCurrency';
import { formatDisplayDate } from '../../services/dateUtils';
import { User, Plus, Edit2, Trash2, Mail, Phone, MapPin, FileText, ArrowRight } from 'lucide-react';

interface ClientsViewProps {
  clients: Client[];
  documents: BillingDocument[];
  onSaveClient: (client: Partial<Client> & { name: string }) => void;
  onDeleteClient: (id: string) => void;
  onSelectDocument: (doc: BillingDocument) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  documents,
  onSaveClient,
  onDeleteClient,
  onSelectDocument,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients.length > 0 ? clients[0].id : null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});
  const [search, setSearch] = useState('');

  // Selected client
  const activeClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  // Documents for the selected client
  const clientDocs = useMemo(() => {
    if (!activeClient) return [];
    const clientNameLower = activeClient.name.trim().toLowerCase();
    return documents.filter(
      (d) =>
        d.clientId === activeClient.id ||
        d.clientName.trim().toLowerCase() === clientNameLower
    );
  }, [documents, activeClient]);

  // Financial stats for the client
  const stats = useMemo(() => {
    let billed = 0;
    let received = 0;
    let pending = 0;

    clientDocs.forEach((d) => {
      if (d.type === 'invoice') {
        const total = d.subtotal - d.discountAmount + (d.totalTaxAmount || 0);
        billed += total;
        const invoicePaid = d.status === 'PAID' ? total : (d.advanceReceived || 0);
        received += invoicePaid;
        pending += d.status === 'PAID' ? 0 : (d.balanceDue || 0);
      } else if (d.type === 'receipt') {
        const isLinked = Boolean(d.sourceInvoiceId && clientDocs.some((inv) => inv.id === d.sourceInvoiceId));
        if (!isLinked) {
          const amount = d.amountReceived || d.advanceReceived || 0;
          billed += d.totalProjectCost || amount;
          received += amount;
        }
      }
    });

    return { billed, received, pending };
  }, [clientDocs]);

  // Filter clients by search
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const handleStartAdd = () => {
    setEditingClient({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
    });
    setIsEditing(true);
  };

  const handleStartEdit = (client: Client) => {
    setEditingClient({ ...client });
    setIsEditing(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient.name?.trim()) {
      alert('Client name is required');
      return;
    }
    onSaveClient(editingClient as any);
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Clients Directory</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage client profiles and view detailed billing records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus size={14} /> Add New Client
        </button>
      </div>

      {/* Grid: Client list on left, Client details & docs on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client List (4 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col h-[680px]">
          {/* Search box */}
          <div className="p-3 border-b border-neutral-800 bg-neutral-950">
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 custom-scrollbar">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No clients found. Click "Add New Client" above.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = activeClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`group p-3.5 cursor-pointer transition flex items-start justify-between ${
                      isSelected
                        ? 'bg-neutral-800/80 border-l-4 border-white'
                        : 'hover:bg-neutral-800/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-xs text-white">{client.name}</div>
                      {client.contactPerson && (
                        <div className="text-[11px] text-neutral-400">
                          Attn: {client.contactPerson}
                        </div>
                      )}
                      {(client.email || client.phone) && (
                        <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                          {client.email && <span>{client.email}</span>}
                          {client.phone && <span>{client.phone}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(client);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800"
                        title="Edit Client"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Client Details & Invoices (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeClient ? (
            <>
              {/* Profile Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeClient.name}</h2>
                    {activeClient.contactPerson && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Contact Person: {activeClient.contactPerson}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(activeClient)}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded text-xs flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete client "${activeClient.name}"?`)) {
                          onDeleteClient(activeClient.id);
                        }
                      }}
                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-950 text-red-300 border border-red-900/50 rounded text-xs flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                  {activeClient.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-neutral-500" />
                      <span>{activeClient.email}</span>
                    </div>
                  )}
                  {activeClient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-neutral-500" />
                      <span>{activeClient.phone}</span>
                    </div>
                  )}
                  {activeClient.address && (
                    <div className="flex items-start gap-2 col-span-2">
                      <MapPin size={13} className="text-neutral-500 shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line">{activeClient.address}</span>
                    </div>
                  )}
                  {activeClient.gstin && (
                    <div className="col-span-2 text-[11px] text-neutral-400 font-mono">
                      GSTIN: {activeClient.gstin}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-neutral-800 text-center">
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                      Total Billed
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {formatINR(stats.billed)}
                    </div>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                      Total Received
                    </div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {formatINR(stats.received)}
                    </div>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                      Pending Due
                    </div>
                    <div className="text-sm font-bold text-amber-400 mt-0.5">
                      {formatINR(stats.pending)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Documents History */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <div className="p-3.5 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Associated Documents ({clientDocs.length})
                  </span>
                </div>
                <div className="divide-y divide-neutral-800/60 max-h-[380px] overflow-y-auto custom-scrollbar">
                  {clientDocs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      No documents created for this client yet.
                    </div>
                  ) : (
                    clientDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDocument(doc)}
                        className="p-3 flex items-center justify-between hover:bg-neutral-800/40 cursor-pointer transition"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-white">
                              {doc.documentNumber}
                            </span>
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                              {doc.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {formatDisplayDate(doc.date)} {doc.projectName ? `· ${doc.projectName}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs text-white">
                            {formatINR(doc.type === 'receipt' ? (doc.amountReceived ?? doc.advanceReceived) : doc.balanceDue)}
                          </span>
                          <ArrowRight size={14} className="text-neutral-500" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500 text-xs">
              Select or create a client to view details.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveModal}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl max-w-md w-full space-y-4"
          >
            <h3 className="text-sm font-bold text-white tracking-wide">
              {editingClient.id ? 'Edit Client' : 'Add New Client'}
            </h3>

            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Client / Business Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={editingClient.name || ''}
                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={editingClient.contactPerson || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, contactPerson: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={editingClient.phone || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingClient.email || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={editingClient.gstin || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                Address
              </label>
              <textarea
                rows={2}
                value={editingClient.address || ''}
                onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-bold bg-white text-black hover:bg-neutral-200 rounded-md shadow"
              >
                Save Client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

