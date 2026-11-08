import React, { useState, useEffect, useRef } from 'react';
import { Client } from '../../types';
import { StorageService } from '../../services/storage';
import { User, Check } from 'lucide-react';

interface ClientSelectorProps {
  clientName: string;
  contactPerson?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGstin?: string;
  onSelectClient: (client: Partial<Client>) => void;
  onChangeField: (field: string, value: string) => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  clientName,
  contactPerson,
  clientAddress,
  clientPhone,
  clientEmail,
  clientGstin,
  onSelectClient,
  onChangeField,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = StorageService.getClients();
    setClients(list);
  }, []);

  useEffect(() => {
    if (!clientName || !clientName.trim()) {
      setFilteredClients(clients);
      return;
    }
    const query = clientName.toLowerCase();
    const matches = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(query))
    );
    setFilteredClients(matches);
  }, [clientName, clients]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    onSelectClient({
      id: client.id,
      name: client.name,
      contactPerson: client.contactPerson || '',
      address: client.address || '',
      phone: client.phone || '',
      email: client.email || '',
      gstin: client.gstin || '',
    });
    setIsOpen(false);
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <label className="text-[12px] font-bold tracking-wider uppercase text-neutral-300 block">
        Client Information
      </label>

      {/* Client Name with Autocomplete */}
      <div className="relative">
        <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
          Client / Business Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={clientName}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              onChangeField('clientName', e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search or enter client name..."
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-2 rounded outline-none font-semibold"
          />
          <User size={13} className="absolute right-3 top-2.5 text-neutral-500" />
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && filteredClients.length > 0 && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-md shadow-2xl max-h-48 overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelect(client)}
                className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-center justify-between border-b border-neutral-800/60 last:border-0"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{client.name}</div>
                  {client.contactPerson && (
                    <div className="text-[10px] text-neutral-400">Attn: {client.contactPerson}</div>
                  )}
                </div>
                {clientName.toLowerCase() === client.name.toLowerCase() && (
                  <Check size={13} className="text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Contact Person
          </label>
          <input
            type="text"
            value={contactPerson || ''}
            onChange={(e) => onChangeField('clientContactPerson', e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Email
          </label>
          <input
            type="email"
            value={clientEmail || ''}
            onChange={(e) => onChangeField('clientEmail', e.target.value)}
            placeholder="client@company.com"
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Phone
          </label>
          <input
            type="text"
            value={clientPhone || ''}
            onChange={(e) => onChangeField('clientPhone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Client GSTIN (optional)
          </label>
          <input
            type="text"
            value={clientGstin || ''}
            onChange={(e) => onChangeField('clientGstin', e.target.value.toUpperCase())}
            placeholder="e.g. 09ABCDE1234F1Z5"
            className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none uppercase"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
          Address (optional)
        </label>
        <textarea
          rows={2}
          value={clientAddress || ''}
          onChange={(e) => onChangeField('clientAddress', e.target.value)}
          placeholder="Client street address, City, State, PIN"
          className="w-full bg-neutral-900 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none resize-none"
        />
      </div>
    </div>
  );
};

