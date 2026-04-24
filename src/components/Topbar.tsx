import React from 'react';
import { Search, Plus, MoreVertical, Settings, Users, Building2, Menu } from 'lucide-react';

interface TopbarProps {
  setActiveTab?: (tab: string) => void;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Topbar({ setActiveTab, setIsMobileOpen }: TopbarProps) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center flex-1 gap-3">
        <button 
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsMobileOpen?.(true)}
        >
          <Menu size={20} />
        </button>
        <div className="relative w-64 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Transactions" 
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={() => setActiveTab && setActiveTab('customer-history')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold transition-colors"
        >
          <Users size={14} /> Add Customer
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('vendor-master')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold transition-colors"
        >
          <Building2 size={14} /> Add Vendor
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('invoice')}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs sm:text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Sale</span>
          <span className="sm:hidden">Sale</span>
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('purchase')}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-xs sm:text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Purchase</span>
          <span className="sm:hidden">Purchase</span>
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('settings')}
          className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}
