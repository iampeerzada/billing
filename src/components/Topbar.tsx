import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, Settings, Users, Building2, Menu, Receipt, ShoppingCart, FileText, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

interface TopbarProps {
  setActiveTab?: (tab: string) => void;
  setIsMobileOpen?: (open: boolean) => void;
}

export function Topbar({ setActiveTab, setIsMobileOpen }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
    const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

    if (!searchQuery.trim() || !activeTenant.id) {
      setResults([]);
      return;
    }

    const fetchSearch = async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const headers = {
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        };
        const [invRes, purRes, estRes] = await Promise.all([
          fetch(`${API_URL}/api/invoices`, { headers }),
          fetch(`${API_URL}/api/purchases`, { headers }),
          fetch(`${API_URL}/api/estimates`, { headers })
        ]);

        let combined: any[] = [];
        if (invRes.ok) {
          const data = await invRes.json();
          combined = [...combined, ...data.map((d: any) => ({ ...d, typeSearch: 'invoice', collection: 'Sales' }))];
        }
        if (purRes.ok) {
          const data = await purRes.json();
          combined = [...combined, ...data.map((d: any) => ({ ...d, typeSearch: 'purchase', collection: 'Purchases' }))];
        }
        if (estRes.ok) {
          const data = await estRes.json();
          combined = [...combined, ...data.map((d: any) => ({ ...d, typeSearch: 'estimate', collection: 'Estimates' }))];
        }

        const q = searchQuery.toLowerCase();
        const filtered = combined.filter((item) => 
          (item.invoiceNumber || item.estimateNumber || item.billNumber || '').toLowerCase().includes(q) ||
          (item.customerData?.name || item.vendorData?.name || '').toLowerCase().includes(q) ||
          (item.total && item.total.toString().includes(q))
        ).slice(0, 5); // Limit to 5 results

        setResults(filtered);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayTimer = setTimeout(() => {
      fetchSearch();
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [searchQuery]);

  const handleResultClick = (item: any) => {
    setShowDropdown(false);
    setSearchQuery('');
    if (!setActiveTab) return;
    
    // Set active tab based on what they clicked, or we can just redirect to list view. The invoice list viewer requires "setActiveTab" logic.
    // Currently, there isn't a direct "view particular invoice" from Topbar.
    // So we can set editing localstorage and redirect.
    localStorage.setItem('edit_invoice_id', item.id);
    if (item.typeSearch === 'invoice') setActiveTab('invoice');
    else if (item.typeSearch === 'purchase') setActiveTab('purchase');
    else if (item.typeSearch === 'estimate') setActiveTab('estimate');
  };

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center flex-1 gap-3">
        <button 
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsMobileOpen?.(true)}
        >
          <Menu size={20} />
        </button>
        <div className="relative w-64 hidden sm:block" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Transactions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchQuery.trim() && results.length > 0) setShowDropdown(true); }}
            className="w-full pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {showDropdown && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden py-1 z-50 max-h-[300px] overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-slate-500 flex justify-center">Searching...</div>
              ) : results.length > 0 ? (
                results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleResultClick(item)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${item.typeSearch === 'invoice' ? 'bg-blue-100 text-blue-600' : item.typeSearch === 'purchase' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {item.typeSearch === 'invoice' ? <Receipt size={14} /> : item.typeSearch === 'purchase' ? <ShoppingCart size={14} /> : <FileText size={14} />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{item.invoiceNumber || item.estimateNumber || item.billNumber || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{item.customerData?.name || item.vendorData?.name || 'Unknown Party'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-700">₹{item.total || 0}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{item.typeSearch}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 flex justify-center">No results found</div>
              )}
            </div>
          )}
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
          onClick={() => { localStorage.removeItem('edit_invoice_id'); setActiveTab && setActiveTab('invoice'); }}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-full text-xs sm:text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Sale</span>
          <span className="sm:hidden">Sale</span>
        </button>
        <button 
          onClick={() => { localStorage.removeItem('edit_invoice_id'); setActiveTab && setActiveTab('purchase'); }}
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
