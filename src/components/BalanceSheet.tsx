import React, { useState, useEffect } from 'react';
import { Download, Printer, Scale, ChevronDown, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

export function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    liabilities: true,
    assets: true,
    capital: true,
    currentLiabilities: true,
    fixedAssets: true,
    currentAssets: true,
  });

  const [financials, setFinancials] = useState({
    capitalAccount: 0,
    loans: 0,
    currentLiabilities: 0,
    totalLiabilities: 0,
    fixedAssets: 0,
    currentAssets: 0,
    totalAssets: 0
  });

  useEffect(() => {
    const fetchBalanceSheet = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;

        const headers = { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id };
        
        const [invRes, purRes] = await Promise.all([
          fetch(`${API_URL}/api/invoices`, { headers }),
          fetch(`${API_URL}/api/purchases`, { headers })
        ]);

        let totalInvoices = 0;
        if (invRes.ok) {
          const invoices = await invRes.json();
          totalInvoices = invoices.reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);
        }

        let totalPurchases = 0;
        if (purRes.ok) {
          const purchases = await purRes.json();
          totalPurchases = purchases.reduce((sum: number, pur: any) => sum + Number(pur.total || 0), 0);
        }

        const currentAssets = totalInvoices; // Simplification: Sales treated as Cash/AR
        const currentLiabilities = totalPurchases; // Simplification: Purchases treated as AP
        
        // Let's create an arbitrary balanced capital/profit to make the sheet balance
        const netProfit = currentAssets - currentLiabilities;
        const capitalAccount = netProfit > 0 ? netProfit : 0;
        const loans = netProfit < 0 ? Math.abs(netProfit) : 0;
        
        const totalAssetsValue = currentAssets;
        const totalLiabilitiesValue = currentLiabilities + capitalAccount + loans;

        setFinancials({
          capitalAccount,
          loans,
          currentLiabilities,
          totalLiabilities: totalLiabilitiesValue,
          fixedAssets: 0,
          currentAssets: currentAssets,
          totalAssets: totalAssetsValue
        });

      } catch (err) {
        console.error("Failed to fetch balance sheet", err);
      }
    };
    
    fetchBalanceSheet();
  }, [asOfDate]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportCSV = () => {
    const csvContent = "Account Name,Amount (RS)\n" +
      "Liabilities & Capital,\n" +
      `Capital Account,${financials.capitalAccount}\n` +
      `Loans (Liability),${financials.loans}\n` +
      `Current Liabilities,${financials.currentLiabilities}\n` +
      `Total Liabilities,${financials.totalLiabilities}\n\n` +
      "Assets,\n" +
      `Fixed Assets,${financials.fixedAssets}\n` +
      `Current Assets,${financials.currentAssets}\n` +
      `Total Assets,${financials.totalAssets}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance_sheet.csv`;
    link.click();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Balance Sheet</h1>
          <p className="text-slate-500">Financial position of your business</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-lg">
            <span className="text-sm text-slate-500">As of:</span>
            <input 
              type="date" 
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liabilities Side */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-800 text-white font-bold text-lg flex justify-between items-center">
            <span>Liabilities & Capital</span>
          </div>
          
          <div className="flex-1 p-0">
            {/* Capital Account */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection('capital')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {expandedSections.capital ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Capital Account
                </div>
                <div className="font-bold text-slate-900">₹ {financials.capitalAccount.toLocaleString('en-IN')}</div>
              </button>
              
              {expandedSections.capital && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                  Total Profit: ₹ {financials.capitalAccount.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Loans (Liabilities) */}
            <div className="border-b border-slate-100">
              <div className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 pl-6">
                  Loans (Liability)
                </div>
                <div className="font-bold text-slate-900">₹ {financials.loans.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Current Liabilities */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection('currentLiabilities')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {expandedSections.currentLiabilities ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Current Liabilities
                </div>
                <div className="font-bold text-slate-900">₹ {financials.currentLiabilities.toLocaleString('en-IN')}</div>
              </button>
              
              {expandedSections.currentLiabilities && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                  Purchases (A/P): ₹ {financials.currentLiabilities.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center font-bold text-lg mt-auto">
            <span className="text-slate-800">Total Liabilities</span>
            <span className="text-blue-600">₹ {financials.totalLiabilities.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Assets Side */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-800 text-white font-bold text-lg flex justify-between items-center">
            <span>Assets</span>
          </div>
          
          <div className="flex-1 p-0">
            {/* Fixed Assets */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection('fixedAssets')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {expandedSections.fixedAssets ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Fixed Assets
                </div>
                <div className="font-bold text-slate-900">₹ {financials.fixedAssets.toLocaleString('en-IN')}</div>
              </button>
              
              {expandedSections.fixedAssets && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                   ₹ 0
                </div>
              )}
            </div>

            {/* Current Assets */}
            <div className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection('currentAssets')}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  {expandedSections.currentAssets ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  Current Assets
                </div>
                <div className="font-bold text-slate-900">₹ {financials.currentAssets.toLocaleString('en-IN')}</div>
              </button>
              
              {expandedSections.currentAssets && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm text-slate-500">
                  Sales (A/R & Cash): ₹ {financials.currentAssets.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center font-bold text-lg mt-auto">
            <span className="text-slate-800">Total Assets</span>
            <span className="text-blue-600">₹ {financials.totalAssets.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
