import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Search, Filter, Download, CheckCircle2, FileText } from 'lucide-react';
import { API_URL } from '../config';

export function BatchExpiry() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;
        
        const res = await fetch(`${API_URL}/api/items`, {
          headers: {
            'x-tenant-id': activeTenant.id,
            'x-company-id': activeCompany.id
          }
        });
        
        if (res.ok) {
          const items = await res.json();
          // Filter items that might actually have batch/expiry info, or are just regular items
          // Since basic items table doesn't strictly have expDate, we map what we can.
          // In a real app we'd have a batches table. Here we mock from items if they had expDate fields.
          const itemsWithExpiry = items
              .filter((i: any) => i.expDate) // Only show items with expiry dates
              .map((i: any) => {
                const isExpired = new Date(i.expDate) < new Date();
                const daysToExpiry = Math.ceil((new Date(i.expDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                return {
                  id: i.id,
                  item: i.name,
                  batch: i.batchNumber || 'N/A',
                  mfgDate: i.mfgDate || 'N/A',
                  expDate: i.expDate,
                  stock: i.currentStock,
                  unit: i.unit,
                  status: isExpired ? 'expired' : daysToExpiry <= 30 ? 'expiring-soon' : 'safe'
                };
              });
          setBatches(itemsWithExpiry);
        }
      } catch (err) {
        console.error("Failed to fetch batches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);


  const handleExportCSV = () => {
    const headers = ['Item Name', 'Batch No.', 'Mfg Date', 'Expiry Date', 'Remaining Stock', 'Unit', 'Status'];
    const csvContent = [
      headers.join(','),
      ...batches.map(batch => `"${batch.item}","${batch.batch}",${batch.mfgDate},${batch.expDate},${batch.stock},${batch.unit},${batch.status}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch_expiry_report.csv`;
    link.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batch & Expiry Tracking</h1>
          <p className="text-slate-500">Monitor product batches and expiration dates</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Expired Items</p>
            <p className="text-2xl font-bold text-slate-900">{batches.filter(b => b.status === 'expired').length} Batches</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Expiring in 30 Days</p>
            <p className="text-2xl font-bold text-slate-900">{batches.filter(b => b.status === 'expiring-soon').length} Batches</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Safe Batches</p>
            <p className="text-2xl font-bold text-slate-900">{batches.filter(b => b.status === 'safe').length} Batches</p>
          </div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by item name or batch no..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option value="all">All Statuses</option>
              <option value="expired">Expired</option>
              <option value="expiring-soon">Expiring Soon (30 days)</option>
              <option value="safe">Safe</option>
            </select>
          </div>
          <button 
            onClick={() => alert('Advanced filters coming soon')}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Filter size={18} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Batch No.</th>
                <th className="p-4 font-medium">Mfg Date</th>
                <th className="p-4 font-medium">Expiry Date</th>
                <th className="p-4 font-medium text-right">Remaining Stock</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading batches...</td></tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <FileText size={48} className="text-slate-300 mb-4" />
                      <p className="font-bold text-slate-600 text-lg mb-2">No expiring items found.</p>
                      <p className="text-sm">You haven't tracked any batch/expiry data yet.</p>
                    </div>
                  </td>
                </tr>
              ) : batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 font-medium text-slate-900">{batch.item}</td>
                  <td className="p-4 text-slate-600 font-mono text-xs">{batch.batch}</td>
                  <td className="p-4 text-slate-600">{batch.mfgDate}</td>
                  <td className={`p-4 font-medium ${batch.status === 'expired' ? 'text-rose-600' : batch.status === 'expiring-soon' ? 'text-amber-600' : 'text-slate-600'}`}>
                    {batch.expDate}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold text-slate-900">{batch.stock}</span> <span className="text-slate-500 text-xs">{batch.unit}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'expired' ? 'bg-rose-100 text-rose-700' : 
                      batch.status === 'expiring-soon' ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {batch.status === 'expired' ? 'Expired' : 
                       batch.status === 'expiring-soon' ? 'Expiring Soon' : 'Safe'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
