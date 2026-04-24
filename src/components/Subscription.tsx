import React, { useState, useEffect } from 'react';
import { Crown, CheckCircle2, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

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

type BillingCycle = 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';

const DEFAULT_PLANS: Plan[] = [
  { id: '1', name: 'Starter', prices: { monthly: 99, quarterly: 279, halfYearly: 549, yearly: 999 }, features: ['50 Invoices/month', 'Basic Reports', 'Email Support'] },
  { id: '2', name: 'Pro', prices: { monthly: 249, quarterly: 699, halfYearly: 1299, yearly: 2499 }, features: ['Unlimited Invoices', 'GSTR Export', 'WhatsApp Automation', 'Priority Support'] },
  { id: '3', name: 'Enterprise', prices: { monthly: 499, quarterly: 1399, halfYearly: 2599, yearly: 4999 }, features: ['Custom Integrations', 'Multiple Users', 'Dedicated Account Manager'] }
];

// Utility to load Razorpay Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export function Subscription() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState('1');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

  useEffect(() => {
    const activeTenantStr = localStorage.getItem('active_tenant');
    if (activeTenantStr) {
      const activeTenant = JSON.parse(activeTenantStr);
      if (activeTenant.planId) setCurrentPlanId(activeTenant.planId);
    }
    
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${API_URL}/api/plans`, {
          headers: { 'x-tenant-id': 'system', 'x-company-id': 'system' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setPlans(data);
            return;
          }
        }
      } catch(e) {}
      
      const storedPlans = localStorage.getItem('system_plans');
      if (storedPlans) {
        let parsedPlans = JSON.parse(storedPlans);
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
        }
        setPlans(parsedPlans);
      } else {
        setPlans(DEFAULT_PLANS);
      }
    };
    fetchPlans();
  }, []);

  const handlePayment = async (plan: Plan) => {
    setIsProcessing(true);
    
    // Load Razorpay dynamically
    const res = await loadRazorpayScript();
    
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsProcessing(false);
      return;
    }

    // Razorpay Integration Options
    const amountToCharge = plan.prices[billingCycle];
    const options = {
      key: 'rzp_live_RmMPzyo61J8piH', // The injected Razorpay key from Superadmin configuration
      amount: amountToCharge * 100, // Razorpay works in terms of paise (1 INR = 100 paise)
      currency: 'INR',
      name: 'iFastX GST Billing',
      description: `Subscription Upgrade to ${plan.name} (${billingCycle})`,
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Temporary generic icon
      handler: function (response: any) {
        
        let daysToAdd = 365;
        if (billingCycle === 'monthly') daysToAdd = 30;
        if (billingCycle === 'quarterly') daysToAdd = 90;
        if (billingCycle === 'halfYearly') daysToAdd = 180;
        
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + daysToAdd);
        const newValidTill = newDate.toISOString().split('T')[0];

        const activeTenantStr = localStorage.getItem('active_tenant');
        if (activeTenantStr) {
          const tenant = JSON.parse(activeTenantStr);
          tenant.planId = plan.id;
          tenant.validTill = newValidTill;
          localStorage.setItem('active_tenant', JSON.stringify(tenant));

          // Also update Superadmin database to reflect changes
          const systemAdmins = JSON.parse(localStorage.getItem('system_admins') || '[]');
          const updatedAdmins = systemAdmins.map((a: any) => 
            a.id === tenant.id ? { ...a, planId: plan.id, validTill: newValidTill } : a
          );
          localStorage.setItem('system_admins', JSON.stringify(updatedAdmins));
        }

        alert(`Payment successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour account has been upgraded to ${plan.name}.`);
        setCurrentPlanId(plan.id);
        setIsProcessing(false);
        // Force reload to apply new limits without needing context setup
        window.location.reload();
      },
      prefill: {
        name: 'Admin User',
        email: 'admin@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#2563eb' // Ensure color aligns with UI
      }
    };

    try {
      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        alert(`Payment Failed.\nReason: ${response.error.description}`);
        setIsProcessing(false);
      });
      
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Error initializing the payment gateway.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
          <Crown size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Upgrade Your Business Experience</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Choose a plan that scales with your business needs. Simple pricing, no hidden fees, powered by secure Razorpay checkout.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-xl">
          {(['monthly', 'quarterly', 'halfYearly', 'yearly'] as BillingCycle[]).map(cycle => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-6 py-2.5 outline-none rounded-lg text-sm font-bold transition-all ${
                billingCycle === cycle 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cycle === 'monthly' && 'Monthly'}
              {cycle === 'quarterly' && 'Quarterly'}
              {cycle === 'halfYearly' && 'Half-Yearly'}
              {cycle === 'yearly' && 'Yearly (Save 20%)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative bg-white rounded-3xl border-2 transition-all duration-300 flex flex-col ${
              currentPlanId === plan.id 
                ? 'border-emerald-500 shadow-xl shadow-emerald-900/10 scale-105' 
                : 'border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/10'
            }`}
          >
            {currentPlanId === plan.id && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                Current Plan
              </div>
            )}
            
            <div className="p-8 border-b border-slate-100 flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">₹{plan.prices[billingCycle]}</span>
                <span className="text-slate-500 font-medium">/{billingCycle === 'monthly' ? 'mo' : billingCycle === 'yearly' ? 'yr' : billingCycle === 'quarterly' ? 'qtr' : 'h-yr'}</span>
              </div>
              
              <ul className="space-y-4">
                {(Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? plan.features.split(',') : [])).filter(f => f.trim() !== '').map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-slate-50 rounded-b-3xl mt-auto">
              {currentPlanId === plan.id ? (
                <button 
                  disabled
                  className="w-full py-3 px-6 rounded-xl font-bold transition-all bg-emerald-100 text-emerald-700 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={20} />
                  Active Package
                </button>
              ) : (
                <button 
                  onClick={() => handlePayment(plan)}
                  disabled={isProcessing}
                  className="w-full py-3 px-6 rounded-xl font-bold transition-all bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  <CreditCard size={20} />
                  {isProcessing ? 'Processing...' : `Buy ${plan.name}`}
                  {!isProcessing && <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />}
                </button>
              )}
              <div className="text-center mt-4 flex items-center justify-center gap-1.5 opacity-50">
                <ShieldCheck size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Secured by Razorpay</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
