export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  hsn: string;
  quantity: number;
  price: number;
  gstRate: number; // 5, 12, 18, 28
}

export interface Customer {
  name: string;
  gstin: string;
  state: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface BusinessProfile {
  name: string;
  gstin: string;
  state: string;
  address: string;
  email?: string;
  phone?: string;
  bankName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  accountHolderName?: string;
  logo?: string;
  signature?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: Customer;
  items: InvoiceItem[];
  taxType: 'INTRA' | 'INTER'; // INTRA = CGST+SGST, INTER = IGST
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}
