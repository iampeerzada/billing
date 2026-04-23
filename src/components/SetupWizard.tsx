import React, { useState } from 'react';
import { Building2, Save, CheckCircle2, Shield, Settings, Mail, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL } from '../config';

interface SetupWizardProps {
  tenant: any;
  onComplete: () => void;
}

export function SetupWizard({ tenant, onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    companyName: tenant.name || '',
    email: tenant.email || '',
    phone: tenant.phone || '',
    address: '',
    gstin: '',
    pan: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifsc: '',
      bankName: ''
    }
  });

  const [auth, setAuth] = useState({
    loginId: tenant.loginId || '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // 1. Save Settings (Company Profile)
      await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_profile: profile
        })
      });

      // 2. Update Tenant Password & Setup Status
      const updatedTenant = {
        ...tenant,
        loginId: auth.loginId,
        password: auth.newPassword || tenant.password,
        setupCompleted: 1
      };

      const res = await fetch(`${API_URL}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden shadow-blue-900/5 border border-slate-100">
        <div className="bg-blue-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold italic">Account Setup Wizard</h2>
              <p className="text-blue-100 text-sm font-medium">Complete these steps to start using iFastX</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-white' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Building2 size={20} />
                  <h3 className="font-bold text-lg">Business Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Name</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      value={profile.companyName}
                      onChange={(e) => setProfile({...profile, companyName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">GSTIN (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      value={profile.gstin}
                      onChange={(e) => setProfile({...profile, gstin: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Business Address</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium h-24 resize-none"
                    placeholder="Enter full business address"
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Shield size={20} />
                  <h3 className="font-bold text-lg">Account & Security</h3>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-amber-700 text-sm font-medium">
                  <Shield size={20} className="shrink-0" />
                  We recommend changing your temporary password for better security.
                </div>

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

                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    disabled={auth.newPassword !== '' && auth.newPassword !== auth.confirmPassword}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    Next Step <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Ready to Go!</h3>
                  <p className="text-slate-500 font-medium">All your basic settings have been saved. You can always update them later in the Settings menu.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Business:</span>
                    <span className="font-bold text-slate-800">{profile.companyName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Login ID:</span>
                    <span className="font-bold text-slate-800">{auth.loginId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subscription:</span>
                    <span className="text-blue-600 font-bold uppercase text-xs tracking-wider">Enterprise Trial</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Start Managing iFastX <CheckCircle2 size={20} /></>
                    )}
                  </button>
                  <button 
                    onClick={() => setStep(2)}
                    className="text-slate-500 font-bold text-sm hover:text-slate-700"
                  >
                    Review Details
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
