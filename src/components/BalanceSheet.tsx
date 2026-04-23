import React, { useState } from 'react';
import { Download, Printer, Scale, ChevronDown, ChevronRight } from 'lucide-react';

export function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState('2024-03-31');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    liabilities: true,
    assets: true,
    capital: true,
    currentLiabilities: true,
    fixedAssets: true,
    currentAssets: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportCSV = () => {
    const csvContent = "Account Name,Amount (RS)\n" +
      "Liabilities & Capital,\n" +
      "Capital Account,1550000\n" +
      "Loans (Liability),500000\n" +
      "Current Liabilities,380000\n" +
      "Total Liabilities,2430000\n\n" +
      "Assets,\n" +
      "Fixed Assets,850000\n" +
      "Current Assets,1580000\n" +
      "Total Assets,2430000\n";

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
                <div className="font-bold text-slate-900">₹ 15,50,000</div>
              </button>
              
              {expandedSections.capital && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Opening Balance</span>
                    <span>₹ 10,00,000</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 py-1 font-medium">
                    <span>Add: Net Profit</span>
                    <span>₹ 7,50,000</span>
                  </div>
                  <div className="flex justify-between text-rose-600 py-1 font-medium">
                    <span>Less: Drawings</span>
                    <span>(₹ 2,00,000)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Loans (Liabilities) */}
            <div className="border-b border-slate-100">
              <div className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-2 font-bold text-slate-800 pl-6">
                  Loans (Liability)
                </div>
                <div className="font-bold text-slate-900">₹ 5,00,000</div>
              </div>
              <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 py-1">
                  <span>Bank Loan (HDFC)</span>
                  <span>₹ 5,00,000</span>
                </div>
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
                <div className="font-bold text-slate-900">₹ 3,80,000</div>
              </button>
              
              {expandedSections.currentLiabilities && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Sundry Creditors (Suppliers)</span>
                    <span>₹ 2,50,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Duties & Taxes (GST Payable)</span>
                    <span>₹ 85,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Provisions (Audit Fees)</span>
                    <span>₹ 45,000</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center font-bold text-lg mt-auto">
            <span className="text-slate-800">Total Liabilities</span>
            <span className="text-blue-600">₹ 24,30,000</span>
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
                <div className="font-bold text-slate-900">₹ 8,50,000</div>
              </button>
              
              {expandedSections.fixedAssets && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Computers & Equipment</span>
                    <span>₹ 3,50,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Furniture & Fixtures</span>
                    <span>₹ 2,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Vehicles</span>
                    <span>₹ 3,00,000</span>
                  </div>
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
                <div className="font-bold text-slate-900">₹ 15,80,000</div>
              </button>
              
              {expandedSections.currentAssets && (
                <div className="pl-10 pr-4 pb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Closing Stock</span>
                    <span>₹ 5,00,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Sundry Debtors (Customers)</span>
                    <span>₹ 8,50,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Cash-in-Hand</span>
                    <span>₹ 45,000</span>
                  </div>
                  <div className="flex justify-between text-slate-600 py-1">
                    <span>Bank Accounts</span>
                    <span>₹ 1,85,000</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between items-center font-bold text-lg mt-auto">
            <span className="text-slate-800">Total Assets</span>
            <span className="text-blue-600">₹ 24,30,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
