import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShoppingCart, Search, Filter, Download } from 'lucide-react';
import { API_URL } from '../config';

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');
        
        const res = await fetch(`${API_URL}/api/items`, {
          headers: { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter items with less than 10 stock
          const lowStock = data.filter((item: any) => (item.currentStock || 0) < 10).map((item: any) => ({
             id: item.id,
             name: item.name,
             category: item.hsn || 'General',
             currentStock: item.currentStock || 0,
             minStock: 10,
             unit: item.unit || 'pcs',
             status: (item.currentStock || 0) <= 2 ? 'critical' : 'low'
          }));
          setLowStockItems(lowStock);
        }
      } catch (err) {
        console.error("Failed to fetch stock for alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Item Name', 'Category', 'Current Stock', 'Min Required', 'Unit', 'Status'];
    const csvContent = [
      headers.join(','),
      ...lowStockItems.map(item => `"${item.name}","${item.category}",${item.currentStock},${item.minStock},${item.unit},${item.status}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `low_stock_report.csv`;
    link.click();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading stock alerts...</div>;

  const criticalCount = lowStockItems.filter(i => i.status === 'critical').length;
  const lowCount = lowStockItems.filter(i => i.status === 'low').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
          <p className="text-slate-500">Items that need to be reordered soon</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Critical Stock</p>
            <p className="text-2xl font-bold text-slate-900">{criticalCount} Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock</p>
            <p className="text-2xl font-bold text-slate-900">{lowCount} Items</p>
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <button 
              onClick={() => alert('Advanced filters coming soon')}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-center">Current Stock</th>
                <th className="p-4 font-medium text-center">Min. Required</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockItems.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No low stock items found.</td></tr>
              ) : lowStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 font-medium text-slate-900">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.category}</td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-900">{item.currentStock}</span> <span className="text-slate-500 text-xs">{item.unit}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-slate-600">{item.minStock}</span> <span className="text-slate-500 text-xs">{item.unit}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'critical' ? 'Critical' : 'Low'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        const vendorPhone = '919999999999'; // Example vendor number (in real app comes from vendor profile)
                        const message = encodeURIComponent(`Hi Vendor,\nI would like to place an order for:\n\n*${item.name} (${item.category})*\n*Quantity Required:* ${item.minStock * 2} ${item.unit}\n\nPlease let me know the total amount and ETA.\nThanks.`);
                        window.open(`https://wa.me/${vendorPhone}?text=${message}`, '_blank');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                    >
                      <ShoppingCart size={14} /> Order Now
                    </button>
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
