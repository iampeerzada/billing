import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle2, Layout, Globe, Phone, Mail, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

interface Company {
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  phone?: string;
  email?: string;
  isDefault: number;
}

export function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    gstin: '',
    address: '',
    phone: '',
    email: ''
  });

  const tenantStr = localStorage.getItem('active_tenant');
  const tenant = tenantStr ? JSON.parse(tenantStr) : null;
  const activeCompanyStr = localStorage.getItem('active_company');
  const activeCompany = activeCompanyStr ? JSON.parse(activeCompanyStr) : null;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    if (!tenant) return;
    try {
      const res = await fetch(`${API_URL}/api/companies`, {
        headers: { 'x-tenant-id': tenant.id }
      });
      const data = await res.json();
      setCompanies(data);
    } catch (e) {
      console.error('Failed to fetch companies:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = async () => {
    if (!tenant || !newCompany.name) return;
    try {
      const id = 'c_' + Math.random().toString(36).substr(2, 9);
      const res = await fetch(`${API_URL}/api/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenant.id
        },
        body: JSON.stringify({ ...newCompany, id, isDefault: 0 })
      });
      if (res.ok) {
        setIsAdding(false);
        setNewCompany({ name: '', gstin: '', address: '', phone: '', email: '' });
        fetchCompanies();
      }
    } catch (e) {
      alert('Failed to add company');
    }
  };

  const switchCompany = (company: Company) => {
    localStorage.setItem('active_company', JSON.stringify(company));
    window.location.reload(); // Hard reload to reset all isolated states
  };

  const deleteCompany = async (id: string) => {
    if (activeCompany?.id === id) {
      alert("Cannot delete the currently active company.");
      return;
    }
    if (!confirm('Are you sure? All data for this company will be lost.')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/companies/${id}`, {
        method: 'DELETE',
        headers: { 'x-tenant-id': tenant.id }
      });
      if (res.ok) fetchCompanies();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 italic">Company Management</h2>
          <p className="text-slate-500 font-medium">Manage multiple businesses under your account.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New Business
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 animate-in slide-in-from-top duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" /> New Business Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Business Name*</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                value={newCompany.name}
                onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                placeholder="e.g. iFastX Tech Solutions"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">GSTIN (Optional)</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                value={newCompany.gstin}
                onChange={e => setNewCompany({...newCompany, gstin: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                value={newCompany.phone}
                onChange={e => setNewCompany({...newCompany, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                value={newCompany.email}
                onChange={e => setNewCompany({...newCompany, email: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">Address</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 h-20"
                value={newCompany.address}
                onChange={e => setNewCompany({...newCompany, address: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddCompany}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold"
            >
              Save Business
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((co) => (
          <div 
            key={co.id} 
            className={`bg-white p-6 rounded-3xl border-2 transition-all relative group ${
              activeCompany?.id === co.id ? 'border-blue-600 shadow-xl shadow-blue-600/5' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            {activeCompany?.id === co.id && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-lg">
                <CheckCircle2 size={16} />
              </div>
            )}
            
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Building2 size={24} />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{co.name}</h3>
            
            <div className="space-y-2 mb-6">
              {co.gstin && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GST: {co.gstin}
                </div>
              )}
              {co.phone && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Phone size={12} /> {co.phone}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <button 
                onClick={() => switchCompany(co)}
                disabled={activeCompany?.id === co.id}
                className={`flex items-center gap-2 font-bold text-sm ${
                  activeCompany?.id === co.id ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
                }`}
              >
                {activeCompany?.id === co.id ? 'Active Workspace' : 'Switch Workspace'}
                {activeCompany?.id !== co.id && <ArrowRight size={14} />}
              </button>

              <button 
                onClick={() => deleteCompany(co.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                title="Delete Company"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {isLoading && [1, 2].map(i => (
          <div key={i} className="bg-slate-100 animate-pulse h-48 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
