import React, { useState } from 'react';
import { Search, Download, Printer, Filter, Wallet, Plus, X } from 'lucide-react';

export function Cashbook() {
  const [accountType, setAccountType] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    particulars: '',
    type: 'Receipt',
    vchNo: '',
    amount: ''
  });

  const [transactions, setTransactions] = useState([
    { id: 1, date: '2023-10-01', particulars: 'Opening Balance', type: 'Opening', vchNo: '-', receipt: 50000, payment: 0, balance: 50000 },
    { id: 2, date: '2023-10-02', particulars: 'Cash Sales', type: 'Receipt', vchNo: 'REC-042', receipt: 15000, payment: 0, balance: 65000 },
    { id: 3, date: '2023-10-05', particulars: 'Office Expenses', type: 'Payment', vchNo: 'PAY-011', receipt: 0, payment: 2500, balance: 62500 },
    { id: 4, date: '2023-10-08', particulars: 'Payment to Supplier (ABC Corp)', type: 'Payment', vchNo: 'PAY-012', receipt: 0, payment: 20000, balance: 42500 },
    { id: 5, date: '2023-10-12', particulars: 'Received from Customer (Tech Ltd)', type: 'Receipt', vchNo: 'REC-043', receipt: 30000, payment: 0, balance: 72500 },
  ]);

  const handleAddEntry = () => {
    if (!newEntry.particulars || !newEntry.amount || Number(newEntry.amount) <= 0) {
      alert("Invalid entry data.");
      return;
    }

    const lastBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;
    const amountNum = Number(newEntry.amount);
    
    let currentBalance = lastBalance;
    let receipt = 0;
    let payment = 0;

    if (newEntry.type === 'Receipt') {
      receipt = amountNum;
      currentBalance += amountNum;
    } else {
      payment = amountNum;
      currentBalance -= amountNum;
    }

    const t = {
      id: Date.now(),
      date: newEntry.date,
      particulars: newEntry.particulars,
      type: newEntry.type,
      vchNo: newEntry.vchNo || '-',
      receipt,
      payment,
      balance: currentBalance,
    };

    setTransactions([...transactions, t]);
    setIsModalOpen(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      particulars: '',
      type: 'Receipt',
      vchNo: '',
      amount: ''
    });
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Particulars', 'Vch Type', 'Vch No.', 'Receipt', 'Payment', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(txn => 
        `${txn.date},"${txn.particulars}",${txn.type},${txn.vchNo},${txn.receipt},${txn.payment},${txn.balance}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cashbook_report.csv';
    link.click();
  };

  const totalReceipts = transactions.reduce((acc, curr) => acc + curr.receipt, 0);
  const totalPayments = transactions.reduce((acc, curr) => acc + curr.payment, 0);
  const closingBalance = transactions.length > 0 ? transactions[transactions.length-1].balance : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cash & Bank Book</h1>
          <p className="text-slate-500">Track your daily cash and bank transactions</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} /> Add Entry
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer size={18} /> Print
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
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
                placeholder="Search transactions..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <select 
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="all">All Accounts (Cash + Bank)</option>
              <option value="cash">Cash Account</option>
              <option value="bank-hdfc">HDFC Bank</option>
              <option value="bank-sbi">SBI Bank</option>
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="custom">Custom Date</option>
            </select>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Receipts (In)</p>
            <p className="text-xl font-bold text-emerald-600">₹ {totalReceipts.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Payments (Out)</p>
            <p className="text-xl font-bold text-rose-600">₹ {totalPayments.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-blue-100">
            <p className="text-sm text-slate-500 mb-1">Closing Balance</p>
            <p className="text-xl font-bold text-blue-600">₹ {closingBalance.toLocaleString()}</p>
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
                <th className="p-4 font-medium text-right text-emerald-600">Receipt (In)</th>
                <th className="p-4 font-medium text-right text-rose-600">Payment (Out)</th>
                <th className="p-4 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 text-slate-600">{txn.date}</td>
                  <td className="p-4 font-medium text-slate-900">{txn.particulars}</td>
                  <td className="p-4 text-slate-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.type === 'Receipt' ? 'bg-emerald-100 text-emerald-700' : 
                      txn.type === 'Payment' ? 'bg-rose-100 text-rose-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{txn.vchNo}</td>
                  <td className="p-4 text-right text-emerald-600 font-medium">{txn.receipt > 0 ? `₹ ${txn.receipt.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right text-rose-600 font-medium">{txn.payment > 0 ? `₹ ${txn.payment.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right font-medium text-slate-900">
                    ₹ {txn.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Cashbook Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                  >
                    <option value="Receipt">Receipt (In)</option>
                    <option value="Payment">Payment (Out)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input 
                  type="number"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Particulars</label>
                <input 
                  type="text"
                  value={newEntry.particulars}
                  onChange={(e) => setNewEntry({...newEntry, particulars: e.target.value})}
                  placeholder="e.g. Office supplies..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Voucher No (Optional)</label>
                <input 
                  type="text"
                  value={newEntry.vchNo}
                  onChange={(e) => setNewEntry({...newEntry, vchNo: e.target.value})}
                  placeholder="e.g. VCH-001"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
