import React, { useState, useEffect } from 'react';
import { Users, Server, Shield, Edit, Trash2, CheckCircle, Search, Settings, Save, AlertCircle, RefreshCw, X, Plus } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  prices: {
    monthly: number;
    quarterly: number;
    halfYearly: number;
    yearly: number;
  };
  features: string[];
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  loginId?: string;
  password?: string;
  planId: string;
  status: 'Active' | 'Blocked';
  validTill: string;
  joinedAt: string;
}

const DEFAULT_PLANS: Plan[] = [
  { id: '1', name: 'Starter', prices: { monthly: 99, quarterly: 279, halfYearly: 549, yearly: 999 }, features: ['50 Invoices/month', 'Basic Reports', 'Email Support'] },
  { id: '2', name: 'Pro', prices: { monthly: 249, quarterly: 699, halfYearly: 1299, yearly: 2499 }, features: ['Unlimited Invoices', 'GSTR Export', 'WhatsApp Automation', 'Priority Support'] },
  { id: '3', name: 'Enterprise', prices: { monthly: 499, quarterly: 1399, halfYearly: 2599, yearly: 4999 }, features: ['Custom Integrations', 'Multiple Users', 'Dedicated Account Manager'] }
];

const MOCK_ADMINS: AdminProfile[] = [
  { id: 'a1', name: 'Tech Solutions Ltd', email: 'admin@techsolutions.com', planId: '2', status: 'Active', validTill: '2026-12-31', joinedAt: '2023-01-15' },
  { id: 'a2', name: 'Global Retail', email: 'billing@globalretail.com', planId: '1', status: 'Blocked', validTill: '2024-05-20', joinedAt: '2024-01-01' },
];

export function SuperadminPanel() {
  const [activeSubTab, setActiveSubTab] = useState<'admins' | 'plans' | 'settings'>('admins');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<AdminProfile | null>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    email: '',
    phone: '',
    loginId: '',
    password: '',
    planId: '1'
  });

  useEffect(() => {
    // Load data from local storage or use defaults
    const storedPlans = localStorage.getItem('system_plans');
    const storedAdmins = localStorage.getItem('system_admins');

    if (storedPlans) {
      let parsedPlans = JSON.parse(storedPlans);
      // Migration: convert old 'price: number' to new 'prices' object structure
      if (parsedPlans.length > 0 && typeof parsedPlans[0].price === 'number') {
        parsedPlans = parsedPlans.map((p: any) => ({
          ...p,
          prices: {
            monthly: Math.round(p.price / 12),
            quarterly: Math.round(p.price / 4),
            halfYearly: Math.round(p.price / 2),
            yearly: p.price
          }
        }));
        localStorage.setItem('system_plans', JSON.stringify(parsedPlans));
      }
      setPlans(parsedPlans);
    } else {
      setPlans(DEFAULT_PLANS);
      localStorage.setItem('system_plans', JSON.stringify(DEFAULT_PLANS));
    }

    if (storedAdmins) setAdmins(JSON.parse(storedAdmins));
    else {
      setAdmins(MOCK_ADMINS);
      localStorage.setItem('system_admins', JSON.stringify(MOCK_ADMINS));
    }
  }, []);

  const handleToggleAdminStatus = (id: string) => {
    const updated = admins.map(admin => 
      admin.id === id ? { ...admin, status: admin.status === 'Active' ? 'Blocked' as const : 'Active' as const } : admin
    );
    setAdmins(updated);
    localStorage.setItem('system_admins', JSON.stringify(updated));
  };

  const savePlans = () => {
    localStorage.setItem('system_plans', JSON.stringify(plans));
    alert('Subscription plans updated successfully across the platform.');
  };

  const getPlanName = (planId: string) => plans.find(p => p.id === planId)?.name || 'Unknown Plan';

  const resetData = () => {
    if(window.confirm('Reset all demo data for Superadmin?')) {
      setPlans(DEFAULT_PLANS);
      setAdmins(MOCK_ADMINS);
      localStorage.setItem('system_plans', JSON.stringify(DEFAULT_PLANS));
      localStorage.setItem('system_admins', JSON.stringify(MOCK_ADMINS));
    }
  };

  const handleAddTenant = () => {
    if (!newTenant.name || !newTenant.email || !newTenant.loginId || !newTenant.password) {
      alert("Please fill all required fields: Name, Email, Login ID, and Password.");
      return;
    }

    const tenant: AdminProfile = {
      id: 't_' + Math.random().toString(36).substr(2, 9),
      name: newTenant.name,
      email: newTenant.email,
      phone: newTenant.phone,
      loginId: newTenant.loginId,
      password: newTenant.password,
      planId: newTenant.planId,
      status: 'Active',
      joinedAt: new Date().toISOString().split('T')[0],
      validTill: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // 1 year default
    };

    const updated = [...admins, tenant];
    setAdmins(updated);
    localStorage.setItem('system_admins', JSON.stringify(updated));
    
    alert(`Success! Tenant profile created for ${tenant.name}.\n\nThe website profile setup configuration and login credentials have been sent to ${tenant.email}.\nLink: https://ifastx.in/billing/setup`);
    
    setIsAddingTenant(false);
    setNewTenant({
      name: '', email: '', phone: '', loginId: '', password: '', planId: '1'
    });
  };

  const filteredAdmins = admins.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-rose-900 flex items-center gap-3">
            <Shield className="text-rose-600" size={32} />
            Superadmin Control Panel
          </h1>
          <p className="text-slate-500 mt-1">Manage tenants, subscription plans, and platform-wide settings.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetData} className="flex items-center gap-2 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium">
            <RefreshCw size={18} />
            Reset Data
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 space-y-2 shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <button 
            onClick={() => setActiveSubTab('admins')}
            className={`flex-1 lg:w-full flex justify-center lg:justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeSubTab === 'admins' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users size={20} />
            Manage Admins
          </button>
          <button 
            onClick={() => setActiveSubTab('plans')}
            className={`flex-1 lg:w-full flex justify-center lg:justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeSubTab === 'plans' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Server size={20} />
            Subscription Plans
          </button>
          <button 
            onClick={() => setActiveSubTab('settings')}
            className={`flex-1 lg:w-full flex justify-center lg:justify-start items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${
              activeSubTab === 'settings' ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings size={20} />
            Platform Settings
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeSubTab === 'admins' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">Admin Tenants (Users)</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search admins..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none text-sm w-64"
                    />
                  </div>
                  <button 
                    onClick={() => setIsAddingTenant(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    <Plus size={18} />
                    Add Tenant
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Admin Profile</th>
                      <th className="p-4">Current Plan</th>
                      <th className="p-4">Expires On</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmins.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No admins found.</td></tr>
                    ) : filteredAdmins.map(admin => (
                      <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{admin.name}</div>
                          <div className="text-sm text-slate-500">{admin.email}</div>
                          <div className="text-xs text-slate-400 mt-1">Joined: {admin.joinedAt}</div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {getPlanName(admin.planId)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm ${new Date(admin.validTill) < new Date() ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {admin.validTill}
                            {new Date(admin.validTill) < new Date() && " (Expired)"}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {admin.status === 'Active' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                            {admin.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => setEditingAdmin(admin)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                            title="Edit / Transfer Admin Profile"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleToggleAdminStatus(admin.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              admin.status === 'Active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {admin.status === 'Active' ? 'Block' : 'Unblock'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Admin Modal */}
              {editingAdmin && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800">Edit / Transfer Admin Status</h3>
                      <button onClick={() => setEditingAdmin(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company / Display Name</label>
                        <input
                          type="text"
                          value={editingAdmin.name}
                          onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                          className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <label className="block text-sm font-bold text-amber-900 mb-1">Admin Email (Transfer Ownership)</label>
                        <input
                          type="email"
                          value={editingAdmin.email}
                          onChange={(e) => setEditingAdmin({ ...editingAdmin, email: e.target.value })}
                          className="w-full border border-amber-300 p-2 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all mb-2"
                        />
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          ⚠️ Modifying this email address effectively transfers the tenant's entire dashboard and data permissions to the new email address.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Login ID / Username</label>
                          <input
                            type="text"
                            value={editingAdmin.loginId || ''}
                            onChange={(e) => setEditingAdmin({ ...editingAdmin, loginId: e.target.value })}
                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. techadmin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                          <input
                            type="text"
                            value={editingAdmin.password || ''}
                            onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Change password"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Subscription Plan</label>
                          <select
                            value={editingAdmin.planId}
                            onChange={(e) => setEditingAdmin({ ...editingAdmin, planId: e.target.value })}
                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                          >
                            {plans.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Valid Till</label>
                          <input
                            type="date"
                            value={editingAdmin.validTill}
                            onChange={(e) => setEditingAdmin({ ...editingAdmin, validTill: e.target.value })}
                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button 
                        onClick={() => setEditingAdmin(null)} 
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const updated = admins.map(a => a.id === editingAdmin.id ? editingAdmin : a);
                          setAdmins(updated);
                          localStorage.setItem('system_admins', JSON.stringify(updated));
                          setEditingAdmin(null);
                        }}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        <Save size={18} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Tenant Modal */}
              {isAddingTenant && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="text-xl font-bold text-slate-800">Add New Tenant</h3>
                      <button onClick={() => setIsAddingTenant(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company / Display Name</label>
                        <input
                          type="text"
                          required
                          value={newTenant.name}
                          onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                          className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={newTenant.email}
                            onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={newTenant.phone}
                            onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-4">
                        <h4 className="font-bold text-blue-900 text-sm">Login Credentials</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-1">User ID</label>
                            <input
                              type="text"
                              required
                              value={newTenant.loginId}
                              onChange={(e) => setNewTenant({ ...newTenant, loginId: e.target.value })}
                              className="w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
                            <input
                              type="text"
                              required
                              value={newTenant.password}
                              onChange={(e) => setNewTenant({ ...newTenant, password: e.target.value })}
                              className="w-full border border-blue-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Plan</label>
                        <select
                          value={newTenant.planId}
                          onChange={(e) => setNewTenant({ ...newTenant, planId: e.target.value })}
                          className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                        >
                          {plans.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsAddingTenant(false)} 
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddTenant}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                      >
                        <Save size={18} />
                        Create & Send Setup Link
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Subscription Plans (Razorpay Attached)</h2>
                <button onClick={savePlans} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  <Save size={18} /> Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                      <input 
                        type="text" 
                        value={plan.name}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[index].name = e.target.value;
                          setPlans(updated);
                        }}
                        className="text-xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full mb-3"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Monthly</label>
                          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-md border border-slate-200">
                            <span className="text-slate-500 font-medium text-sm">₹</span>
                            <input 
                              type="number"
                              value={plan.prices?.monthly || 0}
                              onChange={(e) => {
                                const updated = [...plans];
                                updated[index].prices.monthly = parseFloat(e.target.value) || 0;
                                setPlans(updated);
                              }}
                              className="text-sm font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Quarterly</label>
                          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-md border border-slate-200">
                            <span className="text-slate-500 font-medium text-sm">₹</span>
                            <input 
                              type="number"
                              value={plan.prices?.quarterly || 0}
                              onChange={(e) => {
                                const updated = [...plans];
                                updated[index].prices.quarterly = parseFloat(e.target.value) || 0;
                                setPlans(updated);
                              }}
                              className="text-sm font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Half Yearly</label>
                          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-md border border-slate-200">
                            <span className="text-slate-500 font-medium text-sm">₹</span>
                            <input 
                              type="number"
                              value={plan.prices?.halfYearly || 0}
                              onChange={(e) => {
                                const updated = [...plans];
                                updated[index].prices.halfYearly = parseFloat(e.target.value) || 0;
                                setPlans(updated);
                              }}
                              className="text-sm font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[10px] uppercase font-bold text-slate-500 mb-1">Yearly</label>
                          <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-md border border-slate-200">
                            <span className="text-slate-500 font-medium text-sm">₹</span>
                            <input 
                              type="number"
                              value={plan.prices?.yearly || 0}
                              onChange={(e) => {
                                const updated = [...plans];
                                updated[index].prices.yearly = parseFloat(e.target.value) || 0;
                                setPlans(updated);
                              }}
                              className="text-sm font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Included Features</label>
                      <textarea
                        value={plan.features.join('\n')}
                        onChange={(e) => {
                          const updated = [...plans];
                          updated[index].features = e.target.value.split('\n');
                          setPlans(updated);
                        }}
                        rows={6}
                        className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none flex-1 leading-relaxed"
                        placeholder="Enter features (one per line)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Platform Settings</h2>
              
              <div className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Superadmin Email</label>
                  <input type="text" defaultValue="ifastbroadband@gmail.com" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razorpay Key ID (For processing admin subscriptions)</label>
                  <input type="text" defaultValue="rzp_live_RmMPzyo61J8piH" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Bound to application for payment gateway integration.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Razorpay Key Secret</label>
                  <input type="password" defaultValue="************************" disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono text-sm" />
                  <p className="text-xs text-rose-500 mt-1">Key secret is obfuscated for security.</p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button onClick={() => alert("Platform configurations saved.")} className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium">Save Settings</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
