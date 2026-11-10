import React from 'react';
import { BillingDocument } from '../../../types';
import { ClientSelector } from '../ClientSelector';

interface FormPartyDetailsProps {
  document: BillingDocument;
  onChange: (updated: BillingDocument) => void;
  updateField: <K extends keyof BillingDocument>(field: K, value: BillingDocument[K]) => void;
}

export const FormPartyDetails: React.FC<FormPartyDetailsProps> = ({
  document: doc,
  onChange,
  updateField,
}) => {
  const isQuotation = doc.type === 'quotation';

  return (
    <div className="space-y-4">
      {/* Project / Service Name & Estimated Delivery */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl space-y-3">
        <div>
          <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
            Project / Service Title
          </label>
          <input
            type="text"
            value={doc.projectName || ''}
            onChange={(e) => updateField('projectName', e.target.value)}
            placeholder="e.g. FMCG Video Editing – 15 Videos"
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none font-medium"
          />
        </div>

        {isQuotation && (
          <div>
            <label className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
              Estimated Delivery (Short Line on Document Party Row)
            </label>
            <input
              type="text"
              value={doc.estimatedDelivery || ''}
              onChange={(e) => updateField('estimatedDelivery', e.target.value)}
              placeholder="e.g. 10 working days after advance and materials"
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-white text-white text-xs px-3 py-1.5 rounded outline-none"
            />
          </div>
        )}
      </div>

      {/* Client Information */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl">
        <ClientSelector
          clientName={doc.clientName}
          contactPerson={doc.clientContactPerson}
          clientAddress={doc.clientAddress}
          clientPhone={doc.clientPhone}
          clientEmail={doc.clientEmail}
          clientGstin={doc.clientGstin}
          onSelectClient={(client) => {
            onChange({
              ...doc,
              clientId: client.id,
              clientName: client.name || doc.clientName,
              clientContactPerson: client.contactPerson || doc.clientContactPerson,
              clientAddress: client.address || doc.clientAddress,
              clientPhone: client.phone || doc.clientPhone,
              clientEmail: client.email || doc.clientEmail,
              clientGstin: client.gstin || doc.clientGstin,
            });
          }}
          onChangeField={(field, val) => updateField(field as keyof BillingDocument, val as any)}
        />
      </div>
    </div>
  );
};

