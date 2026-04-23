import React, { useState } from 'react';
import { Shield, Save, CheckCircle2, Settings, Mail, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL } from '../config';

interface SetupWizardProps {
  tenant: any;
  onComplete: () => void;
}

export function SetupWizard({ tenant, onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [auth, setAuth] = useState({
    loginId: tenant.loginId || '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const tenantId = tenant.id;

      const commonHeaders = {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId
      };

      // Update Tenant Password & Setup Status
      const updatedTenant = {
        ...tenant,
        loginId: auth.loginId,
        password: auth.newPassword || tenant.password,
        setupCompleted: 1
      };

      const res = await fetch(`${API_URL}/api/tenants`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(updatedTenant)
      });

      if (res.ok) {
        onComplete();
      } else {
        alert('Failed to finalize setup. Please try again.');
      }
    } catch (error) {
      console.error('Setup Wizard Error:', error);
      alert('Connection error. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden shadow-blue-900/5 border border-slate-100">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 italic">Security Setup</h2>
            <p className="text-slate-500 font-medium text-sm text-balance">Update your credentials to secure your iFastX account.</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Login ID</label>
            <div className="flex items-center relative">
              <User size={18} className="absolute left-4 text-slate-400" />
              <input 
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={auth.loginId}
                onChange={(e) => setAuth({...auth, loginId: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
              <input 
                type="password"
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={auth.newPassword}
                onChange={(e) => setAuth({...auth, newPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
              <input 
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={auth.confirmPassword}
                onChange={(e) => setAuth({...auth, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-amber-700 text-sm font-medium">
            <Shield size={20} className="shrink-0" />
            Changing your temporary password is required for the first time.
          </div>

          <button 
            onClick={handleFinish}
            disabled={isLoading || !auth.loginId || !auth.newPassword || auth.newPassword !== auth.confirmPassword}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Complete Security Setup <CheckCircle2 size={20} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
