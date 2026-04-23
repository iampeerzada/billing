import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Download, Calculator, RefreshCw, Printer, ChevronDown, ChevronUp, Palette, Upload, Image, FileDown, MessageCircle, Mail } from 'lucide-react';
import { InvoiceItem, Customer, BusinessProfile } from '../types';
import { numberToWords } from '../utils/currencyUtils';
import { API_URL } from '../config';
import { sendWhatsAppMessage } from '../services/whatsappService';
import html2pdf from 'html2pdf.js';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi"
];

const GST_RATES = [0, 5, 12, 18, 28];

const INVOICE_THEMES = [
  {
    id: 'classic',
    name: 'Classic (Traditional)',
    description: 'Formal navy header, full borders, serif fonts. Best for official documentation.',
    styles: {
      container: 'p-8 font-serif bg-white max-w-[210mm] mx-auto min-h-[297mm] relative',
      header: 'bg-slate-900 text-white p-8 -mx-8 -mt-8 mb-8 flex justify-between items-start',
      headerText: 'text-white',
      headerSubtext: 'text-slate-300',
      sectionTitle: 'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2',
      table: 'w-full mb-8 border-2 border-slate-900',
      tableHeader: 'bg-slate-100 border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-xs',
      tableRow: 'border-b border-slate-900',
      tableCell: 'border-r border-slate-900 py-2 px-3 text-sm',
      summary: 'border-2 border-slate-900 p-4',
      totalLabel: 'text-lg font-bold text-slate-900',
      totalValue: 'text-xl font-bold text-slate-900',
      accentColor: 'text-slate-900',
      badge: 'bg-white text-slate-900 px-2 py-1 rounded text-xs font-bold'
    }
  },
  {
    id: 'modern',
    name: 'Modern (Tech/Clean)',
    description: 'Clean lines, indigo accents, rounded styling. Best for digital startups.',
    styles: {
      container: 'p-8 font-sans bg-white max-w-[210mm] mx-auto min-h-[297mm] relative',
      header: 'flex justify-between items-start mb-12',
      headerText: 'text-slate-900',
      headerSubtext: 'text-slate-500',
      sectionTitle: 'text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2',
      table: 'w-full mb-8',
      tableHeader: 'text-indigo-600 uppercase tracking-wider text-xs font-bold border-b border-indigo-100 pb-3',
      tableRow: 'border-b border-indigo-50',
      tableCell: 'py-4 px-3 text-sm text-slate-600',
      summary: 'bg-indigo-50/50 rounded-xl p-6',
      totalLabel: 'text-lg font-bold text-slate-900',
      totalValue: 'text-3xl font-bold text-indigo-600',
      accentColor: 'text-indigo-600',
      badge: 'bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold'
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist (Ink Saver)',
    description: 'High whitespace, black & white only. Best for thermal/laser printing.',
    styles: {
      container: 'p-8 font-mono bg-white max-w-[210mm] mx-auto min-h-[297mm] relative',
      header: 'flex justify-between items-start mb-8 border-b-2 border-black pb-8',
      headerText: 'text-black',
      headerSubtext: 'text-slate-600',
      sectionTitle: 'text-xs font-bold text-black uppercase tracking-wider mb-2 border-b border-black w-fit',
      table: 'w-full mb-8 border-t-2 border-b-2 border-black',
      tableHeader: 'text-black font-bold uppercase text-xs py-2 border-b border-black',
      tableRow: 'border-b border-dashed border-slate-300',
      tableCell: 'py-3 px-3 text-sm text-black',
      summary: 'pt-4',
      totalLabel: 'text-lg font-bold text-black uppercase',
      totalValue: 'text-2xl font-bold text-black',
      accentColor: 'text-black',
      badge: 'border border-black text-black px-2 py-1 text-xs font-bold'
    }
  },
  {
    id: 'tally',
    name: 'Tally Style (Accounting)',
    description: 'Dense, grid-based layout typical of accounting software like Tally.',
    styles: {
      container: 'p-8 font-sans bg-white max-w-[210mm] mx-auto min-h-[297mm] text-xs relative',
      header: 'border-2 border-black border-b-0 flex flex-col',
      headerText: 'text-black font-bold',
      headerSubtext: 'text-black',
      sectionTitle: 'font-bold text-black uppercase mb-1 border-b border-black w-full block',
      table: 'w-full border-2 border-black border-t-0 mb-0',
      tableHeader: 'border-b border-black border-r border-black text-center font-bold bg-gray-50 p-1',
      tableRow: 'border-b border-black',
      tableCell: 'border-r border-black p-1 align-top',
      summary: 'border-2 border-black border-t-0 p-2',
      totalLabel: 'font-bold text-black uppercase',
      totalValue: 'font-bold text-black',
      accentColor: 'text-black',
      badge: 'border border-black text-black px-1 text-[10px] font-bold'
    }
  },
  {
    id: 'web',
    name: 'Web Style (Modern)',
    description: 'Clean, web-based invoice style with watermark support.',
    styles: {
      container: 'p-12 font-sans bg-white max-w-[210mm] mx-auto min-h-[297mm] relative',
      header: 'flex justify-between items-start mb-8 border-b border-gray-200 pb-6',
      headerText: 'text-gray-900',
      headerSubtext: 'text-gray-500',
      sectionTitle: 'text-sm font-bold text-gray-900 mb-2',
      table: 'w-full mb-8 border border-gray-200',
      tableHeader: 'bg-gray-50 text-gray-900 font-bold text-sm py-3 px-4 border-b border-gray-200 text-left',
      tableRow: 'border-b border-gray-100',
      tableCell: 'py-3 px-4 text-sm text-gray-700',
      summary: 'bg-gray-50 p-6 rounded-lg',
      totalLabel: 'text-lg font-bold text-gray-900',
      totalValue: 'text-xl font-bold text-gray-900',
      accentColor: 'text-blue-600',
      badge: 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold'
    }
  }
];

interface DocumentBuilderProps {
  type?: 'invoice' | 'estimate' | 'purchase' | 'credit-debit';
}

export function InvoiceBuilder({ type = 'invoice' }: DocumentBuilderProps) {
  const [currentTheme, setCurrentTheme] = useState(INVOICE_THEMES[0]);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  
  const getInitialStatus = () => {
    switch (type) {
      case 'estimate': return 'Draft';
      case 'credit-debit': return 'Issued';
      default: return 'Unpaid';
    }
  };
  
  const [status, setStatus] = useState<string>(getInitialStatus());
  
  const [itemMasterData, setItemMasterData] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('system_items');
    if (saved) {
      setItemMasterData(JSON.parse(saved));
    }
  }, []);

  const handleNameChange = (id: string, value: string) => {
    updateItem(id, 'name', value);
    const found = itemMasterData.find(item => item.name === value);
    if (found) {
      if (found.price) updateItem(id, 'price', found.price);
      if (found.description) updateItem(id, 'description', found.description);
    }
  };

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    name: "Acme Corp Solutions",
    gstin: "27ABCDE1234F1Z5",
    state: "Maharashtra",
    address: "123 Business Park, Mumbai, 400001",
    email: "contact@acmecorp.com",
    phone: "+91 98765 43210",
    bankName: "HDFC Bank",
    accountNumber: "50100234567890",
    ifsc: "HDFC0001234",
    branch: "Mumbai Main Branch",
    accountHolderName: "Acme Corp Solutions",
    logo: ""
  });

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    gstin: "",
    state: "Maharashtra",
    address: "",
    email: "",
    phone: ""
  });

  const [terms, setTerms] = useState(`1. Goods once sold will not be taken back.
2. Interest @18% p.a. will be charged if payment is delayed.
3. Subject to Mumbai Jurisdiction only.`);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: '', description: '', hsn: '', quantity: 1, price: 0, gstRate: 18 }
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    roundOff: 0,
    deduction: 0,
    total: 0
  });

  const [invoiceDetails, setInvoiceDetails] = useState({
    number: `${type === 'estimate' ? 'EST' : type === 'purchase' ? 'PB' : type === 'credit-debit' ? 'CDN' : 'INV'}-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split('T')[0],
    noteType: 'Credit Note',
    originalInvoiceNo: '',
    originalInvoiceDate: '',
    reason: ''
  });

  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

  const getLabels = () => {
    switch (type) {
      case 'estimate':
        return {
          title: 'New Estimate / Quotation',
          subtitle: 'Create and manage your estimates',
          billFrom: 'From',
          billTo: 'To (Client)',
          docNo: 'Estimate No',
          docDate: 'Estimate Date',
          docStatus: 'Estimate Status',
          printTitle: 'Estimate / Quotation',
          saveMsg: 'Estimate saved successfully!',
          statusOptions: ['Draft', 'Sent', 'Accepted', 'Rejected']
        };
      case 'purchase':
        return {
          title: 'New Purchase Bill',
          subtitle: 'Create and manage your purchase bills',
          billFrom: 'Your Business Details',
          billTo: 'Vendor Details',
          docNo: 'Bill No',
          docDate: 'Bill Date',
          docStatus: 'Bill Status',
          printTitle: 'Purchase Bill',
          saveMsg: 'Purchase bill saved successfully!',
          statusOptions: ['Unpaid', 'Paid', 'Overdue']
        };
      case 'credit-debit':
        return {
          title: 'New Credit / Debit Note',
          subtitle: 'Create and manage your credit/debit notes',
          billFrom: 'From',
          billTo: 'To (Customer)',
          docNo: 'Note No',
          docDate: 'Note Date',
          docStatus: 'Note Status',
          printTitle: invoiceDetails.noteType,
          saveMsg: 'Note saved successfully!',
          statusOptions: ['Issued', 'Applied', 'Cancelled']
        };
      default:
        return {
          title: 'New Invoice',
          subtitle: 'Create and manage your invoices',
          billFrom: 'Bill From',
          billTo: 'Bill To',
          docNo: 'Invoice No',
          docDate: 'Invoice Date',
          docStatus: 'Invoice Status',
          printTitle: isGstInvoice ? 'Tax Invoice' : 'Invoice',
          saveMsg: 'Invoice saved successfully!',
          statusOptions: ['Unpaid', 'Paid', 'Overdue']
        };
    }
  };

  const [isGstInvoice, setIsGstInvoice] = useState(true);
  const labels = getLabels();
  const [isRoundOff, setIsRoundOff] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState(0);

  const isInterState = customer.state !== businessProfile.state;

  useEffect(() => {
    const calculateTotals = () => {
      let sub = 0;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;
  
      items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        sub += itemTotal;
  
        const taxRate = isGstInvoice ? item.gstRate : 0;
        const taxAmount = (itemTotal * taxRate) / 100;
  
        if (isInterState) {
          igst += taxAmount;
        } else {
          cgst += taxAmount / 2;
          sgst += taxAmount / 2;
        }
      });
  
      setTotals({
        subtotal: sub,
        cgst,
        sgst,
        igst,
        deduction: deductionAmount,
        roundOff: isRoundOff ? Math.round(sub + cgst + sgst + igst - deductionAmount) - (sub + cgst + sgst + igst - deductionAmount) : 0,
        total: isRoundOff ? Math.round(sub + cgst + sgst + igst - deductionAmount) : sub + cgst + sgst + igst - deductionAmount
      });
    };

    calculateTotals();
  }, [items, isInterState, isGstInvoice, isRoundOff, deductionAmount]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', description: '', hsn: '', quantity: 1, price: 0, gstRate: 18 }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const resetInvoice = () => {
    if (window.confirm(`Are you sure you want to clear this ${type.replace('-', ' ')}?`)) {
      setCustomer({
        name: "",
        gstin: "",
        state: "Maharashtra",
        address: ""
      });
      setItems([{ id: Date.now().toString(), name: '', description: '', hsn: '', quantity: 1, price: 0, gstRate: 18 }]);
      setInvoiceDetails({
        ...invoiceDetails,
        number: `INV-${Math.floor(Math.random() * 10000)}`
      });
      setStatus('Unpaid');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessProfile({ ...businessProfile, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleSave = async () => {
    if (!customer.name) {
      alert(`Please enter customer name to save the ${type.replace('-', ' ')}.`);
      return;
    }
    
    const invoice = {
      id: Date.now().toString(),
      ...invoiceDetails,
      invoiceNumber: invoiceDetails.number,
      businessProfile,
      customer,
      items,
      taxType: isInterState ? 'INTER' : 'INTRA',
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      total: totals.total,
      status
    };

    try {
      // Save to backend API
      const response = await fetch(`${API_URL}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) throw new Error('Failed to save to backend');

      // Keep localStorage for backward compatibility/offline use
      const storageKey = type === 'estimate' ? 'estimates' : type === 'purchase' ? 'purchases' : type === 'credit-debit' ? 'credit_debit_notes' : 'invoices';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...existing, invoice]));

      // Modify Item Master Stock if Purchase or Invoice
      if (type === 'invoice' || type === 'purchase') {
        const itemResponse = await fetch(`${API_URL}/api/items`);
        if (itemResponse.ok) {
          const savedItems = await itemResponse.json();
          let itemsUpdatedCount = 0;

          for (const item of items) {
            const si = savedItems.find((s: any) => s.name === item.name);
            if (si) {
              const qty = Number(item.quantity) || 0;
              const movementType = type === 'purchase' ? 'IN' : 'OUT';
              const newStock = movementType === 'IN' ? Number(si.currentStock) + qty : Math.max(0, Number(si.currentStock) - qty);

              // 1. Log movement to backend
              await fetch(`${API_URL}/api/movements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  itemId: si.id,
                  type: movementType,
                  quantity: qty,
                  date: new Date().toISOString().split('T')[0],
                  remarks: `${type.toUpperCase()} - ${invoiceDetails.number}`
                })
              });

              // 2. Update stock in item master on backend
              await fetch(`${API_URL}/api/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...si,
                  currentStock: newStock
                })
              });
              
              itemsUpdatedCount++;
            }
          }
        }
      }

      alert(labels.saveMsg);
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      alert(`Failed to save ${type}. Please try again.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-print-area');
    if (!element) return;
    
    // Temporarily remove print-only class to render properly for html2pdf
    const originalClass = element.className;
    element.className = originalClass.replace('print-only', '');
    
    try {
      const opt = {
        margin: 0.2,
        filename: `${invoiceDetails.number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // Restore original class
      element.className = originalClass;
    }
  };

  const handleWhatsApp = async () => {
    const text = `Hello ${customer.name || 'Customer'},\n\nYour ${labels.printTitle} ${invoiceDetails.number} for ${formatCurrency(totals.total)} is ready.\n\nDue Date: ${invoiceDetails.dueDate}\n\nPlease let us know if you have any questions.\n\nThank you,\n${businessProfile.name}`;
    
    setIsSendingWhatsApp(true);
    const result = await sendWhatsAppMessage(customer.phone, text);
    setIsSendingWhatsApp(false);

    if (result.success) {
      alert('WhatsApp message sent successfully via iFastX API!');
    } else if (result.fallback) {
      if (!customer.phone && localStorage.getItem('iFastXApiKey')) {
        alert('Customer phone number is required for automated WhatsApp sending. Falling back to WhatsApp Web default redirect.');
      } else if (result.error) {
        alert(`Failed to send via iFastX API: ${result.error}. Falling back to WhatsApp Web default redirect.`);
      }
      window.open(`https://wa.me/${customer.phone ? customer.phone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleEmail = () => {
    const subject = `${labels.printTitle} ${invoiceDetails.number} from ${businessProfile.name}`;
    const body = `Hello ${customer.name || 'Customer'},\n\nPlease find attached the details for ${labels.printTitle} ${invoiceDetails.number} for the amount of ${formatCurrency(totals.total)}.\n\nDue Date: ${invoiceDetails.dueDate}\n\nThank you,\n${businessProfile.name}`;
    window.open(`mailto:${customer.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <>
      {/* Screen View */}
      <div className="p-8 max-w-6xl mx-auto no-print">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{labels.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-500">{labels.subtitle}</p>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGstInvoice(true)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${isGstInvoice ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  GST
                </button>
                <button
                  type="button"
                  onClick={() => setIsGstInvoice(false)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${!isGstInvoice ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Non-GST
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              type="button"
              onClick={resetInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-medium transition-colors cursor-pointer"
            >
              <RefreshCw size={18} />
              Reset
            </button>
            <button 
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              <Printer size={18} />
              Print
            </button>
            <button 
              type="button"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              <FileDown size={18} />
              PDF
            </button>
            <button 
              type="button"
              onClick={handleWhatsApp}
              disabled={isSendingWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSendingWhatsApp ? <RefreshCw size={18} className="animate-spin" /> : <MessageCircle size={18} />}
              WhatsApp
            </button>
            <button 
              type="button"
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              <Mail size={18} />
              Email
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-600/20 cursor-pointer"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>

        {/* Theme Gallery */}
        <div className="mb-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
          <button 
            onClick={() => setShowThemeSettings(!showThemeSettings)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Palette size={18} />
              <span>Theme Gallery</span>
            </div>
            {showThemeSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showThemeSettings && (
            <div className="p-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {INVOICE_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setCurrentTheme(theme)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      currentTheme.id === theme.id 
                        ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold ${currentTheme.id === theme.id ? 'text-blue-700' : 'text-slate-900'}`}>
                        {theme.name}
                      </h3>
                      {currentTheme.id === theme.id && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Active</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {theme.description}
                    </p>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowThemeSettings(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Close Gallery
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{labels.billFrom}</h3>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative group">
                      {businessProfile.logo ? (
                        <img src={businessProfile.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Image className="text-slate-400" size={24} />
                      )}
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="text-white" size={16} />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Business Logo</p>
                      <p className="text-[10px] text-slate-400">Click to upload (PNG, JPG)</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={businessProfile.name}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                    className="w-full font-bold text-slate-900 text-lg bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300 mb-1"
                    placeholder="Business Name"
                  />
                  <textarea
                    value={businessProfile.address}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                    className="w-full text-slate-500 text-sm bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300 resize-none"
                    placeholder="Business Address"
                    rows={2}
                  />
                  {isGstInvoice && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium text-xs">GSTIN</span>
                    <input
                      type="text"
                      value={businessProfile.gstin}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, gstin: e.target.value })}
                      className="font-mono text-slate-700 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300 w-full"
                      placeholder="GSTIN Number"
                    />
                  </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <input
                      type="text"
                      value={businessProfile.email}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                      className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                      placeholder="Email Address"
                    />
                    <input
                      type="text"
                      value={businessProfile.phone}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                      className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                      placeholder="Phone Number"
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bank Details</p>
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={businessProfile.bankName}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, bankName: e.target.value })}
                        className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                        placeholder="Bank Name"
                      />
                      <input
                        type="text"
                        value={businessProfile.accountNumber}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, accountNumber: e.target.value })}
                        className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                        placeholder="Account Number"
                      />
                      <input
                        type="text"
                        value={businessProfile.ifsc}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, ifsc: e.target.value })}
                        className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                        placeholder="IFSC Code"
                      />
                      <input
                        type="text"
                        value={businessProfile.branch}
                        onChange={(e) => setBusinessProfile({ ...businessProfile, branch: e.target.value })}
                        className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                        placeholder="Branch Name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{labels.billTo}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter name"
                      />
                    </div>
                    {isGstInvoice && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">GSTIN (Optional)</label>
                      <input
                        type="text"
                        value={customer.gstin}
                        onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="Ex: 29ABCDE1234F1Z5"
                      />
                    </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Email (Optional)</label>
                      <input
                        type="text"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="customer@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Phone (Optional)</label>
                      <input
                        type="text"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">State</label>
                      <select
                        value={customer.state}
                        onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {INDIAN_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{labels.docDate}</label>
                      <input
                        type="date"
                        value={invoiceDetails.date}
                        onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{labels.docStatus}</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      >
                        {labels.statusOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    {type === 'credit-debit' && (
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Note Type</label>
                        <select
                          value={invoiceDetails.noteType}
                          onChange={(e) => setInvoiceDetails({ ...invoiceDetails, noteType: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="Credit Note">Credit Note</option>
                          <option value="Debit Note">Debit Note</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {type === 'credit-debit' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Original Invoice No</label>
                        <input
                          type="text"
                          value={invoiceDetails.originalInvoiceNo}
                          onChange={(e) => setInvoiceDetails({ ...invoiceDetails, originalInvoiceNo: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          placeholder="INV-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Original Invoice Date</label>
                        <input
                          type="date"
                          value={invoiceDetails.originalInvoiceDate}
                          onChange={(e) => setInvoiceDetails({ ...invoiceDetails, originalInvoiceDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                  {type === 'credit-debit' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Reason for Issuance</label>
                      <input
                        type="text"
                        value={invoiceDetails.reason}
                        onChange={(e) => setInvoiceDetails({ ...invoiceDetails, reason: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="e.g., Goods returned, Price difference"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-[40%]">Item Details</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">HSN</th>
                    <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">Qty</th>
                    <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%]">Price</th>
                    {isGstInvoice && <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">GST %</th>}
                    <th className="text-right py-3 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">Amount</th>
                    <th className="w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          placeholder="Item Name / Title"
                          list="item-list-datalist"
                          className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-slate-900 placeholder-slate-300 mb-1"
                        />
                        <datalist id="item-list-datalist">
                          {itemMasterData.map(im => <option key={im.id} value={im.name} />)}
                        </datalist>
                        <input
                          type="text"
                          value={item.description || ''}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs text-slate-500 placeholder-slate-300"
                        />
                      </td>
                      <td className="py-3 px-2 align-top">
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => updateItem(item.id, 'hsn', e.target.value)}
                          placeholder="1234"
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 placeholder-slate-300"
                        />
                      </td>
                      <td className="py-3 px-2 align-top">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-900 font-medium"
                        />
                      </td>
                      <td className="py-3 px-2 align-top">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-900 font-medium"
                        />
                      </td>
                      {isGstInvoice && (
                      <td className="py-3 px-2 align-top">
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItem(item.id, 'gstRate', parseFloat(e.target.value))}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-slate-600 cursor-pointer"
                        >
                          {GST_RATES.map(rate => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </td>
                      )}
                      <td className="py-3 px-2 text-right font-bold text-slate-900 align-top">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                      <td className="py-3 px-2 text-center align-top">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Line Item
            </button>
          </div>

          {/* Footer / Totals Section */}
          <div className="bg-slate-50 border-t border-slate-200 p-8">
            <div className="flex flex-col md:flex-row justify-end gap-12">
              <div className="w-full md:w-1/3 space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {!isInterState ? (
                  <>
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>CGST (Intra-state)</span>
                      <span className="font-medium">{formatCurrency(totals.cgst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm">
                      <span>SGST (Intra-state)</span>
                      <span className="font-medium">{formatCurrency(totals.sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>IGST (Inter-state)</span>
                    <span className="font-medium">{formatCurrency(totals.igst)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Less: Adjustment</label>
                  </div>
                  <input
                    type="number"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 text-right text-sm bg-white border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="roundOff"
                      checked={isRoundOff}
                      onChange={(e) => setIsRoundOff(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="roundOff" className="text-sm text-slate-600 cursor-pointer select-none">Round Off</label>
                  </div>
                  {isRoundOff && <span className="text-sm text-slate-500">{formatCurrency(totals.roundOff)}</span>}
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(totals.total)}</span>
                </div>
                
                <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg flex items-center gap-2 mt-2">
                  <Calculator size={14} />
                  {isInterState 
                    ? "IGST Applied: Customer state differs from business state." 
                    : "CGST + SGST Applied: Customer in same state as business."}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Terms & Conditions / Notes</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-600"
                rows={4}
                placeholder="Enter terms and conditions..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Print View */}
      <div id="invoice-print-area" className={`print-only ${currentTheme.styles.container}`}>
        {/* Watermark for All Themes */}
        {(status === 'Paid' || status === 'Unpaid') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
            <div 
              className={`transform -rotate-45 border-[12px] font-bold text-[120px] px-16 py-8 tracking-widest uppercase ${
                status === 'Paid' 
                  ? 'border-green-600/20 text-green-600/20' 
                  : 'border-red-600/20 text-red-600/20'
              }`}
            >
              {status}
            </div>
          </div>
        )}

        {/* Header */}
        <div className={currentTheme.styles.header}>
          {currentTheme.id === 'tally' ? (
            // Tally Header Layout
            <div className="w-full">
              <div className="flex justify-between items-center border-b border-black pb-2 mb-2">
                <div className="w-20">
                  {businessProfile.logo && <img src={businessProfile.logo} alt="Logo" className="h-12 w-auto object-contain" />}
                </div>
                <h1 className="font-bold text-xl uppercase text-center flex-grow">{labels.printTitle}</h1>
                <div className="w-20"></div>
              </div>
              <div className="flex w-full">
                <div className="w-1/2 border-r border-black p-2">
                  <p className="font-bold mb-1">{labels.billFrom}:</p>
                  <h2 className="font-bold text-lg">{businessProfile.name}</h2>
                  <p className="whitespace-pre-wrap">{businessProfile.address}</p>
                  <p>GSTIN: {businessProfile.gstin}</p>
                  <p>State: {businessProfile.state}</p>
                  <p>Email: {businessProfile.email}</p>
                </div>
                <div className="w-1/2 p-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">{labels.docNo}:</span>
                    <span>{invoiceDetails.number}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold">Date:</span>
                    <span>{invoiceDetails.date}</span>
                  </div>
                  {type === 'credit-debit' && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">Orig. Inv No:</span>
                        <span>{invoiceDetails.originalInvoiceNo}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">Orig. Inv Date:</span>
                        <span>{invoiceDetails.originalInvoiceDate}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="font-bold">Reason:</span>
                        <span>{invoiceDetails.reason}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t border-black my-2"></div>
                  <p className="font-bold mb-1">{labels.billTo}:</p>
                  <h3 className="font-bold">{customer.name}</h3>
                  <p className="whitespace-pre-wrap">{customer.address}</p>
                  <p>GSTIN: {customer.gstin}</p>
                  <p>State: {customer.state}</p>
                </div>
              </div>
            </div>
          ) : (
            // Standard Header Layout (Classic, Modern, Minimalist, Web)
            <>
              <div className="flex items-start gap-4">
                {businessProfile.logo ? (
                  <img src={businessProfile.logo} alt="Logo" className="h-20 w-auto object-contain" />
                ) : (
                  <div className={`w-16 h-16 ${currentTheme.id === 'classic' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'} flex items-center justify-center rounded-lg text-2xl font-bold`}>
                    {businessProfile.name.charAt(0) || 'B'}
                  </div>
                )}
                <div>
                  <h1 className={`text-3xl font-bold uppercase tracking-tight ${currentTheme.styles.headerText}`}>
                    {labels.printTitle}
                  </h1>
                  <p className={`font-medium ${currentTheme.styles.headerSubtext}`}>Original for Recipient</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className={`text-xl font-bold ${currentTheme.styles.headerText}`}>{businessProfile.name}</h2>
                <p className={`text-sm ${currentTheme.styles.headerSubtext} max-w-[250px] ml-auto`}>{businessProfile.address}</p>
                <p className={`text-sm ${currentTheme.styles.headerSubtext} mt-1`}>{businessProfile.email}</p>
                <p className={`text-sm ${currentTheme.styles.headerSubtext}`}>{businessProfile.phone}</p>
                {isGstInvoice && (
                  <div className="mt-2 flex justify-end">
                    <span className={currentTheme.styles.badge}>GSTIN: {businessProfile.gstin}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Invoice Details (Non-Tally) */}
        {currentTheme.id !== 'tally' && (
          <div className="flex justify-between mb-8 gap-8">
            <div className="w-1/2">
              <h3 className={currentTheme.styles.sectionTitle}>{labels.billTo}</h3>
              <p className={`font-bold text-lg ${currentTheme.styles.headerText}`}>{customer.name || 'N/A'}</p>
              <p className={`text-sm ${currentTheme.styles.headerSubtext}`}>{customer.address || 'Address not provided'}</p>
              <p className={`text-sm ${currentTheme.styles.headerSubtext}`}>State: {customer.state}</p>
              {(customer.email || customer.phone) && (
                <div className={`mt-1 text-sm ${currentTheme.styles.headerSubtext}`}>
                  {customer.email && <p>{customer.email}</p>}
                  {customer.phone && <p>{customer.phone}</p>}
                </div>
              )}
              {isGstInvoice && customer.gstin && (
                <p className={`text-sm font-bold mt-2 ${currentTheme.styles.accentColor}`}>GSTIN: {customer.gstin}</p>
              )}
            </div>
            <div className="w-1/3 text-right">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className={`${currentTheme.styles.headerSubtext} text-sm`}>{labels.docNo}:</span>
                  <span className={`font-bold ${currentTheme.styles.headerText}`}>{invoiceDetails.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${currentTheme.styles.headerSubtext} text-sm`}>Date:</span>
                  <span className={`font-medium ${currentTheme.styles.headerText}`}>{invoiceDetails.date}</span>
                </div>
                {type === 'credit-debit' && (
                  <>
                    <div className="flex justify-between">
                      <span className={`${currentTheme.styles.headerSubtext} text-sm`}>Orig. Inv No:</span>
                      <span className={`font-medium ${currentTheme.styles.headerText}`}>{invoiceDetails.originalInvoiceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${currentTheme.styles.headerSubtext} text-sm`}>Orig. Inv Date:</span>
                      <span className={`font-medium ${currentTheme.styles.headerText}`}>{invoiceDetails.originalInvoiceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${currentTheme.styles.headerSubtext} text-sm`}>Reason:</span>
                      <span className={`font-medium ${currentTheme.styles.headerText}`}>{invoiceDetails.reason}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className={`${currentTheme.styles.headerSubtext} text-sm`}>Place of Supply:</span>
                  <span className={`font-medium ${currentTheme.styles.headerText}`}>{customer.state}</span>
                </div>
                {currentTheme.id === 'web' && (
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className={`${currentTheme.styles.headerSubtext} text-sm`}>Payment Method:</span>
                    <span className={`font-medium ${currentTheme.styles.headerText}`}>Bank Transfer</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        <table className={currentTheme.styles.table}>
          <thead>
            <tr className={currentTheme.styles.tableHeader}>
              <th className="py-2 px-3 text-left w-[5%]">#</th>
              <th className="py-2 px-3 text-left w-[40%]">Item Description</th>
              <th className="py-2 px-3 text-center w-[10%]">HSN</th>
              <th className="py-2 px-3 text-right w-[10%]">Qty</th>
              <th className="py-2 px-3 text-right w-[15%]">Rate</th>
              {isGstInvoice && <th className="py-2 px-3 text-right w-[10%]">GST %</th>}
              <th className="py-2 px-3 text-right w-[10%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={currentTheme.styles.tableRow}>
                <td className={currentTheme.styles.tableCell}>{index + 1}</td>
                <td className={`${currentTheme.styles.tableCell}`}>
                  <div className="font-medium">{item.name || 'Item Name'}</div>
                  {item.description && (
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>
                  )}
                </td>
                <td className={`${currentTheme.styles.tableCell} text-center`}>{item.hsn || '-'}</td>
                <td className={`${currentTheme.styles.tableCell} text-right`}>{item.quantity}</td>
                <td className={`${currentTheme.styles.tableCell} text-right`}>{formatCurrency(item.price)}</td>
                {isGstInvoice && <td className={`${currentTheme.styles.tableCell} text-right`}>{item.gstRate}%</td>}
                <td className={`${currentTheme.styles.tableCell} text-right font-bold`}>
                  {formatCurrency(item.quantity * item.price)}
                </td>
              </tr>
            ))}
            {/* Fill empty rows for Tally theme to maintain height */}
            {currentTheme.id === 'tally' && items.length < 8 && Array.from({ length: 8 - items.length }).map((_, i) => (
              <tr key={`empty-${i}`} className={currentTheme.styles.tableRow}>
                <td className={`${currentTheme.styles.tableCell} h-8`}>&nbsp;</td>
                <td className={currentTheme.styles.tableCell}>&nbsp;</td>
                <td className={currentTheme.styles.tableCell}>&nbsp;</td>
                <td className={currentTheme.styles.tableCell}>&nbsp;</td>
                <td className={currentTheme.styles.tableCell}>&nbsp;</td>
                {isGstInvoice && <td className={currentTheme.styles.tableCell}>&nbsp;</td>}
                <td className={currentTheme.styles.tableCell}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Tax Breakdown */}
        <div className="flex justify-between items-start mb-8">
          <div className="w-1/2 pr-8">
            <h3 className={currentTheme.styles.sectionTitle}>Amount in Words</h3>
            <p className={`text-sm font-medium italic ${currentTheme.styles.headerSubtext} mb-6`}>
              {numberToWords(Math.round(totals.total))}
            </p>
            
            <h3 className={currentTheme.styles.sectionTitle}>Bank Details</h3>
            <div className={`text-sm ${currentTheme.styles.headerSubtext}`}>
              <p>Bank Name: <span className={`font-medium ${currentTheme.styles.headerText}`}>{businessProfile.bankName}</span></p>
              <p>Account No: <span className={`font-medium ${currentTheme.styles.headerText}`}>{businessProfile.accountNumber}</span></p>
              <p>IFSC Code: <span className={`font-medium ${currentTheme.styles.headerText}`}>{businessProfile.ifsc}</span></p>
              <p>Branch: <span className={`font-medium ${currentTheme.styles.headerText}`}>{businessProfile.branch}</span></p>
            </div>
          </div>

          <div className={`w-1/3 ${currentTheme.styles.summary}`}>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className={currentTheme.styles.headerSubtext}>Taxable Amount</span>
                <span className={`font-medium ${currentTheme.styles.headerText}`}>{formatCurrency(totals.subtotal)}</span>
              </div>
              {isGstInvoice && (!isInterState ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className={currentTheme.styles.headerSubtext}>CGST</span>
                    <span className={`font-medium ${currentTheme.styles.headerText}`}>{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={currentTheme.styles.headerSubtext}>SGST</span>
                    <span className={`font-medium ${currentTheme.styles.headerText}`}>{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className={currentTheme.styles.headerSubtext}>IGST</span>
                  <span className={`font-medium ${currentTheme.styles.headerText}`}>{formatCurrency(totals.igst)}</span>
                </div>
              ))}
              {totals.deduction > 0 && (
                <div className="flex justify-between text-sm">
                  <span className={currentTheme.styles.headerSubtext}>Less: Adjustment</span>
                  <span className="font-medium text-rose-600">-{formatCurrency(totals.deduction)}</span>
                </div>
              )}
              {isRoundOff && (
                <div className="flex justify-between text-sm">
                  <span className={currentTheme.styles.headerSubtext}>Round Off</span>
                  <span className={`font-medium ${currentTheme.styles.headerText}`}>{formatCurrency(totals.roundOff)}</span>
                </div>
              )}
            </div>
            <div className={`flex justify-between items-center pt-4 ${currentTheme.id === 'classic' ? 'border-t-2 border-slate-900' : 'border-t border-slate-200'}`}>
              <span className={currentTheme.styles.totalLabel}>Grand Total</span>
              <span className={currentTheme.styles.totalValue}>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer / Signatory */}
        <div className="flex justify-between items-end mt-12 pt-8">
          <div className="max-w-md">
            <h3 className={currentTheme.styles.sectionTitle}>Terms & Conditions</h3>
            <pre className={`whitespace-pre-wrap font-sans text-xs ${currentTheme.styles.headerSubtext}`}>{terms}</pre>
          </div>
          <div className="text-center">
            <div className="h-16 mb-2">
              {businessProfile.signature && <img src={businessProfile.signature} alt="Signature" className="h-full object-contain mx-auto" />}
            </div>
            <p className={`font-bold ${currentTheme.styles.headerText}`}>{businessProfile.name}</p>
            <p className={`text-xs ${currentTheme.styles.headerSubtext} uppercase tracking-wider`}>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </>
  );
}
