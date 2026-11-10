import React from 'react';
import { DocumentStatus } from '../../../types';
import { formatDisplayDate } from '../../../services/dateUtils';

interface QuotationMetaRowProps {
  documentNumber: string;
  date: string;
  validTill?: string;
  status: DocumentStatus;
}

export const QuotationMetaRow: React.FC<QuotationMetaRowProps> = ({
  documentNumber,
  date,
  validTill,
  status,
}) => {
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 500,
    fontSize: '6.5pt',
    letterSpacing: '0.28em',
    wordSpacing: '0.6em',
    color: '#8A8A8A',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: '9.5pt',
    color: '#0E0E0E',
    display: 'block',
    marginTop: '1.2mm',
    lineHeight: 1.25,
  };

  const getStatusBadgeStyle = (s: DocumentStatus): { border: string; bg: string; color: string } => {
    switch (s) {
      case 'ACCEPTED':
        return { border: '0.35mm solid #16A34A', bg: '#F0FDF4', color: '#15803D' };
      case 'REJECTED':
        return { border: '0.35mm solid #DC2626', bg: '#FEF2F2', color: '#B91C1C' };
      case 'EXPIRED':
        return { border: '0.35mm solid #D97706', bg: '#FFFBEB', color: '#B45309' };
      case 'SENT':
        return { border: '0.35mm solid #0284C7', bg: '#F0F9FF', color: '#0369A1' };
      case 'DRAFT':
      default:
        return { border: '0.35mm solid #0E0E0E', bg: '#FFFFFF', color: '#0E0E0E' };
    }
  };

  const badgeStyle = getStatusBadgeStyle(status);

  return (
    <div
      className="w-full box-border bg-white"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingTop: '2.5mm',
        paddingBottom: '2.5mm',
        borderBottom: '0.2mm solid #E5E5E5',
      }}
    >
      <div className="grid grid-cols-4 gap-[4mm] items-start">
        {/* 1. Quotation Number */}
        <div>
          <span style={labelStyle}>QUOTATION NO.</span>
          <span style={valueStyle} className="font-mono">
            {documentNumber || 'DEV-QT-2026-001'}
          </span>
        </div>

        {/* 2. Quotation Date */}
        <div>
          <span style={labelStyle}>QUOTATION DATE</span>
          <span style={valueStyle}>
            {formatDisplayDate(date) || '—'}
          </span>
        </div>

        {/* 3. Valid Till */}
        <div>
          <span style={labelStyle}>VALID TILL</span>
          <span style={valueStyle}>
            {formatDisplayDate(validTill) || '—'}
          </span>
        </div>

        {/* 4. Status Badge */}
        <div>
          <span style={labelStyle}>STATUS</span>
          <div style={{ marginTop: '1.2mm' }}>
            <span
              style={{
                display: 'inline-block',
                border: badgeStyle.border,
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.color,
                borderRadius: '2px',
                padding: '0.8mm 2.2mm',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: '7pt',
                letterSpacing: '0.18em',
                lineHeight: 1,
                textTransform: 'uppercase',
              }}
            >
              {status || 'DRAFT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
