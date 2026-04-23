import React, { useState } from 'react';
import { Shield, Lock, User, FileText, Globe, IndianRupee, MessageCircle, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL } from '../config';

interface LoginProps {
  onLogin: (role: 'superadmin' | 'admin') => void;
  defaultIsSignUp?: boolean;
  onBackToHome?: () => void;
}

// Obfuscated Credentials for Superadmin Fallback
const S_UID = "OTU5NTk1NjM5Mg==";
const S_PWD = "aUZhc3RYQEFkbWluMjAyNQ==";

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

  // Professional Mail Utility
  const sendWelcomeEmail = async (tenantData: any) => {
    try {
      const emailContent = `
        <h2 style="color: #0f172a;">Welcome to iFastX, ${tenantData.name}!</h2>
        <p>Your 1-day free trial account has been created successfully. We are excited to have you onboard.</p>
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Your Login ID:</strong> ${tenantData.loginId}</p>
          <p style="margin: 10px 0 0 0;"><strong>Quick Note:</strong> Please follow the <strong>Setup Wizard</strong> on your first login to configure your business profile and tax details.</p>
        </div>
        <p>If you need any assistance, feel free to contact our support team at support@ifastx.in.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://ifastx.in/billing" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Your Dashboard</a>
        </div>
      `;

      await fetch('https://ifastx.in/mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: tenantData.email,
          subject: 'Welcome to iFastX GST Billing Platform - Setup Required',
          message: emailContent,
          type: 'support'
        })
      });
    } catch (err) {
      console.error("Welcome Email Error:", err);
    }
  };

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/plans`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data);
        }
      } catch (e) {
        setPlans([
          { id: '1', name: 'Starter', prices: { monthly: 99 } },
          { id: '2', name: 'Pro', prices: { monthly: 249 } }
        ]);
      }
    };
    fetchPlans();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Superadmin Hardcoded Fallback Check
      if (!isSignUp && btoa(userid) === S_UID && btoa(password) === S_PWD) {
        onLogin('superadmin');
        return;
      }

      // 2. Handle Sign Up
      if (isSignUp) {
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
          setupCompleted: 0,
          joinedAt: new Date().toISOString().split('T')[0],
          validTill: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        };

        const res = await fetch(`${API_URL}/api/tenants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTenant)
        });

        if (res.ok) {
          await sendWelcomeEmail(newTenant);
          // Auto-login after signup
          const loginRes = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ loginId: signupData.userid, password: signupData.password })
          });
          if (loginRes.ok) {
            const data = await loginRes.json();
            localStorage.setItem('active_tenant', JSON.stringify(data.tenant));
            onLogin('admin');
            return;
          }
        } else {
          setError('User ID or Email already exists.');
          setIsLoading(false);
          return;
        }
      }

      // 3. Regular Login
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: userid, password })
      });

      if (response.ok) {
        const data = await response.json();
        const tenant = data.tenant;
        localStorage.setItem('active_tenant', JSON.stringify(tenant));
        onLogin(tenant.loginId === 'admin' ? 'superadmin' : 'admin');
      } else {
        setError('Invalid User ID or Password.');
      }
    } catch (err) {
      setError('Connection to backend failed. Please check your VPS API.');
    } finally {
      setIsLoading(false);
    }
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
                <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Official Support Available</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">24/7 Assistance</span>
              </div>
              <div className="space-y-3">
                <p className="text-slate-300 text-sm">
                  Need help with setup? Reach out to <span className="text-white font-bold">support@ifastx.in</span>
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-blue-300 font-medium text-sm">
                  Powered by FastX Technology Solutions
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">User ID or Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter ID or Email"
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
            <p className="font-medium text-slate-700 mb-1">Official Support</p>
            <p className="flex items-center justify-center gap-2">
              <Mail size={14} /> support@ifastx.in
            </p>
            <p className="text-xs mt-2 italic">You will receive a professional welcome email upon signup.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
