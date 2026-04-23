import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2 } from 'lucide-react';
import { API_URL } from '../config';

export function VendorMaster() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ id: '', name: '', gstin: '', phone: '', email: '', address: '', state: '' });
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
      const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

      if (!activeTenant.id) return;

      const response = await fetch(`${API_URL}/api/vendors`, {
        headers: {
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      }
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSave = async () => {
    if (!newVendor.name) return;
    
    const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
    const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

    if (!activeTenant.id) return;
    
    const vendorData = {
      ...newVendor,
      id: newVendor.id || Date.now().toString()
    };

    try {
      const response = await fetch(`${API_URL}/api/vendors`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        },
        body: JSON.stringify(vendorData)
      });

      if (response.ok) {
        await fetchVendors();
        setIsModalOpen(false);
        setNewVendor({ id: '', name: '', gstin: '', phone: '', email: '', address: '', state: '' });
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registered Vendors</h1>
          <p className="text-slate-500">Manage your suppliers for stock and GST reporting</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Add New Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Vendor Name</th>
                <th className="p-4 font-medium">GST No.</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                    <Building2 size={16} className="text-slate-400" /> {v.name}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{v.gst || 'N/A'}</td>
                  <td className="p-4 text-slate-600">
                    <div className="text-sm">{v.phone}</div>
                    <div className="text-xs text-slate-500">{v.email}</div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{v.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold bg-slate-50">Register New Vendor</div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-600">Vendor Name</label>
                <input value={newVendor.name} onChange={e=>setNewVendor({...newVendor, name: e.target.value})} className="w-full border rounded-lg p-2 outline-none" placeholder="e.g. ABC Distributors" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-slate-600">GST Number</label>
                  <input value={newVendor.gst} onChange={e=>setNewVendor({...newVendor, gst: e.target.value})} className="w-full border rounded-lg p-2 outline-none uppercase" placeholder="e.g. 29ABCDE1234F1Z5" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">WhatsApp / Mobile</label>
                  <input type="tel" value={newVendor.phone} onChange={e=>setNewVendor({...newVendor, phone: e.target.value})} className="w-full border rounded-lg p-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Email Address</label>
                  <input type="email" value={newVendor.email} onChange={e=>setNewVendor({...newVendor, email: e.target.value})} className="w-full border rounded-lg p-2 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-slate-600">Complete Address</label>
                  <textarea value={newVendor.address} onChange={e=>setNewVendor({...newVendor, address: e.target.value})} className="w-full border rounded-lg p-2 outline-none" rows={2}></textarea>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-slate-200 rounded-lg text-slate-600 font-medium">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Register Vendor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
