import React, { useState, useEffect } from 'react';
import { Save, Key, Server, MessageSquare, User, Lock, Building2, Shield } from 'lucide-react';
import { API_URL } from '../config';
import { CompanyManager } from './CompanyManager';

export function GeneralSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [apiKey, setApiKey] = useState('');
  const [instanceId, setInstanceId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile state
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileLoginId, setProfileLoginId] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;

        const response = await fetch(`${API_URL}/api/settings`, {
          headers: {
            'x-tenant-id': activeTenant.id,
            'x-company-id': activeCompany.id
          }
        });
        if (response.ok) {
          const settings = await response.json();
          setApiKey(settings.iFastXApiKey || '');
          setInstanceId(settings.iFastXInstanceId || '');
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };
    
    fetchSettings();
    
    const activeTenantStr = localStorage.getItem('active_tenant');
    if (activeTenantStr) {
      const activeTenant = JSON.parse(activeTenantStr);
      setProfileName(activeTenant.name || '');
      setProfileEmail(activeTenant.email || '');
      setProfileLoginId(activeTenant.loginId || '');
      setProfilePassword(activeTenant.password || '');
    }
  }, []);

  const handleSaveAPI = async () => {
    setIsSaving(true);
    
    try {
      const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
      const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

      if (!activeTenant.id) return;

      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        },
        body: JSON.stringify({
          iFastXApiKey: apiKey,
          iFastXInstanceId: instanceId
        })
      });

      if (response.ok) {
        alert('iFastX API Settings saved successfully!');
      }
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveProfile = async () => {
    setIsProfileSaving(true);
    const activeTenantStr = localStorage.getItem('active_tenant');
    if (activeTenantStr) {
      const activeTenant = JSON.parse(activeTenantStr);
      const updatedTenant = {
        ...activeTenant,
        name: profileName,
        email: profileEmail,
        loginId: profileLoginId,
        password: profilePassword
      };
      
      try {
        const res = await fetch(`${API_URL}/api/tenants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': activeTenant.id
          },
          body: JSON.stringify(updatedTenant)
        });
        
        if (res.ok) {
          localStorage.setItem('active_tenant', JSON.stringify(updatedTenant));
          alert('Profile updated successfully!');
        }
      } catch (e) {
        alert('Failed to update profile on server');
      }
    }
    setIsProfileSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'My Account', icon: User },
    { id: 'companies', label: 'Manage Businesses', icon: Building2 },
    { id: 'integration', label: 'WhatsApp API', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic">Settings</h2>
          <p className="text-slate-500 font-medium">Configure your personal and business environment.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-900/5 p-8">
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Login ID</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={profileLoginId}
                  onChange={e => setProfileLoginId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleSaveProfile}
              disabled={isProfileSaving}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Save size={20} /> {isProfileSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        )}

        {activeTab === 'companies' && <CompanyManager />}

        {activeTab === 'integration' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-sm font-medium">
              Automate your invoice delivery via WhatsApp Business API using iFastX.
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Key size={16} /> API Key
                </label>
                <input 
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk_live_..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Server size={16} /> Instance ID
                </label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={instanceId}
                  onChange={e => setInstanceId(e.target.value)}
                  placeholder="inst_..."
                />
              </div>
            </div>

            <button 
              onClick={handleSaveAPI}
              disabled={isSaving}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Save size={20} /> {isSaving ? 'Saving...' : 'Save WhatsApp Configuration'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
