import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, Filter, Users, FileText } from 'lucide-react';
import { API_URL } from '../config';

export function PartyLedger() {
  const [partyType, setPartyType] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [searchQuery, setSearchQuery] = useState('');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;

        const headers = { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id };
        
        const [invRes, purRes] = await Promise.all([
          fetch(`${API_URL}/api/invoices`, { headers }),
          fetch(`${API_URL}/api/purchases`, { headers })
        ]);

        const allTrans: any[] = [];
        if (invRes.ok) {
          const invoices = await invRes.json();
          invoices.forEach((inv: any) => {
            allTrans.push({
              id: `inv-${inv.id}`,
              date: inv.date,
              partyType: 'customer',
              partyName: inv.customerData?.name || 'Walk-in Customer',
              particulars: 'Sales Account',
              type: 'Sales',
              vchNo: inv.invoiceNumber,
              debit: Number(inv.total), // Receivable (Asset increase)
              credit: 0,
              balance: 0 // Will calculate
            });
          });
        }

        if (purRes.ok) {
          const purchases = await purRes.json();
          purchases.forEach((pur: any) => {
            allTrans.push({
              id: `pur-${pur.id}`,
              date: pur.date,
              partyType: 'vendor',
              partyName: pur.vendorData?.name || 'Walk-in Vendor',
              particulars: 'Purchase Account',
              type: 'Purchase',
              vchNo: pur.billNumber,
              debit: 0,
              credit: Number(pur.total), // Payable (Liability increase)
              balance: 0 // Will calculate
            });
          });
        }

        // Sort by date ascending to calculate running balance
        allTrans.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Note: For a real ledger we compute balance per party. 
        // Here we'll compute a simple running balance for demonstration.
        let currentBalance = 0; 
        allTrans.forEach(t => {
          currentBalance += t.debit - t.credit;
          t.balance = currentBalance;
        });

        setTransactions(allTrans.reverse()); // Show latest first
      } catch (err) {
        console.error("Failed to fetch ledger", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, [dateRange]);

  const filteredTransactions = transactions.filter(t => {
    if (partyType !== 'all' && t.partyType !== partyType) return false;
    if (searchQuery && !t.partyName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Party', 'Particulars', 'Vch Type', 'Vch No.', 'Debit (In)', 'Credit (Out)', 'Balance'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(txn => 
        `${txn.date},"${txn.partyName}","${txn.particulars}",${txn.type},${txn.vchNo},${txn.debit},${txn.credit},${txn.balance}`
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
              <h2 className="text-xl font-bold text-slate-900">{searchQuery || 'All Parties'}</h2>
              <p className="text-slate-500">{partyType === 'all' ? 'All Parties' : partyType === 'customers' ? 'Customers' : 'Suppliers'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 mb-1">Closing Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredTransactions.length > 0 
                     ? `₹ ${Math.abs(filteredTransactions[0].balance).toLocaleString()} ${filteredTransactions[0].balance > 0 ? 'Dr' : 'Cr'}` 
                     : '₹ 0'}
              </p>
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
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading transactions...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                 <tr><td colSpan={7} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
              ) : filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 text-slate-600">{txn.date}</td>
                  <td className="p-4 font-medium text-slate-900">{txn.partyName} <br/><span className="text-xs text-slate-400 font-normal">{txn.particulars}</span></td>
                  <td className="p-4 text-slate-600">{txn.type}</td>
                  <td className="p-4 text-slate-600">{txn.vchNo}</td>
                  <td className="p-4 text-right text-slate-900">{txn.debit > 0 ? `₹ ${txn.debit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right text-slate-900">{txn.credit > 0 ? `₹ ${txn.credit.toLocaleString()}` : '-'}</td>
                  <td className="p-4 text-right font-medium text-slate-900">
                    ₹ {Math.abs(txn.balance).toLocaleString()} {txn.balance > 0 ? 'Dr' : 'Cr'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
              <tr>
                <td colSpan={4} className="p-4 text-right text-slate-700">Closing Total:</td>
                <td className="p-4 text-right text-slate-900">
                  ₹ {filteredTransactions.reduce((acc, curr) => acc + curr.debit, 0).toLocaleString()}
                </td>
                <td className="p-4 text-right text-slate-900">
                  ₹ {filteredTransactions.reduce((acc, curr) => acc + curr.credit, 0).toLocaleString()}
                </td>
                <td className="p-4 text-right text-blue-600">
                  {filteredTransactions.length > 0 
                     ? `₹ ${Math.abs(filteredTransactions[0].balance).toLocaleString()} ${filteredTransactions[0].balance > 0 ? 'Dr' : 'Cr'}` 
                     : '₹ 0'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
