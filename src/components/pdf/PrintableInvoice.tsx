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
  // Brand colors
  const primaryGreen = "#43926A";
  const softGreen = "#F4FAF3";
  const darkTeal = "#1D4443";
  const textGray = "#4A5568";

  return (
    <div id="printable-invoice" className="bg-white" style={{ width: '800px', padding: '60px', fontFamily: '"Outfit", sans-serif', color: darkTeal }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '36px', lineHeight: '1.2', margin: 0, color: primaryGreen }}>
            THE<br/>WEB SENSEI
          </h1>
          <p style={{ fontSize: '11px', marginTop: '15px', color: textGray, letterSpacing: '2px', fontWeight: 700, lineHeight: '1.5' }}>
            SECUNDERABAD 500015<br/>
            TELANGANA.
          </p>
        </div>
        
        <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 700, color: textGray, letterSpacing: '1.5px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '6px' }}>
            <span>CUSTOMER ID:</span>
            <span style={{ color: darkTeal, fontWeight: 800, width: '120px', textAlign: 'right' }}>{invoiceNumber.split('-').pop()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '6px' }}>
            <span>DATE:</span>
            <span style={{ color: darkTeal, fontWeight: 800, width: '120px', textAlign: 'right' }}>{format(date, 'dd/MM/yyyy')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <span>TO:</span>
            <span style={{ color: darkTeal, fontWeight: 800, width: '120px', textAlign: 'right', textTransform: 'uppercase', lineHeight: '1.4' }}>
              {clientName}
            </span>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div style={{ backgroundColor: primaryGreen, borderRadius: '8px', padding: '16px 24px', display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr', color: 'white', fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>
        <div>ITEM DESCRIPTION</div>
        <div style={{ textAlign: 'center' }}>QTY</div>
        <div style={{ textAlign: 'right' }}>PRICE</div>
        <div style={{ textAlign: 'right' }}>TOTAL</div>
      </div>

      {/* Table Body & Totals */}
      <div style={{ backgroundColor: softGreen, borderRadius: '8px', padding: '30px 24px', marginTop: '12px', minHeight: '250px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ flex: 1 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1.5fr', fontSize: '13px', fontWeight: 700, marginBottom: '20px', color: darkTeal }}>
              <div>{item.description}</div>
              <div style={{ textAlign: 'center' }}>{item.qty}</div>
              <div style={{ textAlign: 'right' }}>₹ {item.price.toLocaleString('en-IN')}</div>
              <div style={{ textAlign: 'right' }}>₹ {item.total.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>

        {/* Totals Divider */}
        <div style={{ height: '1px', backgroundColor: primaryGreen, opacity: 0.3, margin: '20px 0' }} />

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: darkTeal }}>
              <span>SUB TOTAL</span>
              <span>₹ {subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, marginBottom: '12px', color: darkTeal }}>
                <span>DISC</span>
                <span>₹ {discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900, color: darkTeal, marginTop: '8px' }}>
              <span>GRAND TOTAL</span>
              <span>₹ {grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Bank Details */}
        <div style={{ backgroundColor: softGreen, borderRadius: '8px', padding: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: primaryGreen, letterSpacing: '1px', marginBottom: '16px' }}>BANK DETAILS</div>
          
          <div style={{ fontSize: '12px', fontWeight: 800, color: darkTeal, marginBottom: '16px' }}>
            PAYEE NAME: {bankDetails.payeeName}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 800, color: darkTeal, lineHeight: '1.6' }}>
            {bankDetails.bankName}:<br/>
            {bankDetails.accountNumber}<br/>
            {bankDetails.ifsc}
          </div>
        </div>

        {/* Terms */}
        <div style={{ backgroundColor: softGreen, borderRadius: '8px', padding: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: primaryGreen, letterSpacing: '1px', marginBottom: '16px' }}>TERMS AND CONDITIONS:</div>
          
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', fontWeight: 700, color: darkTeal, lineHeight: '1.8' }}>
            <li>ALL PRICES QUOTED ARE VALID FOR 15 DAYS.</li>
            <li>PAYMENT TERMS AS:
              <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                <li>ADVANCE - 100% OF THE INVOICE AMOUNT.</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: softGreen, borderRadius: '8px', padding: '16px 24px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: textGray, letterSpacing: '1px' }}>
        <div>{contact.phone}</div>
        <div>{contact.email}</div>
        <div>{contact.website}</div>
      </div>

    </div>
  );
}
