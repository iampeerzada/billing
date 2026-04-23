import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, History, FileText, CheckCircle, Clock } from 'lucide-react';
import { API_URL } from '../config';

interface CustomerHistoryProps {
  onInvoiceClick?: (invoiceId: string, docType?: string) => void;
}

export function CustomerHistory({ onInvoiceClick }: CustomerHistoryProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

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
        const data = await res.json();
        setInvoices(data);
        
        // Extract unique customers
        const uniqueCustomers = Array.from(new Set(data.map((inv: any) => inv.customerData?.name).filter(Boolean))) as string[];
        setCustomers(uniqueCustomers);
        if (uniqueCustomers.length > 0 && !selectedCustomer) {
          setSelectedCustomer(uniqueCustomers[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const customerInvoices = invoices.filter(inv => inv.customerData?.name === selectedCustomer);

  const totalBilled = customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = customerInvoices.reduce((sum, inv) => sum + (inv.status === 'Paid' ? (inv.total || 0) : 0), 0);
  const outstanding = totalBilled - totalPaid;

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Ref No.', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...customerInvoices.map(item => `${item.date},Invoice,${item.invoiceNumber},${item.total},${item.status}`)
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
              <p className="text-xl font-bold text-slate-900">₹ {totalBilled.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Total Paid (Estimated)</p>
              <p className="text-xl font-bold text-emerald-600">₹ {totalPaid.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/50">
              <p className="text-sm text-slate-500 mb-1">Outstanding Balance</p>
              <p className="text-xl font-bold text-blue-600">₹ {outstanding.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={18} className="text-blue-600" />
                Timeline for {selectedCustomer || 'None Selected'}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerInvoices.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-500">No records found.</td></tr>
                  )}
                  {customerInvoices.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="p-4 text-slate-600">{item.date}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <FileText size={14} className="text-blue-500" />
                          Invoice
                        </span>
                      </td>
                      <td 
                        className="p-4 text-blue-600 hover:underline cursor-pointer font-medium"
                        onClick={() => onInvoiceClick && onInvoiceClick(item.id, item.type || 'invoice')}
                      >
                        {item.invoiceNumber || item.number || item.id}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900">₹ {Number(item.total).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Completed' || item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                          item.status === 'Partially Paid' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status || 'Pending'}
                        </span>
                      </td>
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
