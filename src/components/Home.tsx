import React from 'react';
import { Shield, Zap, TrendingUp, CheckCircle, Smartphone, ArrowRight, LayoutDashboard, Calculator, Package } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigation: (route: 'login' | 'signup') => void;
}

export function Home({ onNavigation }: HomeProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 text-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">iFast<span className="text-blue-600">X</span></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">GST Billing Platform</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="https://ifastx.in/#about" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="https://ifastx.in/#contact" className="hover:text-blue-600 transition-colors">Contact Us</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigation('login')} 
              className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => onNavigation('signup')}
              className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background decorations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 border border-blue-100"
            >
              <Zap size={16} /> The Next-Gen GST Billing Platform
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight"
            >
              Invoicing, Inventory &<br />Accounting. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplified.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Create professional GST invoices, track stock movements instantly, and manage your ledger without needing an accounting degree.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => onNavigation('signup')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95"
              >
                Start Free Trial <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => onNavigation('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
              >
                Login to Dashboard
              </button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to run your business</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">iFastX combines multiple tools into one seamless platform. No more switching between spreadsheets and outdated accounting software.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-6">
                  <LayoutDashboard size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">GST Billing & Estimates</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Create beautiful, compliant GST invoices in seconds. Convert estimates to invoices instantly. Customizable themes included.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-6">
                  <Package size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Inventory Management</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Real-time stock tracking. Invoices auto-deduct stock, purchase bills auto-add. Get notified instantly when items run low.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-6">
                  <Calculator size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Comprehensive Accounting</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Built-in Cashbook, Profit & Loss, Balance Sheet, and Party Ledgers. Export all your data seamlessly in CSV formats.</p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-6">
                  <Smartphone size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">WhatsApp Automations</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Send invoices, payment links, and due reminders directly to your clients' WhatsApp instantly using our native integration.</p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-6">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Outstanding Payments</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Track who owes you what. Record multiple payment types (UPI, Cash, Cheque) against single invoices seamlessly.</p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 mb-6">
                  <Shield size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Vendor & Customer Master</h3>
                <p className="text-slate-600 leading-relaxed text-sm">Maintain a centralized database of all your trading partners. Set credit limits for specific B2B customers effortlessly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 mb-16">
            <h2 className="text-4xl font-extrabold mb-6">Ready to scale your business?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Join the forward-thinking businesses upgrading from pen and paper.</p>
          </div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {JSON.parse(localStorage.getItem('system_plans') || '[]').length > 0 ? (
                JSON.parse(localStorage.getItem('system_plans') || '[]').map((plan: any, i: number) => (
                  <div key={plan.id} className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-slate-700 relative flex flex-col hover:border-blue-500 hover:-translate-y-2 transition-all">
                    {i === 1 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-white">₹{plan.prices?.yearly || (plan.price ? plan.price * 12 : 0)}</span>
                      <span className="text-slate-400">/yr</span>
                    </div>
                    {/* Features list */}
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features?.map((f: string, fi: number) => (
                        <li key={fi} className="flex items-start gap-3">
                          <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => onNavigation('signup')}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                        i === 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      Start Free Trial
                    </button>
                  </div>
                ))
              ) : (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700 animate-pulse h-96"></div>
                ))
              )}
            </div>
          </div>

          <div className="text-center relative z-10">
            <p className="mt-6 text-sm text-slate-500 font-medium">No credit card required. 1-Day Trial.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  <Shield size={16} />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">iFast<span className="text-blue-600">X</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Empowering small and medium businesses across India with seamless invoicing, stock tracking, and accounting tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><button onClick={() => onNavigation('login')} className="hover:text-blue-600 transition-colors">Login</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500">
                <li><a href="https://ifastx.in/#about" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="https://ifastx.in/#contact" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="https://ifastx.in/#privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="https://ifastx.in/#terms-conditions" className="hover:text-blue-600 transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
            <p>© {new Date().getFullYear()} iFastX. All rights reserved.</p>
            <p>Made with ❤️ for Indian Businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
