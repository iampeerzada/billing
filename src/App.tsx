import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InvoiceBuilder } from './components/InvoiceBuilder';
import { EstimateBuilder } from './components/EstimateBuilder';
import { PurchaseBillBuilder } from './components/PurchaseBillBuilder';
import { CreditDebitNoteBuilder } from './components/CreditDebitNoteBuilder';
import { PartyLedger } from './components/PartyLedger';
import { Cashbook } from './components/Cashbook';
import { ProfitLoss } from './components/ProfitLoss';
import { BalanceSheet } from './components/BalanceSheet';
import { StockInOut } from './components/StockInOut';
import { LowStockAlert } from './components/LowStockAlert';
import { BatchExpiry } from './components/BatchExpiry';
import { CustomerHistory } from './components/CustomerHistory';
import { OutstandingPayments } from './components/OutstandingPayments';
import { CreditLimit } from './components/CreditLimit';
import { AutoReminder } from './components/AutoReminder';
import { GSTR1Export } from './components/GSTR1Export';
import { BackupRestore } from './components/BackupRestore';
import { GeneralSettings } from './components/GeneralSettings';
import { Subscription } from './components/Subscription';
import { SuperadminPanel } from './components/SuperadminPanel';
import { Login } from './components/Login';
import { ItemMaster } from './components/ItemMaster';
import { VendorMaster } from './components/VendorMaster';
import { Home } from './components/Home';
import { SetupWizard } from './components/SetupWizard';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'superadmin' | null>(null);
  const [activeTenant, setActiveTenant] = useState<any>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [appRoute, setAppRoute] = useState<'home' | 'login' | 'signup' | 'app'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole') as 'admin' | 'superadmin' | null;
    const tab = localStorage.getItem('activeTab');
    
    if (authStatus === 'true' && role) {
      handleLogin(role, true);
      if (tab) {
        // Will be overwritten inside handleLogin if expired/needs setup, which is correct
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
        
        // Check if setup is needed
        if (tenant.setupCompleted === 0) {
          setNeedsSetup(true);
          setActiveTab('setup');
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
    setActiveTenant(null);
    setIsExpired(false);
    setActiveTab('dashboard');
    localStorage.removeItem('active_tenant');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('activeTab');
    setAppRoute('home');
  };

  const wrapTabSelection = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
    setIsMobileMenuOpen(false); // Close menu on mobile after selection
  };
  
  const setActiveTabSafe = isExpired ? () => {} : wrapTabSelection;

  if (appRoute === 'home') {
    return <Home onNavigation={(route) => setAppRoute(route)} />;
  }

  if (appRoute === 'login' || appRoute === 'signup') {
    // Note: We need to pass defaultIsSignUp to Login component
    return <Login onLogin={handleLogin} defaultIsSignUp={appRoute === 'signup'} onBackToHome={() => setAppRoute('home')} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTabSafe} // Disable tab-switching if expired 
        userRole={userRole} 
        onLogout={handleLogout} 
        isExpired={isExpired}
        tenant={activeTenant}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />
      
      <main className="flex-1 lg:ml-64 overflow-x-hidden flex flex-col min-h-screen relative">
        {/* Mobile Header Toolbar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight italic">iFast<span className="text-blue-600">X</span></span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen"
            >
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'item-master' && <ItemMaster />}
            {activeTab === 'vendor-master' && <VendorMaster />}
            {activeTab === 'invoice' && <InvoiceBuilder />}
            {activeTab === 'estimate' && <EstimateBuilder />}
            {activeTab === 'purchase' && <PurchaseBillBuilder />}
            {activeTab === 'credit-debit' && <CreditDebitNoteBuilder />}
            {activeTab === 'party-ledger' && <PartyLedger />}
            {activeTab === 'cashbook' && <Cashbook />}
            {activeTab === 'profit-loss' && <ProfitLoss />}
            {activeTab === 'balance-sheet' && <BalanceSheet />}
            {activeTab === 'stock-in-out' && <StockInOut />}
            {activeTab === 'low-stock-alert' && <LowStockAlert />}
            {activeTab === 'batch-expiry' && <BatchExpiry />}
            {activeTab === 'customer-history' && <CustomerHistory />}
            {activeTab === 'outstanding-payments' && <OutstandingPayments />}
            {activeTab === 'credit-limit' && <CreditLimit />}
            {activeTab === 'auto-reminder' && <AutoReminder />}
            {activeTab === 'gstr1-export' && <GSTR1Export />}
            {activeTab === 'backup-restore' && <BackupRestore />}
            {activeTab === 'settings' && <GeneralSettings />}
            {activeTab === 'subscription' && <Subscription />}
            {activeTab === 'superadmin' && <SuperadminPanel />}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
