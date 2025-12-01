import React from 'react';
import { InvoiceData } from '../types';
import { LogoIcon } from './Icons';

interface InvoicePaperProps {
  data: InvoiceData;
  id?: string;
}

const InvoicePaper: React.FC<InvoicePaperProps> = ({ data, id }) => {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
  const total = subtotal; // Can add tax logic later

  // Determine header layout direction based on logoAlignment
  const headerDirection = data.logoAlignment === 'left' ? 'flex-row-reverse' : 'flex-row';
  const textAlign = data.logoAlignment === 'left' ? 'text-right' : 'text-left';

  return (
    <div 
      id={id}
      className="w-full bg-white shadow-lg mx-auto p-12 md:p-16 min-h-[1000px] flex flex-col relative text-gray-800"
      style={{ maxWidth: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }} 
    >
      {/* Header: Logo and Invoice Title */}
      <div className={`flex justify-between items-start mb-14 ${headerDirection}`}>
        <div className={`flex flex-col ${textAlign === 'text-right' ? 'items-end' : 'items-start'}`}>
          <h1 className="text-4xl font-extrabold text-gray-950 tracking-tight mb-2 uppercase">Invoice</h1>
          <p className="text-gray-500 text-lg font-medium tracking-wide">#{data.invoiceNumber}</p>
        </div>
        <div>
           {data.logoUrl ? (
             <img 
               src={data.logoUrl} 
               alt="Company Logo" 
               className="h-16 w-auto object-contain max-w-[200px]"
             />
           ) : (
             <LogoIcon className="w-14 h-14" />
           )}
        </div>
      </div>

      {/* Dates & Sender/Recipient Grid */}
      <div className="flex flex-col gap-10 mb-12">
        <div className="flex justify-between items-start">
             {/* Left: Addresses */}
             <div className="w-3/5 flex flex-col gap-8">
                 <div className="flex flex-col">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">From</h3>
                    <div className="text-gray-900 text-sm leading-relaxed">
                        <p className="font-bold text-base text-gray-950 mb-1">{data.sender.companyName}</p>
                        <p className="text-gray-600">{data.sender.addressLine1}</p>
                        <p className="text-gray-600">{data.sender.addressLine2}</p>
                        <p className="text-gray-500 mt-1">{data.sender.email}</p>
                    </div>
                 </div>

                 <div className="flex flex-col">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</h3>
                    <div className="text-gray-900 text-sm leading-relaxed">
                        <p className="font-bold text-base text-gray-950 mb-1">{data.recipient.companyName}</p>
                        <p className="text-gray-600">{data.recipient.addressLine1}</p>
                        <p className="text-gray-600">{data.recipient.addressLine2}</p>
                        {data.recipient.vatNumber && <p className="text-gray-600">VAT: {data.recipient.vatNumber}</p>}
                        <p className="text-gray-500 mt-1">{data.recipient.email}</p>
                    </div>
                 </div>
             </div>

             {/* Right: Meta Data */}
             <div className="w-2/5 text-right space-y-6">
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</span>
                    <span className="text-base font-semibold text-gray-900">{data.dateIssue}</span>
                </div>
                <div>
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Due</span>
                    <span className="text-base font-semibold text-gray-900">{data.dateDue}</span>
                </div>
             </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-900">
              <th className="text-left py-4 font-bold text-[11px] uppercase tracking-wider text-gray-600 w-1/2">Description</th>
              <th className="text-center py-4 font-bold text-[11px] uppercase tracking-wider text-gray-600">Qty</th>
              <th className="text-right py-4 font-bold text-[11px] uppercase tracking-wider text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                <td className="py-5 pr-4 align-top font-medium text-gray-900 text-sm">{item.description}</td>
                <td className="py-5 align-top text-center tabular-nums text-gray-600 text-sm">{item.quantity}</td>
                <td className="py-5 align-top text-right tabular-nums font-semibold text-gray-900 text-sm">
                  {data.currency}{item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-20">
        <div className="w-full md:w-5/12 space-y-4">
          <div className="flex justify-between text-gray-600 text-sm py-1">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium text-gray-900">{data.currency}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm py-1">
            <span>Total</span>
            <span className="tabular-nums font-medium text-gray-900">{data.currency}{total.toFixed(2)}</span>
          </div>
          
          <div className="my-4 border-t border-gray-900"></div>

          <div className="flex justify-between items-baseline text-gray-900">
            <span className="text-sm font-bold uppercase tracking-wider">Amount Due</span>
            <span className="tabular-nums font-bold text-3xl tracking-tight">{data.currency}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes / Footer */}
      <div className="mt-auto pt-8 border-t border-gray-100">
        <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-widest mb-3">Notes</h4>
        <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
          {data.notes}
        </p>
      </div>
    </div>
  );
};

export default InvoicePaper;