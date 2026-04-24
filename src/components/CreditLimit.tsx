import React, { useState } from 'react';
import { Search, Filter, Edit, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export function CreditLimit() {
  const [customers, setCustomers] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');
        
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/invoices`, {
          headers: { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id }
        });
        if (res.ok) {
           const data = await res.json();
           const customerMap: Record<string, any> = {};
           
           data.forEach((inv: any) => {
              if (inv.customerData?.name) {
                 const name = inv.customerData.name;
                 if (!customerMap[name]) {
                    customerMap[name] = { id: name + Math.random(), name: name, limit: 0, used: 0, status: 'no-limit' };
                 }
                 if (inv.status !== 'Paid' && inv.status !== 'Completed') {
                    customerMap[name].used += (inv.total || 0);
                 }
              }
           });
           
           const storedLimits = JSON.parse(localStorage.getItem('credit_limits') || '{}');
           
           const newCustomers = Object.values(customerMap).map((c: any) => {
              const limit = storedLimits[c.name] || 0;
              const used = c.used;
              let status = 'safe';
              if (limit === 0) status = 'no-limit';
              else if (used > limit) status = 'exceeded';
              else if (used / limit >= 0.8) status = 'warning';
              
              return { ...c, limit, status };
           });
           
           setCustomers(newCustomers);
        }
      } catch (e) {}
    }
    fetchCustomers();
  }, [])

  const handleEditLimit = (id: string, currentLimit: number, name: string) => {
    const limitStr = window.prompt(`Set new credit limit for ${name}:`, currentLimit.toString());
    if (limitStr === null) return;
    
    const limit = parseFloat(limitStr);
    if (isNaN(limit) || limit < 0) {
      alert('Invalid limit entered.');
      return;
    }

    const storedLimits = JSON.parse(localStorage.getItem('credit_limits') || '{}');
    storedLimits[name] = limit;
    localStorage.setItem('credit_limits', JSON.stringify(storedLimits));

    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        const used = c.used;
        let status = 'safe';
        if (limit === 0) status = 'no-limit';
        else if (used > limit) status = 'exceeded';
        else if (used / limit >= 0.8) status = 'warning';
        
        return { ...c, limit, status };
      }
      return c;
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Limits</h1>
          <p className="text-slate-500">Manage customer credit limits and monitor exposure</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Limit Exceeded</p>
            <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.status === 'exceeded').length} Customer(s)</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Near Limit (&gt;80%)</p>
            <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.status === 'warning').length} Customer(s)</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Safe</p>
            <p className="text-2xl font-bold text-slate-900">{customers.filter(c => c.status === 'safe').length} Customer(s)</p>
          </div>
        </div>
      </div>

      {/* Credit Limits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search customer..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option value="all">All Customers</option>
              <option value="exceeded">Limit Exceeded</option>
              <option value="warning">Near Limit</option>
              <option value="safe">Safe</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium text-right">Credit Limit</th>
                <th className="p-4 font-medium text-right">Used Amount</th>
                <th className="p-4 font-medium text-right">Available Credit</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => {
                const available = c.limit > 0 ? c.limit - c.used : 0;
                const percentUsed = c.limit > 0 ? (c.used / c.limit) * 100 : 0;
                
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="p-4 font-medium text-slate-900">{c.name}</td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      {c.limit > 0 ? `₹ ${c.limit.toLocaleString()}` : 'No Limit Set'}
                    </td>
                    <td className="p-4 text-right text-slate-600">
                      {c.used > 0 ? `₹ ${c.used.toLocaleString()}` : '-'}
                    </td>
                    <td className={`p-4 text-right font-bold ${available < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {c.limit > 0 ? `₹ ${available.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-4 text-center">
                      {c.limit === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Not Set
                        </span>
                      ) : c.status === 'exceeded' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                          <ShieldAlert size={12} /> Exceeded
                        </span>
                      ) : c.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <AlertTriangle size={12} /> {percentUsed.toFixed(0)}% Used
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={12} /> Safe
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEditLimit(c.id, c.limit, c.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                      >
                        <Edit size={14} /> Edit Limit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
