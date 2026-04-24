import React, { useState, useEffect } from 'react';
import { Download, FileJson, FileSpreadsheet, Calendar, Filter, FileText } from 'lucide-react';
import { API_URL } from '../config';

interface GSTR1ExportProps {
  onInvoiceClick?: (id: string, type?: string) => void;
}

export function GSTR1Export({ onInvoiceClick }: GSTR1ExportProps) {
  const [activeTab, setActiveTab] = useState('b2b');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;

        const res = await fetch(`${API_URL}/api/invoices`, {
          headers: {
            'x-tenant-id': activeTenant.id,
            'x-company-id': activeCompany.id
          }
        });

        if (res.ok) {
          setInvoices(await res.json());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Filter by month and type
  const filteredInvoices = invoices.filter(inv => 
    inv.date && 
    inv.date.startsWith(month) && 
    (!inv.type || inv.type === 'invoice')
  );

  // Compute Data
  const b2bData = filteredInvoices.filter(inv => inv.customerData?.gstin).map(inv => ({
    id: inv.id,
    gstin: inv.customerData?.gstin,
    name: inv.customerData?.name,
    invoiceNo: inv.invoiceNumber || inv.number,
    date: inv.date.split('-').reverse().join('-'), // DD-MM-YYYY
    value: inv.total || 0,
    taxable: inv.subtotal || 0,
    igst: inv.igst || 0,
    cgst: inv.cgst || 0,
    sgst: inv.sgst || 0,
    items: inv.items || [],
    state: inv.customerData?.state || ''
  }));

  const b2cData = filteredInvoices.filter(inv => !inv.customerData?.gstin).map(inv => ({
    id: inv.id,
    invoiceNo: inv.invoiceNumber || inv.number,
    state: inv.customerData?.state || 'Unregistered',
    taxable: inv.subtotal || 0,
    igst: inv.igst || 0,
    cgst: inv.cgst || 0,
    sgst: inv.sgst || 0,
  }));

  // Aggregate HSN
  const hsnMap: any = {};
  filteredInvoices.forEach(inv => {
    (inv.items || []).forEach((item: any) => {
      if (!item.hsn) return;
      if (!hsnMap[item.hsn]) {
        hsnMap[item.hsn] = { id: item.hsn, hsn: item.hsn, desc: item.name, uqc: 'NOS', qty: 0, value: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0 };
      }
      hsnMap[item.hsn].qty += (item.quantity || 0);
      hsnMap[item.hsn].taxable += (item.price * item.quantity);
      hsnMap[item.hsn].value += (item.price * item.quantity) * (1 + (item.gstRate || 0)/100);
      if (inv.igst) hsnMap[item.hsn].igst += (item.price * item.quantity * (item.gstRate || 0)/100);
      else {
        hsnMap[item.hsn].cgst += (item.price * item.quantity * (item.gstRate || 0)/200);
        hsnMap[item.hsn].sgst += (item.price * item.quantity * (item.gstRate || 0)/200);
      }
    });
  });
  const hsnData = Object.values(hsnMap);

  const totalTaxable = filteredInvoices.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalTax = filteredInvoices.reduce((s, i) => s + (i.cgst || 0) + (i.sgst || 0) + (i.igst || 0), 0);

  const handleExportJSON = () => {
    const data = {
      gstin: "YOUR_GSTIN", // In a real app, pull from activeCompany
      fp: month.replace('-', ''),
      b2b: b2bData,
      b2cs: b2cData,
      hsn: hsnData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${month}.json`;
    a.click();
  };

  const handleExportExcel = () => {
    let csv = "GSTIN/UIN of Recipient,Receiver Name,Invoice Number,Invoice date,Invoice Value,Place Of Supply,Reverse Charge,Invoice Type,E-Commerce GSTIN,Rate,Taxable Value,Cess Amount\n";
    b2bData.forEach(row => {
      // Assuming a single rate per invoice for simplicity in B2B export, or iterate items.
      const rate = row.items.length > 0 ? row.items[0].gstRate : 18;
      csv += `${row.gstin},${row.name},${row.invoiceNo},${row.date},${row.value},${row.state},N,Regular,,${rate},${row.taxable},0\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_B2B_${month}.csv`;
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GSTR-1 Export</h1>
          <p className="text-slate-500">Generate and export GSTR-1 returns for the GST Portal</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <FileSpreadsheet size={18} className="text-emerald-600" /> 
            Export Excel (CSV)
          </button>
          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-600/20"
          >
            <FileJson size={18} /> 
            Export JSON (Portal)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Return Period:</span>
            <input 
              type="month" 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex gap-4">
            <div className="text-sm">
              <span className="text-slate-500">Total Invoices: </span>
              <span className="font-bold text-slate-900">{filteredInvoices.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Total Taxable: </span>
              <span className="font-bold text-slate-900">₹ {totalTaxable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Total Tax: </span>
              <span className="font-bold text-slate-900">₹ {totalTax.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('b2b')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'b2b' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            B2B Invoices (4A, 4B, 4C, 6B, 6C)
          </button>
          <button 
            onClick={() => setActiveTab('b2c')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'b2c' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            B2C Small (7)
          </button>
          <button 
            onClick={() => setActiveTab('hsn')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'hsn' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            HSN Summary (12)
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'b2b' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">GSTIN/UIN</th>
                    <th className="p-4 font-medium">Receiver Name</th>
                    <th className="p-4 font-medium">Invoice No.</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Invoice Value</th>
                    <th className="p-4 font-medium text-right">Taxable Value</th>
                    <th className="p-4 font-medium text-right">IGST</th>
                    <th className="p-4 font-medium text-right">CGST</th>
                    <th className="p-4 font-medium text-right">SGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {b2bData.length === 0 && <tr><td colSpan={9} className="p-4 text-center text-slate-500">No B2B invoices found</td></tr>}
                  {b2bData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 text-sm">
                      <td className="p-4 font-mono text-slate-700">{row.gstin}</td>
                      <td className="p-4 text-slate-900">{row.name}</td>
                      <td 
                        className="p-4 text-blue-600 font-bold hover:underline cursor-pointer"
                        onClick={() => onInvoiceClick && onInvoiceClick(row.id, row.type || 'invoice')}
                      >
                        {row.invoiceNo}
                      </td>
                      <td className="p-4 text-slate-600">{row.date}</td>
                      <td className="p-4 text-right font-medium text-slate-900">₹ {Number(row.value).toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">₹ {Number(row.taxable).toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">{row.igst > 0 ? `₹ ${Number(row.igst).toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.cgst > 0 ? `₹ ${Number(row.cgst).toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.sgst > 0 ? `₹ ${Number(row.sgst).toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'b2c' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Invoice No.</th>
                    <th className="p-4 font-medium">Place of Supply (State)</th>
                    <th className="p-4 font-medium text-right">Taxable Value</th>
                    <th className="p-4 font-medium text-right">IGST</th>
                    <th className="p-4 font-medium text-right">CGST</th>
                    <th className="p-4 font-medium text-right">SGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {b2cData.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-500">No B2C Invoices found</td></tr>}
                  {b2cData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 text-sm">
                      <td 
                        className="p-4 text-blue-600 font-bold hover:underline cursor-pointer"
                        onClick={() => onInvoiceClick && onInvoiceClick(row.id, row.type || 'invoice')}
                      >
                        {row.invoiceNo}
                      </td>
                      <td className="p-4 text-slate-900">{row.state}</td>
                      <td className="p-4 text-right font-medium text-slate-900">₹ {Number(row.taxable).toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">{row.igst > 0 ? `₹ ${Number(row.igst).toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.cgst > 0 ? `₹ ${Number(row.cgst).toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.sgst > 0 ? `₹ ${Number(row.sgst).toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'hsn' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">HSN/SAC</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-center">UQC</th>
                    <th className="p-4 font-medium text-right">Total Qty</th>
                    <th className="p-4 font-medium text-right">Total Value</th>
                    <th className="p-4 font-medium text-right">Taxable Value</th>
                    <th className="p-4 font-medium text-right">IGST</th>
                    <th className="p-4 font-medium text-right">CGST</th>
                    <th className="p-4 font-medium text-right">SGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hsnData.length === 0 && <tr><td colSpan={9} className="p-4 text-center text-slate-500">No HSN Data found</td></tr>}
                  {hsnData.map((row: any) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 text-sm">
                      <td className="p-4 font-mono text-slate-700">{row.hsn}</td>
                      <td className="p-4 text-slate-900">{row.desc}</td>
                      <td className="p-4 text-center text-slate-600">{row.uqc}</td>
                      <td className="p-4 text-right text-slate-600">{row.qty}</td>
                      <td className="p-4 text-right font-medium text-slate-900">₹ {Number(row.value).toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">₹ {Number(row.taxable).toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">{row.igst > 0 ? `₹ ${Number(row.igst).toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.cgst > 0 ? `₹ ${Number(row.cgst).toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.sgst > 0 ? `₹ ${Number(row.sgst).toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
