import React, { useState } from 'react';
import { extractBillingInfo } from '../services/geminiService';
import { PartyInfo } from '../types';
import { SparklesIcon } from './Icons';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: PartyInfo) => void;
}

const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyError, setIsKeyError] = useState(false);

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError(null);
    setIsKeyError(false);
    
    try {
      const data = await extractBillingInfo(inputText);
      onSuccess(data);
      onClose();
      setInputText('');
    } catch (err: any) {
      // Check for our specific missing key error
      if (err.message === 'API_KEY_MISSING' || err.message.includes('API Key')) {
        setIsKeyError(true);
        setError('Google Gemini API Key is not configured.');
      } else {
        setError(err.message || 'Failed to extract data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 bg-brand-50 border-b border-brand-100 flex items-center gap-3">
          <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
            <SparklesIcon />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI Auto-Fill</h2>
            <p className="text-xs text-gray-500">Paste email signature or invoice request text</p>
          </div>
        </div>
        
        <div className="p-6">
          <textarea
            className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm text-gray-700 bg-gray-50 placeholder-gray-400"
            placeholder="e.g. Please bill this to John Doe at Acme Corp, 123 Main St, New York. My VAT is 999..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          {error && (
            <div className={`mt-3 text-xs p-3 rounded border ${isKeyError ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <strong>{isKeyError ? 'Configuration Required' : 'Error'}:</strong> {error}
              
              {isKeyError && (
                <div className="mt-2 pl-2 border-l-2 border-amber-300">
                  <p className="mb-1">To enable AI features on Vercel:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-amber-700">
                    <li>
                      <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="underline font-bold text-brand-700 hover:text-brand-900"
                      >
                        Click here to get your API Key
                      </a> (It starts with "AIza...")
                    </li>
                    <li>In Vercel Dashboard, go to <b>Settings &gt; Environment Variables</b>.</li>
                    <li>Add Key: <code>API_KEY</code>, Value: <code>[Paste your AIza... string]</code>.</li>
                    <li>Redeploy your application.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExtract}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                Extract Info
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;