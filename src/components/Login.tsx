import React, { useState } from 'react';
import { Shield, Lock, User, FileText, Globe, IndianRupee, MessageCircle, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: (role: 'superadmin' | 'admin') => void;
  defaultIsSignUp?: boolean;
  onBackToHome?: () => void;
}

// Obfuscated Credentials
const S_UID = "OTU5NTk1NjM5Mg==";
const S_PWD = "aUZhc3RYQEFkbWluMjAyNQ==";
const A_UID = "YWRtaW4=";
const A_PWD = "YWRtaW4=";

export function Login({ onLogin, defaultIsSignUp = false, onBackToHome }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  
  const [signupData, setSignupData] = useState({
    companyName: '',
    email: '',
    phone: '',
    userid: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [plans, setPlans] = useState<any[]>([]);

  React.useEffect(() => {
    const p = localStorage.getItem('system_plans');
    if (p) {
      setPlans(JSON.parse(p));
    } else {
      setPlans([
        { id: '1', name: 'Starter', prices: { monthly: 99 } },
        { id: '2', name: 'Pro', prices: { monthly: 249 } }
      ]);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (isSignUp) {
        // Register new tenant trial
        if (!signupData.companyName || !signupData.email || !signupData.userid || !signupData.password) {
          setError('Please fill all required fields');
          setIsLoading(false);
          return;
        }

        const newTenant = {
          id: 't_' + Math.random().toString(36).substr(2, 9),
          name: signupData.companyName,
          email: signupData.email,
          phone: signupData.phone,
          loginId: signupData.userid,
          password: signupData.password,
          planId: '1',
          status: 'Active',
          joinedAt: new Date().toISOString().split('T')[0],
          // Trial expires in 1 day
          validTill: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        };

        const systemAdmins = JSON.parse(localStorage.getItem('system_admins') || '[]');
        systemAdmins.push(newTenant);
        localStorage.setItem('system_admins', JSON.stringify(systemAdmins));
        
        localStorage.setItem('active_tenant', JSON.stringify(newTenant));
        onLogin('admin');
        return;
      }

      // Basic obfuscation check for superadmin
      if (btoa(userid) === S_UID && btoa(password) === S_PWD) {
        onLogin('superadmin');
        return;
      }

      // Check dynamic tenants managed by superadmin
      const systemAdmins = JSON.parse(localStorage.getItem('system_admins') || '[]');
      const matchedTenant = systemAdmins.find((a: any) => a.loginId === userid && a.password === password);

      if (matchedTenant) {
        if (matchedTenant.status !== 'Active') {
          setError('Account is blocked. Please contact Superadmin.');
          setIsLoading(false);
          return;
        }
        localStorage.setItem('active_tenant', JSON.stringify(matchedTenant));
        onLogin('admin');
        return;
      }

      // Fallback Admin
      if (btoa(userid.toLowerCase()) === A_UID && btoa(password.toLowerCase()) === A_PWD) {
        // Set mock active tenant
        const backupAdmin = {
          id: 'admin_demo',
          name: 'Demo Admin Account',
          email: 'admin@demo.com',
          planId: '2',
          status: 'Active',
          joinedAt: '2023-01-01',
          validTill: '2026-12-31'
        };
        localStorage.setItem('active_tenant', JSON.stringify(backupAdmin));
        onLogin('admin');
      } else {
        setError('Invalid User ID or Password. Please try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Column - Advertising & Details */}
      <div className="hidden lg:flex flex-col w-1/2 bg-slate-900 text-white relative overflow-hidden p-12">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col mb-16">
            <div className="flex items-center gap-2">
              <div className="text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-4xl font-extrabold text-white tracking-tight italic">iFastX</span>
            </div>
            <span className="text-sm font-bold text-slate-300 tracking-wider mt-1 uppercase">GST Billing Platform</span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              The Ultimate GST <span className="text-blue-400">Billing & Accounting</span> Solution.
            </h1>
            <p className="text-lg text-slate-300 mb-12 leading-relaxed">
              Automate your workflow, manage inventory, send WhatsApp reminders directly from the platform, and generate elegant invoices in seconds. Scale your business effortlessly.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-lg mb-4">
                  <BarChart3 size={20} />
                </div>
                <h3 className="font-bold mb-2">Smart Reporting</h3>
                <p className="text-sm text-slate-400">GSTR-1 exports, Profit & Loss, and active cashbook management tracking.</p>
              </div>
              <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded-lg mb-4">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-bold mb-2">WhatsApp Sync</h3>
                <p className="text-sm text-slate-400">Connect via iFastX API to automatically notify clients about due estimates.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl border border-blue-500/30 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Current Pricing Offers</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Save up to 60%</span>
              </div>
              <div className="space-y-3">
                {plans.slice(0, 2).map((plan, idx) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <span className="text-slate-300">
                      <span className="text-white font-bold">{plan.name}</span>
                    </span>
                    <span className="font-mono text-white">₹{plan.prices?.yearly || (plan.price ? plan.price * 12 : 0)}/yr</span>
                  </div>
                ))}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-blue-300 font-medium text-sm text-right flex-col items-end">
                 Upgrade from your admin dashboard anytime.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        {onBackToHome && (
          <button 
            type="button"
            onClick={onBackToHome}
            className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
          >
            ← Back to Home
          </button>
        )}
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/5">
              <Shield size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {isSignUp ? 'Start 1-Day Free Trial' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Setup your full admin profile to begin exploring.' : 'Please enter your credentials to access the platform.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium border border-rose-100 flex items-start gap-2"
                >
                  <Shield size={18} className="shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {isSignUp ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your business name"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      placeholder="Opt"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
                <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Create Login Credentials</p>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">User ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="Choose a User ID"
                      value={signupData.userid}
                      onChange={(e) => setSignupData({...signupData, userid: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Create password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">User ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter User ID"
                      value={userid}
                      onChange={(e) => setUserid(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold transition-all bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 disabled:opacity-70 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Trial Account' : 'Secure Login'}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-blue-600 hover:text-blue-700 text-sm font-bold"
              >
                {isSignUp ? 'Already have an account? Login here.' : "Don't have an account? Sign Up."}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 bg-slate-100/50 p-4 rounded-xl border border-slate-200 border-dashed">
            <p className="font-medium text-slate-700 mb-1">Demo Access</p>
            <p>Admin Login: <span className="font-mono font-bold text-slate-800">admin</span> / <span className="font-mono font-bold text-slate-800">admin</span></p>
            <p className="text-xs mt-2 italic">You can also use credentials created via Superadmin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
