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

  const INVOICE_ELEMENT_ID = 'invoice-preview-area';

  const handleDownloadPDF = async () => {
    const element = document.getElementById(INVOICE_ELEMENT_ID);
    if (!element) return;

    setIsDownloading(true);

    try {
      // Robust PDF Generation Strategy: Clone & Capture
      // This bypasses issues with scrolling, CSS transforms, and flex layouts in the main app view.
      
      // 1. Create a temporary container for the capture
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      // Width must match the A4 ratio width we expect
      container.style.width = '210mm'; 
      container.style.zIndex = '-1';
      document.body.appendChild(container);

      // 2. Clone the invoice element
      // We perform a deep clone of the React rendered DOM node
      const clone = element.cloneNode(true) as HTMLElement;
      
      // 3. Reset specific styles on the clone to ensure perfect capture
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      
      // Append clone to temp container
      container.appendChild(clone);

      // 4. Capture using html2canvas
      // Waiting a tick ensures DOM update
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2, // High resolution
        useCORS: true, // Handle images
        logging: false,
        backgroundColor: '#ffffff',
        width: 794, // Approx 210mm at 96 DPI
        windowWidth: 794
      });

      // 5. Cleanup
      document.body.removeChild(container);

      // 6. Generate PDF
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // 7. Save File
      const emailPrefix = invoiceData.recipient.email || 'invoice';
      // Sanitize filename
      const safeEmail = emailPrefix.split('@')[0].replace(/[^a-zA-Z0-9-_]/g, '');
      const fileName = `${safeEmail ? safeEmail : 'invoice'}_invoice_${invoiceData.invoiceNumber}.pdf`;
      
      pdf.save(fileName);

    } catch (error: any) {
      console.error('PDF Generation failed:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
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