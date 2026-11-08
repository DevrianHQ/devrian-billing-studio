import React from 'react';
import { DocumentType } from '../../types';

interface DocumentFooterProps {
  type: DocumentType;
  documentNumber: string;
  udyamNo?: string;
  email?: string;
  currentPage: number;
  totalPages: number;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({
  type,
  documentNumber,
  udyamNo = 'UDYAM-UP-54-0127731',
  email = 'inquiry@devrian.in',
  currentPage,
  totalPages,
}) => {
  const getTypeLabel = () => {
    switch (type) {
      case 'invoice':
        return 'Invoice';
      case 'receipt':
        return 'Payment Receipt';
      case 'quotation':
        return 'Quotation';
    }
  };

  return (
    <div
      className="w-full box-border mt-auto select-none"
      style={{
        paddingLeft: '18mm',
        paddingRight: '18mm',
        paddingBottom: '4mm',
      }}
    >
      <div
        style={{
          borderTop: '0.2mm solid #E5E5E5',
          paddingTop: '1.5mm',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '6.5pt',
          color: '#8A8A8A',
        }}
        className="flex items-center justify-between"
      >
        {/* Left: DEVRIAN | <Doc type> <number> */}
        <div style={{ fontWeight: 500, color: '#7A7A7A' }}>
          DEVRIAN | {getTypeLabel()} {documentNumber}
        </div>

        {/* Right: inquiry@devrian.in (and Page X of Y if multi-page) */}
        <div style={{ fontWeight: 500, color: '#7A7A7A' }} className="text-right flex items-center gap-1.5">
          <span>{email}</span>
          {totalPages > 1 && (
            <>
              <span>·</span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
