import React, { useState } from 'react';
import { Search, Download, Printer, Filter, Users } from 'lucide-react';

export function PartyLedger() {
  const [partyType, setPartyType] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');

  const transactions = [
    { id: 1, date: '2023-10-01', particulars: 'Opening Balance', type: 'Opening', vchNo: '-', debit: 5000, credit: 0, balance: 5000 },
    { id: 2, date: '2023-10-05', particulars: 'Sales Invoice', type: 'Sales', vchNo: 'INV-001', debit: 15000, credit: 0, balance: 20000 },
    { id: 3, date: '2023-10-10', particulars: 'Payment Received', type: 'Receipt', vchNo: 'REC-001', debit: 0, credit: 10000, balance: 10000 },
    { id: 4, date: '2023-10-15', particulars: 'Sales Invoice', type: 'Sales', vchNo: 'INV-005', debit: 8000, credit: 0, balance: 18000 },
  ];

  const handleExportCSV = () => {
    const headers = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Debit (In)', 'Credit (Out)', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(txn => 
        `${txn.date},"${txn.particulars}",${txn.type},${txn.vchNo},${txn.debit},${txn.credit},${txn.balance}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `party_ledger_report.csv`;
    link.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Party Ledger</h1>
          <p className="text-slate-500">Track customer and supplier balances and transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-slate-50 rounded-t-xl">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search party name (e.g., Tech Solutions)..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <select 
              value={partyType}
              onChange={(e) => setPartyType(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="all">All Parties</option>
              <option value="customers">Customers (Sundry Debtors)</option>
              <option value="suppliers">Suppliers (Sundry Creditors)</option>
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Financial Year</option>
              <option value="custom">Custom Date</option>
            </select>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tech Solutions Ltd</h2>
              <p className="text-slate-500">Customer • GSTIN: 27AADCB2230M1Z2</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">Closing Balance</p>
              <p className="text-2xl font-bold text-blue-600">₹ 18,000 <span className="text-sm font-normal text-slate-500">Dr</span></p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Particulars</th>
                <th className="p-4 font-medium">Vch Type</th>
                <th className="p-4 font-medium">Vch No.</th>
                <th className="p-4 font-medium text-right">Debit (In)</th>
                <th className="p-4 font-medium text-right">Credit (Out)</th>
                <th className="p-4 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 text-slate-600">{txn.date}</td>
                  <td className="p-4 font-medium text-slate-900">{txn.particulars}</td>
                  <td className="p-4 text-slate-600">{txn.type}</td>
                  <td className="p-4 text-slate-600">{txn.vchNo}</td>
                  <td className="p-4 text-right text-slate-900">{txn.debit > 0 ? `₹ ${txn.debit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right text-slate-900">{txn.credit > 0 ? `₹ ${txn.credit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right font-medium text-slate-900">
                    ₹ {txn.balance.toLocaleString()} {txn.balance > 0 ? 'Dr' : 'Cr'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={4} className="p-4 text-right text-slate-700">Closing Total:</td>
                <td className="p-4 text-right text-slate-900">₹ 28,000</td>
                <td className="p-4 text-right text-slate-900">₹ 10,000</td>
                <td className="p-4 text-right text-blue-600">₹ 18,000 Dr</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
