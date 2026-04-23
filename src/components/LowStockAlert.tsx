import React from 'react';
import { AlertTriangle, ShoppingCart, Search, Filter, Download } from 'lucide-react';

export function LowStockAlert() {
  // Mock data for low stock items
  const lowStockItems = [
    { id: 1, name: 'Printer Paper A4', category: 'Office Supplies', currentStock: 2, minStock: 10, unit: 'box', status: 'critical' },
    { id: 2, name: 'Blue Ink Cartridge', category: 'Electronics', currentStock: 1, minStock: 5, unit: 'pcs', status: 'critical' },
    { id: 3, name: 'Premium Coffee Beans', category: 'Pantry', currentStock: 3, minStock: 5, unit: 'kg', status: 'low' },
    { id: 4, name: 'Packaging Tape', category: 'Shipping', currentStock: 8, minStock: 15, unit: 'pcs', status: 'low' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
          <p className="text-slate-500">Items that need to be reordered soon</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Exporting Low Stock List...')}
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
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Critical Stock</p>
            <p className="text-2xl font-bold text-slate-900">2 Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Low Stock</p>
            <p className="text-2xl font-bold text-slate-900">2 Items</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Suggested Order Value</p>
            <p className="text-2xl font-bold text-slate-900">₹ 12,450</p>
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
              {lowStockItems.map((item) => (
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
