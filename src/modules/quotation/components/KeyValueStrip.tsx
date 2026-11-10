import React from 'react';
import { QUOTATION_TOKENS } from '../tokens';
import { formatDisplayDate } from '../../../services/dateUtils';

interface KeyValueStripProps {
  heading?: string;
  billingCycle?: string;
  startDate?: string;
  minTermMonths?: number;
  paymentDue?: string;
  noticeDays?: number;
  autoRenewal?: string;
}

export const KeyValueStrip: React.FC<KeyValueStripProps> = ({
  heading = 'BILLING & TERM',
  billingCycle = 'Monthly',
  startDate,
  minTermMonths = 3,
  paymentDue = 'In advance, on or before the 1st of each cycle',
  noticeDays = 30,
  autoRenewal = 'Auto-renews monthly until cancelled in writing',
}) => {
  const labelStyle: React.CSSProperties = {
    fontFamily: QUOTATION_TOKENS.font.family,
    fontSize: '6.8pt',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: QUOTATION_TOKENS.colors.greyMid,
    display: 'block',
    marginBottom: '0.8mm',
    lineHeight: 1,
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: QUOTATION_TOKENS.font.family,
    fontSize: '8.8pt',
    fontWeight: 600,
    color: QUOTATION_TOKENS.colors.black,
    margin: 0,
    lineHeight: 1.25,
  };

  return (
    <div
      data-section="quotation-key-value-strip"
      className="box-border select-none"
      style={{
        width: QUOTATION_TOKENS.layout.contentWidth, // 174mm
        boxSizing: 'border-box',
      }}
    >
      {/* Top Black Header Bar ("black patti jaise baki sabme hai") */}
      <div
        className="flex items-center w-full"
        style={{
          backgroundColor: QUOTATION_TOKENS.colors.black,
          paddingLeft: '4.5mm',
          paddingRight: '4.5mm',
          height: '7.5mm',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontFamily: QUOTATION_TOKENS.font.family,
            fontSize: '7pt',
            fontWeight: 700,
            letterSpacing: '0.22em',
            wordSpacing: '0.5em',
            textTransform: 'uppercase',
            color: QUOTATION_TOKENS.colors.white,
            lineHeight: 1,
          }}
        >
          {heading}
        </span>
      </div>

      {/* Main Body with Light Gray Background ("niche ka gray me kar do") */}
      <div
        className="w-full"
        style={{
          backgroundColor: QUOTATION_TOKENS.colors.noteBackground,
          padding: '3.5mm 4.5mm',
          boxSizing: 'border-box',
        }}
      >
        {/* ROW 1: 4 columns */}
        <div className="flex items-start w-full" style={{ paddingBottom: '2.5mm' }}>
          {/* Col 1: BILLING CYCLE */}
          <div style={{ width: '36mm', paddingRight: '2mm' }}>
            <span style={labelStyle}>BILLING CYCLE</span>
            <p style={valueStyle}>{billingCycle}</p>
          </div>

          {/* Col 2: START DATE */}
          <div style={{ width: '38mm', paddingRight: '2mm' }}>
            <span style={labelStyle}>START DATE</span>
            <p style={valueStyle}>
              {startDate ? formatDisplayDate(startDate) : 'Upon Agreement'}
            </p>
          </div>

          {/* Col 3: MINIMUM TERM */}
          <div style={{ width: '34mm', paddingRight: '2mm' }}>
            <span style={labelStyle}>MINIMUM TERM</span>
            <p style={valueStyle}>
              {minTermMonths} {minTermMonths === 1 ? 'Month' : 'Months'}
            </p>
          </div>

          {/* Col 4: PAYMENT DUE */}
          <div className="flex-1">
            <span style={labelStyle}>PAYMENT DUE</span>
            <p style={valueStyle}>{paymentDue}</p>
          </div>
        </div>

        {/* Divider hairline between rows */}
        <div
          style={{
            width: '100%',
            height: '0.2mm',
            backgroundColor: QUOTATION_TOKENS.colors.boxBorder,
            marginBottom: '2.5mm',
          }}
        />

        {/* ROW 2: NOTICE PERIOD + RENEWAL */}
        <div className="flex items-start w-full">
          {/* Col 1: NOTICE PERIOD */}
          <div style={{ width: '36mm', paddingRight: '2mm' }}>
            <span style={labelStyle}>NOTICE PERIOD</span>
            <p style={valueStyle}>{noticeDays} Days Written Notice</p>
          </div>

          {/* Col 2: RENEWAL */}
          <div className="flex-1">
            <span style={labelStyle}>RENEWAL</span>
            <p style={valueStyle}>{autoRenewal}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
