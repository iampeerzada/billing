import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, User, IndianRupee, Eye, Download, Trash2, ShieldAlert } from 'lucide-react';
import { API_URL } from '../config';

interface InvoiceListProps {
  onNewInvoice: () => void;
}

export function InvoiceList({ onNewInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
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
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

    try {
      const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
      const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

      if (!activeTenant.id) {
        setError('Authorization failed. Please login again.');
        return;
      }

      const res = await fetch(`${API_URL}/api/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        }
      });

      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== id));
      } else {
        setError('Failed to delete invoice');
      }
    } catch (err) {
      setError('Connection error during deletion');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Invoices</h2>
          <p className="text-slate-500 text-sm">Manage and track your business sales</p>
        </div>
        <button 
          onClick={onNewInvoice}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={20} /> Create New Invoice
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by Invoice # or Customer"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Calendar size={18} /> This Month
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full mb-4"></div>
                      <p>Loading your invoices...</p>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <FileText size={48} className="text-slate-200 mb-4" />
                      <p className="font-bold text-slate-500 text-lg mb-2">No Invoices Found</p>
                      <p className="text-sm">Start by creating your first professional GST invoice.</p>
                      <button 
                        onClick={onNewInvoice}
                        className="mt-6 text-blue-600 font-bold hover:underline"
                      >
                        + Create First Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{inv.invoiceNumber}</span>
                        <span className="text-xs text-slate-500 font-medium">{inv.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                          {inv.customerData?.name?.charAt(0) || <User size={14} />}
                        </div>
                        <span className="font-medium text-slate-700">{inv.customerData?.name || 'Walk-in Customer'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-0.5">
                        <IndianRupee size={14} className="text-slate-400" />
                        {Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                        inv.status === 'Unpaid' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          inv.status === 'Paid' ? 'bg-emerald-500' : 
                          inv.status === 'Unpaid' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View details">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Download PDF">
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(inv.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                          title="Delete record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {error && (
        <div className="fixed bottom-6 right-6 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-rose-900/20 flex items-center gap-2 font-bold animate-in slide-in-from-bottom">
          <ShieldAlert size={20} />
          {error}
        </div>
      )}
    </div>
  );
}
