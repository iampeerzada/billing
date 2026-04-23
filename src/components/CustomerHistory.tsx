import React, { useState } from 'react';
import { Search, Filter, Download, History, FileText, CheckCircle, Clock } from 'lucide-react';

export function CustomerHistory() {
  const [selectedCustomer, setSelectedCustomer] = useState('Tech Solutions Ltd');

  // Mock data
  const customers = ['Tech Solutions Ltd', 'Global Enterprises', 'ABC Corp', 'Local Retailers'];
  
  const history = [
    { id: 1, date: '2023-10-28', type: 'Payment', ref: 'REC-089', amount: 15000, status: 'Completed', notes: 'Received via NEFT' },
    { id: 2, date: '2023-10-15', type: 'Invoice', ref: 'INV-102', amount: 25000, status: 'Partially Paid', notes: 'Due on 2023-11-15' },
    { id: 3, date: '2023-09-20', type: 'Payment', ref: 'REC-075', amount: 45000, status: 'Completed', notes: 'Cheque cleared' },
    { id: 4, date: '2023-09-05', type: 'Invoice', ref: 'INV-088', amount: 45000, status: 'Paid', notes: 'Due on 2023-10-05' },
    { id: 5, date: '2023-08-10', type: 'Estimate', ref: 'EST-045', amount: 50000, status: 'Accepted', notes: 'Converted to INV-088' },
  ];

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Ref No.', 'Amount', 'Status', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...history.map(item => `${item.date},${item.type},${item.ref},${item.amount},${item.status},"${item.notes}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer_statement_${selectedCustomer.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer History</h1>
          <p className="text-slate-500">View complete timeline of invoices, payments, and estimates</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={18} /> Export Statement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Customer Selector */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Customer</label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search customer..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {customers.map(c => (
              <button 
                key={c}
                onClick={() => setSelectedCustomer(c)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCustomer === c ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* History View */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Total Billed</p>
              <p className="text-xl font-bold text-slate-900">₹ 70,000</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Total Paid</p>
              <p className="text-xl font-bold text-emerald-600">₹ 60,000</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/50">
              <p className="text-sm text-slate-500 mb-1">Outstanding Balance</p>
              <p className="text-xl font-bold text-blue-600">₹ 10,000</p>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                Timeline for {selectedCustomer}
              </h3>
              <button 
                onClick={() => alert('Advanced filters coming soon')}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Filter size={16} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Ref No.</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                    <th className="p-4 font-medium text-center">Status</th>
                    <th className="p-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="p-4 text-slate-600">{item.date}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          {item.type === 'Invoice' && <FileText size={14} className="text-blue-500" />}
                          {item.type === 'Payment' && <CheckCircle size={14} className="text-emerald-500" />}
                          {item.type === 'Estimate' && <Clock size={14} className="text-amber-500" />}
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 text-blue-600 hover:underline cursor-pointer font-medium">{item.ref}</td>
                      <td className="p-4 text-right font-bold text-slate-900">₹ {item.amount.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Completed' || item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                          item.status === 'Partially Paid' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
