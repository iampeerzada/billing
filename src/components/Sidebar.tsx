import React, { useState } from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Crown, ChevronDown, ChevronRight, Receipt, Calculator, Users, Wallet, TrendingUp, Scale, Package, AlertTriangle, Clock, History, IndianRupee, ShieldAlert, MessageCircle, FileJson, Cloud, Box, Building2, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: 'admin' | 'superadmin' | null;
  onLogout?: () => void;
  isExpired?: boolean;
  tenant?: any;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, userRole, onLogout, isExpired, tenant, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isBillingOpen, setIsBillingOpen] = useState(true);
  const [isAccountingOpen, setIsAccountingOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isTaxOpen, setIsTaxOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeCompanyStr = localStorage.getItem('active_company');
  const activeCompany = activeCompanyStr ? JSON.parse(activeCompanyStr) : null;

  const billingItems = [
    { id: 'invoice', icon: FileText, label: 'Invoice Builder' },
    { id: 'estimate', icon: FileText, label: 'Estimate / Quotation' },
    { id: 'purchase', icon: FileText, label: 'Purchase Bill' },
    { id: 'credit-debit', icon: FileText, label: 'Credit / Debit Note' },
  ];

  const accountingItems = [
    { id: 'party-ledger', icon: Users, label: 'Party Ledger' },
    { id: 'cashbook', icon: Wallet, label: 'Cashbook' },
    { id: 'profit-loss', icon: TrendingUp, label: 'Profit & Loss' },
    { id: 'balance-sheet', icon: Scale, label: 'Balance Sheet' },
  ];

  const inventoryItems = [
    { id: 'item-master', icon: Box, label: 'Item Master' },
    { id: 'stock-in-out', icon: Package, label: 'Stock In / Out' },
    { id: 'low-stock-alert', icon: AlertTriangle, label: 'Low Stock Alert' },
    { id: 'batch-expiry', icon: Clock, label: 'Batch & Expiry' },
  ];

  const customerItems = [
    { id: 'customer-history', icon: History, label: 'Customer History' },
    { id: 'vendor-master', icon: Building2, label: 'Registered Vendors' },
    { id: 'outstanding-payments', icon: IndianRupee, label: 'Outstanding Payments' },
    { id: 'credit-limit', icon: ShieldAlert, label: 'Credit Limit' },
    { id: 'auto-reminder', icon: MessageCircle, label: 'Auto Reminder (WhatsApp)' },
  ];

  const taxItems = [
    { id: 'gstr1-export', icon: FileJson, label: 'GSTR-1 Export' },
  ];

  const settingsItems = [
    { id: 'backup-restore', icon: Cloud, label: 'Data & Auto Backup' },
    { id: 'settings', icon: Settings, label: 'General Settings' },
    { id: 'subscription', icon: Crown, label: 'Subscription Plan' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={`w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 no-print z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight italic">iFastX</span>
            </div>
            <span className="text-xs font-bold text-slate-300 tracking-wider mt-1 uppercase">GST Billing Platform</span>
          </div>
          
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            onClick={() => setIsMobileOpen?.(false)}
          >
            <X size={24} />
          </button>
        </div>

        {activeCompany && (
          <div className="mx-4 mt-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 group hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => setActiveTab('settings')}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Building2 size={16} className="text-blue-500 shrink-0" />
                <span className="text-xs font-black text-white truncate italic uppercase tracking-wider">{activeCompany.name}</span>
              </div>
              <Settings size={12} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {isExpired && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm font-bold flex items-start gap-2">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p>Your Trial/Plan has expired.</p>
              <p className="text-xs text-rose-500 font-medium">Please purchase a plan to continue.</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setActiveTab('dashboard')}
          disabled={isExpired}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
              : isExpired ? 'text-slate-500 opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </button>

        <div>
          <button
            onClick={() => setIsBillingOpen(!isBillingOpen)}
            disabled={isExpired}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Receipt size={20} />
              <span className="font-medium">Billing</span>
            </div>
            {isBillingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isBillingOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
              {billingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setIsAccountingOpen(!isAccountingOpen)}
            disabled={isExpired}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Calculator size={20} />
              <span className="font-medium">Accounting System</span>
            </div>
            {isAccountingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isAccountingOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
              {accountingItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
            disabled={isExpired}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Package size={20} />
              <span className="font-medium">Inventory Management</span>
            </div>
            {isInventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isInventoryOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
              {inventoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setIsCustomerOpen(!isCustomerOpen)}
            disabled={isExpired}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              <span className="font-medium">Customer Management</span>
            </div>
            {isCustomerOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isCustomerOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
              {customerItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setIsTaxOpen(!isTaxOpen)}
            disabled={isExpired}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isExpired ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <FileJson size={20} />
              <span className="font-medium">Tax & Compliance</span>
            </div>
            {isTaxOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isTaxOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
              {taxItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 hover:bg-slate-800 hover:text-white`}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </div>
            {isSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isSettingsOpen && (
            <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
              {settingsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  disabled={isExpired && item.id !== 'subscription'}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 font-medium'
                      : isExpired && item.id !== 'subscription' ? 'text-slate-500 opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {userRole === 'superadmin' && (
          <div className="mt-8 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('superadmin')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border border-slate-700/50 ${
                activeTab === 'superadmin'
                  ? 'bg-rose-900/50 text-rose-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} />
                <span>Superadmin</span>
              </div>
            </button>
          </div>
        )}

      </nav>

      <div className="p-4 border-t border-slate-800">
        {tenant && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Crown size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{tenant.planId === '1' ? 'Starter' : tenant.planId === '2' ? 'Pro' : 'Enterprise'}</span>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-slate-400">Status</span>
              <span className={`text-sm font-medium ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>{isExpired ? 'Expired' : 'Active'}</span>
            </div>
            <p className="text-xs text-slate-500">Valid till: {tenant.validTill}</p>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
    </>
  );
}
