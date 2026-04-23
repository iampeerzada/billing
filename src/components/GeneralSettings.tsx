import React, { useState, useEffect } from 'react';
import { Save, Key, Server, MessageSquare, User, Lock } from 'lucide-react';
import { API_URL } from '../config';

export function GeneralSettings() {
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
        const response = await fetch(`${API_URL}/api/settings`);
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
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iFastXApiKey: apiKey,
          iFastXInstanceId: instanceId
        })
      });

      if (response.ok) {
        alert('iFastX API Settings saved successfully to backend!');
      }
    } catch (error) {
      alert('Failed to save settings to backend');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveProfile = () => {
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
      
      // Update active tenant
      localStorage.setItem('active_tenant', JSON.stringify(updatedTenant));
      
      // Update in system_admins list
      const adminsStr = localStorage.getItem('system_admins');
      if (adminsStr) {
        const admins = JSON.parse(adminsStr);
        const updatedAdmins = admins.map((a: any) => a.id === updatedTenant.id ? updatedTenant : a);
        localStorage.setItem('system_admins', JSON.stringify(updatedAdmins));
      }
    }
    
    setTimeout(() => {
      setIsProfileSaving(false);
      alert('Profile credentials updated successfully!');
    }, 600);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-2 border-slate-200">General Settings</h1>
        <p className="text-slate-500">Configure your application settings and third-party integrations.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tenant Profile</h2>
              <p className="text-sm text-slate-500">Manage your credentials and login password.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Login ID</label>
                <input
                  type="text"
                  value={profileLoginId}
                  onChange={(e) => setProfileLoginId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveProfile}
                disabled={isProfileSaving}
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isProfileSaving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* iFastX API Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">iFastX WhatsApp API Integration</h2>
              <p className="text-sm text-slate-500">Automate your invoice and reminder delivery via WhatsApp.</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. sk_live_xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Your private API key from iFastX dashboard.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instance ID</label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  placeholder="e.g. inst_xxxxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">The active WhatsApp instance ID to send messages from.</p>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveAPI}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
