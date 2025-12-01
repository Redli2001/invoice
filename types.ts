export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  amount: number;
}

export interface PartyInfo {
  companyName: string;
  addressLine1: string;
  addressLine2: string; // City, State, Zip
  email: string;
  vatNumber?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  dateIssue: string;
  dateDue: string;
  sender: PartyInfo;
  recipient: PartyInfo;
  items: LineItem[];
  notes: string;
  currency: string;
  logoUrl?: string;
  logoAlignment: 'left' | 'right';
}

export const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: 'Q7MKP2R-8391',
  dateIssue: new Date().toISOString().split('T')[0],
  dateDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: '$',
  logoAlignment: 'right',
  sender: {
    companyName: 'MIRA MUSE LLC',
    addressLine1: '81807 E. County Road 22 Deer Trail',
    addressLine2: 'Colorado 80105 United States',
    email: 'support@miramuse.ai',
  },
  recipient: {
    companyName: 'Tech Corp GmbH',
    addressLine1: 'Musterstraße 12',
    addressLine2: '10115 Berlin, Germany',
    email: 'accounts@techcorp.de',
    vatNumber: 'DE123456789'
  },
  items: [
    {
      id: '1',
      description: 'Pro Plan Subscription (Monthly)',
      quantity: 1,
      amount: 49.90
    },
    {
      id: '2',
      description: 'Consulting Services - API Integration',
      quantity: 5,
      amount: 150.00
    }
  ],
  notes: 'Payment received in full. Thank you for your business!'
};