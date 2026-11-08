import React from 'react';
import { DocumentType, DocumentStatus } from '../../types';
import { formatDisplayDate } from '../../services/dateUtils';

interface MetaRowProps {
  type: DocumentType;
  documentNumber: string;
  date: string;
  dueDate?: string;
  validTill?: string;
  projectName?: string;
  status: DocumentStatus;
}

export const MetaRow: React.FC<MetaRowProps> = ({
  type,
  documentNumber,
  date,
  dueDate,
  status,
}) => {
  const isInvoice = type === 'invoice';

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 400,
    fontSize: '6.5pt',
    letterSpacing: '0.3em',
    wordSpacing: '0.7em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '10pt',
    color: '#0E0E0E',
    display: 'block',
    marginTop: '1.5mm',
    lineHeight: 1.2,
  };

  return (
    <div
      className="w-full box-border bg-white"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '3.5mm',
        paddingBottom: '3mm',
        borderBottom: '0.2mm solid #E5E5E5',
      }}
    >
      <div className={`grid ${isInvoice ? 'grid-cols-4' : 'grid-cols-3'} gap-[6mm] items-start`}>
        {/* Document Number */}
        <div>
          <span style={labelStyle}>
            {isInvoice ? 'INVOICE NO.' : 'RECEIPT NO.'}
          </span>
          <span style={valueStyle} className="font-mono">
            {documentNumber || '—'}
          </span>
        </div>

        {/* Date */}
        <div>
          <span style={labelStyle}>
            {isInvoice ? 'INVOICE DATE' : 'DATE'}
          </span>
          <span style={valueStyle}>
            {formatDisplayDate(date) || '—'}
          </span>
        </div>

        {/* Due Date (for Invoices) */}
        {isInvoice && (
          <div>
            <span style={labelStyle}>
              DUE DATE
            </span>
            <span style={valueStyle}>
              {formatDisplayDate(dueDate) || '—'}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div>
          <span style={labelStyle}>
            STATUS
          </span>
          <div style={{ marginTop: '1.5mm' }}>
            <span
              style={{
                display: 'inline-block',
                border: '0.35mm solid #0E0E0E',
                borderRadius: '2px',
                background: 'transparent',
                padding: '1.2mm 3mm',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '7pt',
                letterSpacing: '0.15em',
                wordSpacing: '0.4em',
                color: status === 'OVERDUE' ? '#DC2626' : '#0E0E0E',
                borderColor: status === 'OVERDUE' ? '#DC2626' : '#0E0E0E',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
