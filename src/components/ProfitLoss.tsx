import React, { useState } from 'react';
import { Download, Printer, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';

export function ProfitLoss() {
  const [dateRange, setDateRange] = useState('this-year');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sales: true,
    cogs: true,
    expenses: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportCSV = () => {
    const csvContent = "Account Name,Amount (RS)\n" +
      "Sales Accounts (Income),2450000\n" +
      "Cost of Goods Sold (Direct Expenses),1220000\n" +
      "Gross Profit,1230000\n" +
      "Indirect Expenses,480000\n" +
      "Net Profit,750000\n";

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
                <div className="font-bold text-emerald-600">₹ 24,50,000</div>
              </button>
              
              {expandedSections.sales && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Sales - Product A</span>
                    <span>₹ 15,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Sales - Product B</span>
                    <span>₹ 8,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Service Revenue</span>
                    <span>₹ 1,50,000</span>
                  </div>
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
                <div className="font-bold text-rose-600">₹ 12,20,000</div>
              </button>
              
              {expandedSections.cogs && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Opening Stock</span>
                    <span>₹ 2,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Purchases</span>
                    <span>₹ 14,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Direct Labour</span>
                    <span>₹ 1,20,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1 font-medium">
                    <span>Less: Closing Stock</span>
                    <span>(₹ 5,00,000)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between items-center p-4 bg-slate-100 font-bold text-lg border-t border-slate-200">
              <span className="text-slate-800">Gross Profit</span>
              <span className="text-blue-600">₹ 12,30,000</span>
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
              <div className="font-bold text-rose-600">₹ 4,80,000</div>
            </button>
            
            {expandedSections.expenses && (
              <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Salaries & Wages</span>
                  <span>₹ 2,50,000</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Rent</span>
                  <span>₹ 1,20,000</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Electricity & Utilities</span>
                  <span>₹ 45,000</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Marketing & Advertising</span>
                  <span>₹ 35,000</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Office Supplies</span>
                  <span>₹ 15,000</span>
                </div>
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Bank Charges</span>
                  <span>₹ 15,000</span>
                </div>
              </div>
            )}
          </div>

          {/* Net Profit */}
          <div className="flex justify-between items-center p-6 bg-slate-800 text-white font-bold text-xl rounded-b-xl">
            <span>Net Profit</span>
            <span className="text-emerald-400">₹ 7,50,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
