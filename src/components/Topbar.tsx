import React from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';

interface TopbarProps {
  setActiveTab?: (tab: string) => void;
}

export function Topbar({ setActiveTab }: TopbarProps) {
  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Transactions" 
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActiveTab && setActiveTab('invoice')}
          className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Sale
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('purchase')}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Purchase
        </button>
        <button 
          onClick={() => setActiveTab && setActiveTab('settings')}
          className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
        >
          <Plus size={18} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
