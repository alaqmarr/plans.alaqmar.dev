import React from 'react';
import { format } from 'date-fns';

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
  total: number;
}

interface PrintableInvoiceProps {
  invoiceNumber: string;
  date: Date;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  bankDetails: {
    payeeName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
}

export default function PrintableInvoice({
  invoiceNumber,
  date,
  clientName,
  items,
  subtotal,
  discount,
  grandTotal,
  bankDetails,
  contact,
}: PrintableInvoiceProps) {
  const accent = "#43926A";
  const accentLight = "#EDF7F0";
  const dark = "#1A2E35";
  const mid = "#4A5D68";
  const light = "#8A9AA3";
  const border = "#E2E8F0";

  return (
    <div
      id="printable-invoice"
      style={{
        backgroundColor: '#ffffff',
        width: '794px',
        height: '1123px',
        overflow: 'hidden',
        padding: '0',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: dark,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div style={{ height: '5px', backgroundColor: accent, flexShrink: 0 }} />

      {/* Header */}
      <table style={{ width: '100%', borderCollapse: 'collapse', flexShrink: 0 }}>
        <tbody>
          <tr>
            <td style={{ padding: '30px 45px 20px', verticalAlign: 'top', width: '55%' }}>
              <div style={{ fontWeight: 900, fontSize: '26px', lineHeight: '1.1', color: accent }}>THE WEB SENSEI</div>
              <div style={{ fontSize: '9px', marginTop: '8px', color: light, letterSpacing: '2px', fontWeight: 600 }}>SECUNDERABAD 500015, TELANGANA</div>
            </td>
            <td style={{ padding: '30px 45px 20px', verticalAlign: 'top', textAlign: 'right', width: '45%' }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: dark, letterSpacing: '-1px', lineHeight: '1' }}>INVOICE</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: accent, letterSpacing: '1px', marginTop: '5px' }}>#{invoiceNumber}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: border, margin: '0 45px', flexShrink: 0 }} />

      {/* Client & Meta */}
      <table style={{ width: '100%', borderCollapse: 'collapse', flexShrink: 0 }}>
        <tbody>
          <tr>
            <td style={{ padding: '20px 45px', verticalAlign: 'top', width: '55%' }}>
              <div style={{ fontSize: '8px', fontWeight: 700, color: light, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>Billed To</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: dark, textTransform: 'uppercase', lineHeight: '1.3' }}>{clientName}</div>
            </td>
            <td style={{ padding: '20px 45px', verticalAlign: 'top', textAlign: 'right', width: '45%' }}>
              <table style={{ borderCollapse: 'collapse', marginLeft: 'auto' }}>
                <tbody>
                  <tr>
                    <td style={{ fontSize: '8px', fontWeight: 700, color: light, letterSpacing: '2px', paddingBottom: '4px', paddingRight: '14px', textAlign: 'right' }}>DATE</td>
                    <td style={{ fontSize: '11px', fontWeight: 700, color: dark, paddingBottom: '4px', textAlign: 'right' }}>{format(date, 'dd MMM, yyyy')}</td>
                  </tr>
                  <tr>
                    <td style={{ fontSize: '8px', fontWeight: 700, color: light, letterSpacing: '2px', paddingRight: '14px', textAlign: 'right' }}>INVOICE NO</td>
                    <td style={{ fontSize: '11px', fontWeight: 700, color: dark, textAlign: 'right' }}>{invoiceNumber}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Items Table — this section grows to fill available space */}
      <div style={{ padding: '0 45px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: accent, color: '#fff', fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', padding: '12px 16px', textAlign: 'left', textTransform: 'uppercase' }}>Description</th>
              <th style={{ backgroundColor: accent, color: '#fff', fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', padding: '12px 12px', textAlign: 'center', textTransform: 'uppercase', width: '60px' }}>Qty</th>
              <th style={{ backgroundColor: accent, color: '#fff', fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', padding: '12px 12px', textAlign: 'right', textTransform: 'uppercase', width: '100px' }}>Rate</th>
              <th style={{ backgroundColor: accent, color: '#fff', fontWeight: 700, fontSize: '9px', letterSpacing: '1.5px', padding: '12px 16px', textAlign: 'right', textTransform: 'uppercase', width: '100px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 600, color: dark, borderBottom: `1px solid ${border}` }}>{item.description}</td>
                <td style={{ padding: '14px 12px', fontSize: '12px', fontWeight: 600, color: mid, textAlign: 'center', borderBottom: `1px solid ${border}` }}>{item.qty}</td>
                <td style={{ padding: '14px 12px', fontSize: '12px', fontWeight: 600, color: mid, textAlign: 'right', borderBottom: `1px solid ${border}` }}>₹{item.price.toLocaleString('en-IN')}</td>
                <td style={{ padding: '14px 16px', fontSize: '12px', fontWeight: 700, color: dark, textAlign: 'right', borderBottom: `1px solid ${border}` }}>₹{item.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* This spacer fills remaining vertical space so totals sit at the bottom of the items area */}
        <div style={{ flex: 1 }} />

        {/* Totals */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '55%' }}></td>
              <td colSpan={2} style={{ padding: '0 16px 8px' }}><div style={{ height: '1px', backgroundColor: border }} /></td>
            </tr>
            <tr>
              <td></td>
              <td style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 700, color: mid, textAlign: 'right', letterSpacing: '1px', textTransform: 'uppercase' }}>Subtotal</td>
              <td style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 700, color: dark, textAlign: 'right', width: '100px' }}>₹{subtotal.toLocaleString('en-IN')}</td>
            </tr>
            {discount > 0 && (
              <tr>
                <td></td>
                <td style={{ padding: '4px 12px', fontSize: '10px', fontWeight: 700, color: mid, textAlign: 'right', letterSpacing: '1px', textTransform: 'uppercase' }}>Discount</td>
                <td style={{ padding: '4px 16px', fontSize: '12px', fontWeight: 700, color: accent, textAlign: 'right' }}>-₹{discount.toLocaleString('en-IN')}</td>
              </tr>
            )}
            <tr>
              <td></td>
              <td style={{ padding: '10px 12px 16px', fontSize: '11px', fontWeight: 800, color: dark, textAlign: 'right', letterSpacing: '1px', textTransform: 'uppercase' }}>Grand Total</td>
              <td style={{ padding: '10px 16px 16px', fontSize: '18px', fontWeight: 900, color: accent, textAlign: 'right' }}>₹{grandTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bank & Terms */}
      <table style={{ width: '694px', borderCollapse: 'separate', borderSpacing: '10px 0', margin: '0 auto', flexShrink: 0 }}>
        <tbody>
          <tr>
            <td style={{ backgroundColor: accentLight, borderRadius: '6px', padding: '16px 18px', verticalAlign: 'top', width: '50%' }}>
              <div style={{ fontSize: '8px', fontWeight: 800, color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Payment Details</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: dark, lineHeight: '1.8' }}>
                <span style={{ color: mid }}>Payee:</span> {bankDetails.payeeName}<br />
                <span style={{ color: mid }}>A/C No:</span> {bankDetails.accountNumber}<br />
                <span style={{ color: mid }}>IFSC:</span> {bankDetails.ifsc}
              </div>
            </td>
            <td style={{ backgroundColor: accentLight, borderRadius: '6px', padding: '16px 18px', verticalAlign: 'top', width: '50%' }}>
              <div style={{ fontSize: '8px', fontWeight: 800, color: accent, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Note &amp; Terms</div>
              <div style={{ fontSize: '9px', fontWeight: 600, color: mid, lineHeight: '1.7' }}>
                This is a system-generated invoice and does not require a physical signature. Payment is due immediately upon receipt. All figures are final per the initial agreement.
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ backgroundColor: dark, padding: '14px 45px', marginTop: '16px', flexShrink: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ fontSize: '9px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.5px', opacity: 0.8, textAlign: 'left', width: '33%' }}>{contact.phone}</td>
              <td style={{ fontSize: '9px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.5px', opacity: 0.8, textAlign: 'center', width: '34%' }}>{contact.email}</td>
              <td style={{ fontSize: '9px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.5px', opacity: 0.8, textAlign: 'right', width: '33%' }}>{contact.website}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
