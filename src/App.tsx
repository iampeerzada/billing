import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { InvoiceBuilder } from './components/InvoiceBuilder';
import { EstimateBuilder } from './components/EstimateBuilder';
import { PurchaseBillBuilder } from './components/PurchaseBillBuilder';
import { CreditDebitNoteBuilder } from './components/CreditDebitNoteBuilder';
import { PartyLedger } from './components/PartyLedger';
import { Cashbook } from './components/Cashbook';
import { ProfitLoss } from './components/ProfitLoss';
import { BalanceSheet } from './components/BalanceSheet';
import { ItemMaster } from './components/ItemMaster';
import { StockInOut } from './components/StockInOut';
import { LowStockAlert } from './components/LowStockAlert';
import { BatchExpiry } from './components/BatchExpiry';
import { CustomerHistory } from './components/CustomerHistory';
import { VendorMaster } from './components/VendorMaster';
import { OutstandingPayments } from './components/OutstandingPayments';
import { CreditLimit } from './components/CreditLimit';
import { AutoReminder } from './components/AutoReminder';
import { GSTR1Export } from './components/GSTR1Export';
import { BackupRestore } from './components/BackupRestore';
import { GeneralSettings } from './components/GeneralSettings';
import { Subscription } from './components/Subscription';
import { SuperadminPanel } from './components/SuperadminPanel';
import { SetupWizard } from './components/SetupWizard';
import { InvoiceList } from './components/InvoiceList';
import { UserRole, AppRoute } from './types';
import { API_URL } from './config';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appRoute, setAppRoute] = useState<AppRoute>('login');
  const [activeTenant, setActiveTenant] = useState<any>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        
        // Session Isolation Initialization
        if (!localStorage.getItem('active_company')) {
          localStorage.setItem('active_company', JSON.stringify({ id: 'default', name: tenant.name }));
        }

        // Setup Check
        if (tenant.setupCompleted === 0 || tenant.setupCompleted === '0') {
          setNeedsSetup(true);
          setActiveTab('setup');
          return;
        } else {
          setNeedsSetup(false);
        }

        // Validity Check
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
    setAppRoute('login');
    setActiveTenant(null);
    localStorage.clear();
  };

  if (appRoute === 'login') {
    return <Login onLogin={handleLogin} onBackToHome={() => {}} />;
  }

  const renderContent = () => {
    if (needsSetup && activeTab !== 'setup') {
      setActiveTab('setup');
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'invoice': return <InvoiceBuilder onCancel={() => setActiveTab('dashboard')} type="invoice" />;
      case 'estimate': return <EstimateBuilder onCancel={() => setActiveTab('dashboard')} />;
      case 'purchase': return <PurchaseBillBuilder onCancel={() => setActiveTab('dashboard')} />;
      case 'credit-debit': return <CreditDebitNoteBuilder onCancel={() => setActiveTab('dashboard')} />;
      case 'party-ledger': return <PartyLedger />;
      case 'cashbook': return <Cashbook />;
      case 'profit-loss': return <ProfitLoss />;
      case 'balance-sheet': return <BalanceSheet />;
      case 'item-master': return <ItemMaster />;
      case 'stock-in-out': return <StockInOut />;
      case 'low-stock-alert': return <LowStockAlert />;
      case 'batch-expiry': return <BatchExpiry />;
      case 'customer-history': return <CustomerHistory />;
      case 'vendor-master': return <VendorMaster />;
      case 'outstanding-payments': return <OutstandingPayments />;
      case 'credit-limit': return <CreditLimit />;
      case 'auto-reminder': return <AutoReminder />;
      case 'gstr1-export': return <GSTR1Export />;
      case 'backup-restore': return <BackupRestore />;
      case 'settings': return <GeneralSettings />;
      case 'subscription': return <Subscription tenant={activeTenant} />;
      case 'superadmin': return <SuperadminPanel />;
      case 'setup': return <SetupWizard tenant={activeTenant} onComplete={() => {
        const updated = { ...activeTenant, setupCompleted: 1 };
        setActiveTenant(updated);
        localStorage.setItem('active_tenant', JSON.stringify(updated));
        setNeedsSetup(false);
        setActiveTab('dashboard');
      }} />;
      case 'all-invoices': return <InvoiceList onNewInvoice={() => setActiveTab('invoice')} />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          localStorage.setItem('activeTab', tab);
        }} 
        userRole={userRole}
        onLogout={handleLogout}
        isExpired={isExpired}
        tenant={activeTenant}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </main>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-transform active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
}
