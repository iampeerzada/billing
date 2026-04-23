import React, { useState, useEffect } from 'react';
import { Download, Printer, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

export function ProfitLoss() {
  const [dateRange, setDateRange] = useState('this-year');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sales: true,
    cogs: true,
    expenses: true,
  });

  const [financials, setFinancials] = useState({
    sales: 0,
    cogs: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0
  });

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;

        const headers = { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id };
        
        const [invRes, purRes] = await Promise.all([
          fetch(`${API_URL}/api/invoices`, { headers }),
          fetch(`${API_URL}/api/purchases`, { headers })
        ]);

        let totalSales = 0;
        if (invRes.ok) {
          const invoices = await invRes.json();
          totalSales = invoices.reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);
        }

        let totalPurchases = 0;
        if (purRes.ok) {
          const purchases = await purRes.json();
          totalPurchases = purchases.reduce((sum: number, pur: any) => sum + Number(pur.total || 0), 0);
        }

        const grossProfit = totalSales - totalPurchases;
        const expenses = 0; // Will fetch from expenses table once available
        const netProfit = grossProfit - expenses;

        setFinancials({
          sales: totalSales,
          cogs: totalPurchases,
          grossProfit,
          expenses,
          netProfit
        });

      } catch (err) {
        console.error("Failed to fetch financials", err);
      }
    };
    
    fetchFinancials();
  }, [dateRange]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportCSV = () => {
    const csvContent = "Account Name,Amount (RS)\n" +
      `Sales Accounts (Income),${financials.sales}\n` +
      `Cost of Goods Sold (Direct Expenses),${financials.cogs}\n` +
      `Gross Profit,${financials.grossProfit}\n` +
      `Indirect Expenses,${financials.expenses}\n` +
      `Net Profit,${financials.netProfit}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profit_loss.csv`;
    link.click();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profit & Loss Statement</h1>
          <p className="text-slate-500">Income and expenses summary for your business</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
          >
            <option value="this-month">This Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Financial Year</option>
            <option value="last-year">Last Financial Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Statement of Profit and Loss</h2>
          <p className="text-sm text-slate-500">For the period: 01-Apr-2023 to 31-Mar-2024</p>
        </div>

        <div className="p-0">
          {/* Trading Account / Gross Profit */}
          <div className="border-b border-slate-200">
            {/* Sales / Income */}
            <div className="bg-emerald-50/50">
              <button 
                onClick={() => toggleSection('sales')}
                className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {expandedSections.sales ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Sales Accounts (Income)
                </div>
                <div className="font-bold text-emerald-600">₹ {financials.sales.toLocaleString('en-IN')}</div>
              </button>
              
              {expandedSections.sales && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                  Sales: ₹ {financials.sales.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Cost of Goods Sold / Direct Expenses */}
            <div className="bg-rose-50/50 border-t border-slate-100">
              <button 
                onClick={() => toggleSection('cogs')}
                className="w-full flex items-center justify-between p-4 hover:bg-rose-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {expandedSections.cogs ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Cost of Goods Sold (Direct Expenses)
                </div>
                <div className="font-bold text-rose-600">₹ {financials.cogs.toLocaleString('en-IN')}</div>
              </button>
              
              {expandedSections.cogs && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                  Purchases: ₹ {financials.cogs.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center p-4 bg-slate-100 font-bold text-lg border-t border-slate-200">
              <span className="text-slate-800">Gross Profit</span>
              <span className="text-blue-600">₹ {financials.grossProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Indirect Expenses */}
          <div className="bg-orange-50/30">
            <button 
              onClick={() => toggleSection('expenses')}
              className="w-full flex items-center justify-between p-4 hover:bg-orange-50/50 transition-colors"
            >
              <div className="flex items-center gap-2 font-bold text-slate-800">
                {expandedSections.expenses ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                Indirect Expenses
              </div>
              <div className="font-bold text-rose-600">₹ {financials.expenses.toLocaleString('en-IN')}</div>
            </button>
            
            {expandedSections.expenses && (
              <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                 No data available for the selected period.
              </div>
            )}
          </div>

          {/* Net Profit */}
          <div className="flex justify-between items-center p-6 bg-slate-800 text-white font-bold text-xl rounded-b-xl">
            <span>Net Profit</span>
            <span className="text-emerald-400">₹ {financials.netProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
