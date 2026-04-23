import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Calendar, Filter, FileText } from 'lucide-react';

export function GSTR1Export() {
  const [activeTab, setActiveTab] = useState('b2b');
  const [month, setMonth] = useState('2023-10');

  // Mock Data
  const b2bData = [
    { id: 1, gstin: '27AADCB2230M1Z2', name: 'Tech Solutions Ltd', invoiceNo: 'INV-102', date: '15-Oct-2023', value: 25000, taxable: 21186.44, igst: 0, cgst: 1906.78, sgst: 1906.78 },
    { id: 2, gstin: '29ABCDE1234F2Z5', name: 'Global Enterprises', invoiceNo: 'INV-095', date: '20-Oct-2023', value: 45000, taxable: 38135.59, igst: 6864.41, cgst: 0, sgst: 0 },
  ];

  const b2cData = [
    { id: 1, state: '27-Maharashtra', rate: 18, taxable: 15000, igst: 0, cgst: 1350, sgst: 1350 },
    { id: 2, state: '24-Gujarat', rate: 12, taxable: 8000, igst: 960, cgst: 0, sgst: 0 },
  ];

  const hsnData = [
    { id: 1, hsn: '9983', desc: 'IT Services', uqc: 'OTH', qty: 0, value: 70000, taxable: 59322.03, igst: 6864.41, cgst: 1906.78, sgst: 1906.78 },
  ];

  const handleExportJSON = () => {
    const data = {
      gstin: "YOUR_GSTIN",
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
    let csv = "GSTIN/UIN of Recipient,Receiver Name,Invoice Number,Invoice date,Invoice Value,Place Of Supply,Reverse Charge,Applicable % of Tax Rate,Invoice Type,E-Commerce GSTIN,Rate,Taxable Value,Cess Amount\n";
    b2bData.forEach(row => {
      csv += `${row.gstin},${row.name},${row.invoiceNo},${row.date},${row.value},27-Maharashtra,N,,Regular,,18,${row.taxable},0\n`;
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
              <span className="font-bold text-slate-900">4</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Total Taxable: </span>
              <span className="font-bold text-slate-900">₹ 67,322.03</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Total Tax: </span>
              <span className="font-bold text-slate-900">₹ 12,027.97</span>
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
                  {b2bData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 text-sm">
                      <td className="p-4 font-mono text-slate-700">{row.gstin}</td>
                      <td className="p-4 text-slate-900">{row.name}</td>
                      <td className="p-4 text-blue-600">{row.invoiceNo}</td>
                      <td className="p-4 text-slate-600">{row.date}</td>
                      <td className="p-4 text-right font-medium text-slate-900">₹ {row.value.toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">₹ {row.taxable.toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">{row.igst > 0 ? `₹ ${row.igst.toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.cgst > 0 ? `₹ ${row.cgst.toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.sgst > 0 ? `₹ ${row.sgst.toLocaleString()}` : '-'}</td>
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
                    <th className="p-4 font-medium">Place of Supply (State)</th>
                    <th className="p-4 font-medium text-center">Rate (%)</th>
                    <th className="p-4 font-medium text-right">Taxable Value</th>
                    <th className="p-4 font-medium text-right">IGST</th>
                    <th className="p-4 font-medium text-right">CGST</th>
                    <th className="p-4 font-medium text-right">SGST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {b2cData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 text-sm">
                      <td className="p-4 text-slate-900">{row.state}</td>
                      <td className="p-4 text-center text-slate-600">{row.rate}%</td>
                      <td className="p-4 text-right font-medium text-slate-900">₹ {row.taxable.toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">{row.igst > 0 ? `₹ ${row.igst.toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.cgst > 0 ? `₹ ${row.cgst.toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.sgst > 0 ? `₹ ${row.sgst.toLocaleString()}` : '-'}</td>
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
                  {hsnData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 text-sm">
                      <td className="p-4 font-mono text-slate-700">{row.hsn}</td>
                      <td className="p-4 text-slate-900">{row.desc}</td>
                      <td className="p-4 text-center text-slate-600">{row.uqc}</td>
                      <td className="p-4 text-right text-slate-600">{row.qty}</td>
                      <td className="p-4 text-right font-medium text-slate-900">₹ {row.value.toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">₹ {row.taxable.toLocaleString()}</td>
                      <td className="p-4 text-right text-slate-600">{row.igst > 0 ? `₹ ${row.igst.toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.cgst > 0 ? `₹ ${row.cgst.toLocaleString()}` : '-'}</td>
                      <td className="p-4 text-right text-slate-600">{row.sgst > 0 ? `₹ ${row.sgst.toLocaleString()}` : '-'}</td>
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
