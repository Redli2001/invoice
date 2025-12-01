import React, { useState, useRef } from 'react';
import { InvoiceData, LineItem, PartyInfo } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, DownloadIcon, RefreshIcon, UploadIcon, AlignLeftIcon, AlignRightIcon } from './Icons';
import AIModal from './AIModal';

interface EditorPanelProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onDownload: () => void;
  isDownloading: boolean;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ data, onChange, onDownload, isDownloading }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (section: keyof InvoiceData, field: string, value: any) => {
    if (section === 'sender' || section === 'recipient') {
      onChange({
        ...data,
        [section]: {
          ...(data[section] as PartyInfo),
          [field]: value
        }
      });
    } else {
      onChange({
        ...data,
        [field]: value
      });
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Item',
      quantity: 1,
      amount: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    onChange({ ...data, items: newItems });
  };

  const handleAISuccess = (extractedData: PartyInfo) => {
    onChange({
      ...data,
      recipient: { ...data.recipient, ...extractedData }
    });
  };

  const generateRandomInvoiceNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let part1 = '';
    for (let i = 0; i < 7; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const newNumber = `${part1}-${part2}`;
    updateField('invoiceNumber' as any, 'invoiceNumber', newNumber);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...data, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full bg-white p-6 shadow-sm border-r border-gray-200 overflow-y-auto custom-scrollbar">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Edit Invoice</h2>
        <button 
          onClick={onDownload}
          disabled={isDownloading}
          className="hidden lg:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70"
        >
          {isDownloading ? 'Saving...' : (
             <>
               <DownloadIcon className="w-4 h-4" />
               <span>Export PDF</span>
             </>
          )}
        </button>
      </div>

      <div className="space-y-8">
        
        {/* Branding Section */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Branding</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Logo Image</label>
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 bg-white shadow-sm transition-all"
                >
                  <UploadIcon className="w-4 h-4" />
                  Upload Logo
                </button>
                {data.logoUrl && (
                  <button 
                    onClick={() => onChange({ ...data, logoUrl: undefined })}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Logo Position</label>
              <div className="flex bg-gray-100 p-1 rounded-lg w-max">
                <button
                  onClick={() => onChange({...data, logoAlignment: 'left'})}
                  className={`p-1.5 rounded-md transition-all ${data.logoAlignment === 'left' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Left Align"
                >
                  <AlignLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onChange({...data, logoAlignment: 'right'})}
                  className={`p-1.5 rounded-md transition-all ${data.logoAlignment === 'right' ? 'bg-white shadow text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Right Align"
                >
                  <AlignRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Invoice Meta */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={data.invoiceNumber}
                  onChange={(e) => updateField('invoiceNumber' as any, 'invoiceNumber', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors font-mono"
                />
                <button 
                  onClick={generateRandomInvoiceNumber}
                  className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded border border-gray-200 transition-colors"
                  title="Generate Random Number"
                >
                  <RefreshIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Currency Symbol</label>
               <input 
                type="text" 
                value={data.currency}
                onChange={(e) => updateField('currency' as any, 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Issued Date</label>
              <input 
                type="date" 
                value={data.dateIssue}
                onChange={(e) => updateField('dateIssue' as any, 'dateIssue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
              <input 
                type="date" 
                value={data.dateDue}
                onChange={(e) => updateField('dateDue' as any, 'dateDue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Sender (From) */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">From (Sender)</h3>
          <div className="space-y-3">
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company / Name</label>
              <input 
                type="text" 
                value={data.sender.companyName}
                onChange={(e) => updateField('sender', 'companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
              <input 
                type="text" 
                value={data.sender.addressLine1}
                onChange={(e) => updateField('sender', 'addressLine1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
              <input 
                type="text" 
                value={data.sender.addressLine2}
                onChange={(e) => updateField('sender', 'addressLine2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input 
                type="email" 
                value={data.sender.email}
                onChange={(e) => updateField('sender', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
          </div>
        </section>

        {/* Bill To */}
        <section className="space-y-4 bg-brand-50/50 p-4 rounded-xl border border-brand-100/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-brand-700 uppercase tracking-wider">Bill To</h3>
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-white px-2 py-1 rounded shadow-sm hover:shadow transition-all border border-brand-100"
            >
              <SparklesIcon className="w-3 h-3" />
              AI Extract
            </button>
          </div>
          <div className="space-y-3">
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Company / Name</label>
              <input 
                type="text" 
                value={data.recipient.companyName}
                onChange={(e) => updateField('recipient', 'companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input 
                type="email" 
                value={data.recipient.email}
                onChange={(e) => updateField('recipient', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 1</label>
              <input 
                type="text" 
                value={data.recipient.addressLine1}
                onChange={(e) => updateField('recipient', 'addressLine1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address Line 2</label>
              <input 
                type="text" 
                value={data.recipient.addressLine2}
                onChange={(e) => updateField('recipient', 'addressLine2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">VAT Number</label>
              <input 
                type="text" 
                value={data.recipient.vatNumber || ''}
                onChange={(e) => updateField('recipient', 'vatNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500 transition-colors bg-white"
              />
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="space-y-4">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Line Items</h3>
           <div className="space-y-3">
             {data.items.map((item, index) => (
               <div key={item.id} className="flex gap-2 items-start group">
                 <div className="flex-1 space-y-2">
                   <input 
                      type="text" 
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500"
                   />
                   <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500"
                      />
                       <input 
                        type="number" 
                        placeholder="Price"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                        className="w-28 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand-500"
                      />
                   </div>
                 </div>
                 <button 
                  onClick={() => removeItem(index)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                 >
                   <TrashIcon className="w-4 h-4" />
                 </button>
               </div>
             ))}
             <button 
              onClick={addItem}
              className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-sm font-medium hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
             >
               <PlusIcon className="w-4 h-4" />
               Add Item
             </button>
           </div>
        </section>
      </div>

      <AIModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onSuccess={handleAISuccess}
      />
    </div>
  );
};

export default EditorPanel;