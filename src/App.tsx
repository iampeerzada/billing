import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceBuilder } from './components/InvoiceBuilder';
import { Inventory } from './components/Inventory';
import { CustomerList } from './components/CustomerList';
import { UserRole, AppRoute } from './types';
import { Login } from './components/Login';
import { SuperadminPanel } from './components/SuperadminPanel';
import { Subscription } from './components/Subscription';
import { SetupWizard } from './components/SetupWizard';
import { API_URL } from './config';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appRoute, setAppRoute] = useState<AppRoute>('login');
  const [activeTenant, setActiveTenant] = useState<any>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') as UserRole;
    const tab = localStorage.getItem('activeTab') || 'dashboard';

    if (auth && role) {
      handleLogin(role, true);
      if (tab) {
        setTimeout(() => setActiveTab(tab), 50);
      }
    }
  }, []);

  const handleLogin = (role: 'admin' | 'superadmin', isAutoLogin = false) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setAppRoute('app');
    
    if (!isAutoLogin) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
    }
    
    if (role === 'admin') {
      const tenantStr = localStorage.getItem('active_tenant');
      if (tenantStr) {
        const tenant = JSON.parse(tenantStr);
        setActiveTenant(tenant);
        
        // Ensure company context
        if (!localStorage.getItem('active_company')) {
          localStorage.setItem('active_company', JSON.stringify({ id: 'default', name: tenant.name }));
        }

        // Check if setup is needed
        if (tenant.setupCompleted === 0 || tenant.setupCompleted === '0') {
          setNeedsSetup(true);
          setActiveTab('setup');
          if (!isAutoLogin) localStorage.setItem('activeTab', 'setup');
          return;
        } else {
          setNeedsSetup(false);
        }

        // Check trial or subscription expiration
        if (tenant.validTill) {
          const expired = new Date().toISOString().split('T')[0] > tenant.validTill;
          setIsExpired(expired);
          if (expired) {
            setActiveTab('subscription');
            if (!isAutoLogin) localStorage.setItem('activeTab', 'subscription');
            return;
          }
        }
      }
    }
    
    if (!isAutoLogin) {
      const defaultTab = role === 'superadmin' ? 'superadmin' : 'dashboard';
      setActiveTab(defaultTab);
      localStorage.setItem('activeTab', defaultTab);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setAppRoute('login');
    setActiveTenant(null);
    localStorage.clear();
  };

  if (appRoute === 'login') {
    return <Login onLogin={handleLogin} onBackToHome={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 min-h-screen p-6 text-white shrink-0">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl font-bold italic tracking-tighter">iFastX</span>
          </div>

          <nav className="space-y-1">
            {userRole === 'superadmin' ? (
              <button 
                onClick={() => setActiveTab('superadmin')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'superadmin' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}
              >
                Superadmin Panel
              </button>
            ) : isExpired ? (
              <button 
                onClick={() => setActiveTab('subscription')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'subscription' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}
              >
                Renew Subscription
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('invoices')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'invoices' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  Sales Invoices
                </button>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  Inventory
                </button>
              </>
            )}
          </nav>

          <div className="mt-auto pt-10">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'superadmin' && <SuperadminPanel />}
            {activeTab === 'setup' && (
              <SetupWizard 
                tenant={activeTenant} 
                onComplete={() => {
                  const updatedTenant = { ...activeTenant, setupCompleted: 1 };
                  setActiveTenant(updatedTenant);
                  localStorage.setItem('active_tenant', JSON.stringify(updatedTenant));
                  setNeedsSetup(false);
                  setActiveTab('dashboard');
                }} 
              />
            )}
            {activeTab === 'dashboard' && <Dashboard onNewInvoice={() => setActiveTab('new-invoice')} />}
            {activeTab === 'invoices' && <InvoiceList onNewInvoice={() => setActiveTab('new-invoice')} />}
            {activeTab === 'new-invoice' && <InvoiceBuilder onCancel={() => setActiveTab('invoices')} />}
            {activeTab === 'inventory' && <Inventory />}
            {activeTab === 'subscription' && <Subscription tenant={activeTenant} />}
          </div>
        </main>
      </div>
    </div>
  );
}

