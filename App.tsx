import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceData, INITIAL_INVOICE } from './types';
import EditorPanel from './components/EditorPanel';
import InvoicePaper from './components/InvoicePaper';
import { EyeIcon, PenIcon, DownloadIcon } from './components/Icons';

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(INITIAL_INVOICE);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // We add a specific ID to the invoice paper component to capture it
  const INVOICE_ELEMENT_ID = 'invoice-preview-area';

  const handleDownloadPDF = async () => {
    const element = document.getElementById(INVOICE_ELEMENT_ID);
    if (!element) return;

    setIsDownloading(true);

    try {
      // 1. Capture the DOM element as a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true, // For images if any
        logging: false,
        backgroundColor: '#ffffff'
      });

      // 2. Calculate dimensions for A4 PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 3. Generate PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // 4. Save
      // Format: {BillToEmail}_invoice_{InvoiceNumber}.pdf
      const emailPrefix = invoiceData.recipient.email || 'invoice';
      const cleanEmail = emailPrefix.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${invoiceData.recipient.email ? invoiceData.recipient.email : 'invoice'}_invoice_${invoiceData.invoiceNumber}.pdf`;
      
      pdf.save(fileName);

    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      
      {/* Mobile Navigation Bar - Visible only on small screens */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'edit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PenIcon className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <EyeIcon className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Mobile Download Button - Only visible in Preview mode */}
        {activeTab === 'preview' && (
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 text-brand-600 font-medium text-sm hover:text-brand-700 disabled:opacity-50"
          >
            {isDownloading ? (
              <span>Saving...</span>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" />
                <span>Save PDF</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Editor (Scrollable) */}
        <div className={`
          w-full lg:w-[400px] lg:flex-shrink-0 h-full border-r border-gray-200 bg-white z-10
          ${activeTab === 'edit' ? 'block' : 'hidden lg:block'}
        `}>
          <EditorPanel 
            data={invoiceData} 
            onChange={setInvoiceData} 
            onDownload={handleDownloadPDF}
            isDownloading={isDownloading}
          />
        </div>

        {/* Right Side: Preview (Scrollable Area) */}
        <div className={`
          flex-1 overflow-auto bg-gray-100 p-4 md:p-8 lg:p-12 justify-center items-start
          ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}
        `}>
          {/* Wrapper to center the paper and add margin */}
          <div className="w-full max-w-[210mm] transition-transform origin-top duration-300 transform scale-100 lg:scale-95 xl:scale-100">
            <InvoicePaper 
              id={INVOICE_ELEMENT_ID} 
              data={invoiceData} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;