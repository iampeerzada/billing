import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, Crown, ChevronDown, ChevronRight, Receipt, Calculator, Users, Wallet, TrendingUp, Scale, Package, AlertTriangle, Clock, History, IndianRupee, ShieldAlert, MessageCircle, FileJson, Cloud, Box, Building2, X } from 'lucide-react';
import { API_URL } from '../config';

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
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [planModules, setPlanModules] = useState<any>(null);

  const activeCompanyStr = localStorage.getItem('active_company');
  const activeCompany = activeCompanyStr ? JSON.parse(activeCompanyStr) : null;

  useEffect(() => {
     if (tenant?.id) {
       fetch(`${API_URL}/api/companies`, {
         headers: { 'x-tenant-id': tenant.id }
       })
         .then(res => res.json())
         .then(data => {
            if (data && Array.isArray(data)) {
               const staffStr = localStorage.getItem('active_staff');
               let allowedCompanies = data;
               if (staffStr) {
                 const staff = JSON.parse(staffStr);
                 allowedCompanies = data.filter((c: any) => c.id === staff.companyId);
               }
               setCompanies(allowedCompanies);
               
               if (activeCompany && allowedCompanies.some(c => c.id === activeCompany.id)) {
                 setSelectedCompanyId(activeCompany.id);
               } else if (allowedCompanies.length > 0) {
                 setSelectedCompanyId(allowedCompanies[0].id);
                 localStorage.setItem('active_company', JSON.stringify(allowedCompanies[0]));
                 window.dispatchEvent(new Event('storage'));
               }
            }
         }).catch(err => console.log('Error fetching companies', err));
     }

     if (tenant?.planId) {
        fetch(`${API_URL}/api/plans`)
          .then(res => res.json())
          .then(plans => {
             const plan = plans.find((p: any) => p.id === tenant.planId);
             if (plan) {
               if (plan.modules) setPlanModules(plan.modules);
               localStorage.setItem('active_plan', JSON.stringify(plan));
             }
          });
     }
  }, [tenant?.id, tenant?.planId]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    const comp = companies.find(c => c.id === cid);
    if (comp) {
      setSelectedCompanyId(comp.id);
      localStorage.setItem('active_company', JSON.stringify(comp));
      window.dispatchEvent(new Event('storage'));
      window.location.reload(); // Force reload to apply company context globally
    }
  };

  const billingItems = [
    ...(planModules?.invoice !== false ? [{ id: 'invoice', icon: FileText, label: 'Invoice Builder' }] : []),
    ...(planModules?.estimate !== false ? [{ id: 'estimate', icon: FileText, label: 'Estimate / Quotation' }] : []),
    ...(planModules?.purchase !== false ? [{ id: 'purchase', icon: FileText, label: 'Purchase Bill' }] : []),
    ...(planModules?.creditDebit !== false ? [{ id: 'credit-debit', icon: FileText, label: 'Credit / Debit Note' }] : []),
  ];

  const accountingItems = [
    ...(planModules?.partyLedger !== false ? [{ id: 'party-ledger', icon: Users, label: 'Party Ledger' }] : []),
    ...(planModules?.cashbook !== false ? [{ id: 'cashbook', icon: Wallet, label: 'Cashbook' }] : []),
    ...(planModules?.profitLoss !== false ? [{ id: 'profit-loss', icon: TrendingUp, label: 'Profit & Loss' }] : []),
    ...(planModules?.balanceSheet !== false ? [{ id: 'balance-sheet', icon: Scale, label: 'Balance Sheet' }] : [])
  ];

  const inventoryItems = [
    ...(planModules?.itemMaster !== false ? [{ id: 'item-master', icon: Box, label: 'Item Master' }] : []),
    ...(planModules?.stockInOut !== false ? [{ id: 'stock-in-out', icon: Package, label: 'Stock In / Out' }] : []),
    ...(planModules?.lowStock !== false ? [{ id: 'low-stock-alert', icon: AlertTriangle, label: 'Low Stock Alert' }] : []),
    ...(planModules?.batchExpiry !== false ? [{ id: 'batch-expiry', icon: Clock, label: 'Batch & Expiry' }] : []),
  ];

  const customerItems = [
    ...(planModules?.customerHistory !== false ? [{ id: 'customer-history', icon: History, label: 'Customer History' }] : []),
    ...(planModules?.outstanding !== false ? [{ id: 'outstanding-payments', icon: IndianRupee, label: 'Outstanding Payments' }] : []),
    ...(planModules?.creditLimit !== false ? [{ id: 'credit-limit', icon: ShieldAlert, label: 'Credit Limit' }] : []),
    ...(planModules?.autoReminder !== false ? [{ id: 'auto-reminder', icon: MessageCircle, label: 'Auto Reminder (WhatsApp)' }] : []),
    ...(planModules?.vendor !== false ? [{ id: 'vendor-master', icon: Building2, label: 'Registered Vendors' }] : []),
  ];

  const taxItems = [
    ...(planModules?.gstr1 !== false ? [{ id: 'gstr1-export', icon: FileJson, label: 'GSTR-1' }] : []),
    ...(planModules?.gstr3b !== false ? [{ id: 'gstr3b-report', icon: FileJson, label: 'GSTR-3B' }] : []),
    ...(planModules?.gstr2b !== false ? [{ id: 'gstr2b-report', icon: FileJson, label: 'GSTR-2B' }] : []),
    ...(planModules?.gstr2a !== false ? [{ id: 'gstr2a-report', icon: FileJson, label: 'GSTR-2A' }] : []),
    ...(planModules?.gstr9 !== false ? [{ id: 'gstr9-report', icon: FileJson, label: 'GSTR-9' }] : []),
    ...(planModules?.gstr9c !== false ? [{ id: 'gstr9c-report', icon: FileJson, label: 'GSTR-9C' }] : [])
  ];

  const settingsItems = [
    ...(planModules?.backupRestore !== false ? [{ id: 'backup-restore', icon: Cloud, label: 'Data & Auto Backup' }] : []),
    ...(planModules?.settings !== false ? [{ id: 'settings', icon: Settings, label: 'General Settings' }] : []),
    ...(planModules?.staffLogs !== false ? [{ id: 'staff-logs', icon: Users, label: 'Staff & Logs' }] : []),
    ...(planModules?.subscription !== false ? [{ id: 'subscription', icon: Crown, label: 'Subscription Plan' }] : []),
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                  <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="2" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight italic">iFastX</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 tracking-wider mt-1 uppercase">GST Billing Platform</span>
          </div>
          
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            onClick={() => setIsMobileOpen?.(false)}
          >
            <X size={24} />
          </button>
        </div>

        {companies.length > 0 && (
          <div className="mx-4 mt-4 p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
               <Building2 size={16} className="text-blue-500 shrink-0" />
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Company</span>
            </div>
            <select 
              value={selectedCompanyId} 
              onChange={handleCompanyChange}
              className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 outline-none focus:border-blue-500"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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

      <div className="p-3 border-t border-slate-800">
        {tenant && (
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Crown size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tenant.planId === '1' ? 'Starter' : tenant.planId === '2' ? 'Pro' : 'Enterprise'}</span>
            </div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] text-slate-400">Status</span>
              <span className={`text-[10px] font-medium ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>{isExpired ? 'Expired' : 'Active'}</span>
            </div>
            <p className="text-[9px] text-slate-500 truncate mt-0.5">Valid till: {tenant.validTill}</p>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors text-sm"
        >
          <LogOut size={16} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
    </>
  );
}
