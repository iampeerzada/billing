import React from 'react';
import { 
  ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, 
  MessageCircle, Globe, User, Package, IndianRupee, Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config';

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
}

export function Dashboard({ setActiveTab }: DashboardProps) {
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

        if (!activeTenant.id) return;

        const response = await fetch(`${API_URL}/api/invoices`, {
          headers: {
            'x-tenant-id': activeTenant.id,
            'x-company-id': activeCompany.id
          }
        });
        if (response.ok) {
          const data = await response.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalReceivable = invoices
    .filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  // Group invoices by date for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTotal = invoices
      .filter(inv => inv.date === date)
      .reduce((sum, inv) => sum + inv.total, 0);
    
    return {
      name: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      value: dayTotal
    };
  });

  return (
    <div className="p-4 sm:p-6 bg-slate-100 min-h-full space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-yellow-200 to-yellow-100 border border-yellow-300 rounded-md p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded inline-flex items-center gap-1 w-max">
            <span className="text-yellow-200">⚡</span> March End Sale
          </div>
          <span className="text-sm text-slate-800">
            <span className="font-bold">Upto 60% OFF</span> on New License <button onClick={() => setActiveTab && setActiveTab('subscription')} className="text-blue-600 hover:underline font-bold ml-1">Buy Now</button>
          </span>
        </div>
        <div className="text-sm text-red-600 font-bold bg-white/50 px-3 py-1 rounded-full w-max">
          Offer expires in 31:57 Hr
        </div>
      </div>

      {/* Login Status */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-200 text-blue-500 shadow-sm shrink-0">
          <User size={20} />
        </div>
        <span className="text-slate-700 font-medium text-sm sm:text-base">You are now logged in as Secondary Admin</span>
      </div>

      {/* Quick Actions (Simple UX) */}
      {setActiveTab && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('invoice')}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-slate-700 hover:text-blue-600 group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-bold text-sm">Create Invoice</span>
          </button>
          <button 
            onClick={() => setActiveTab('stock-in-out')}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 hover:text-emerald-600 group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Package size={24} />
            </div>
            <span className="font-bold text-sm">Add Stock</span>
          </button>
          <button 
            onClick={() => setActiveTab('outstanding-payments')}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-amber-500 hover:shadow-md transition-all text-slate-700 hover:text-amber-600 group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <IndianRupee size={24} />
            </div>
            <span className="font-bold text-sm">Record Payment</span>
          </button>
          <button 
            onClick={() => setActiveTab('party-ledger')}
            className="flex flex-col items-center justify-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-slate-700 hover:text-indigo-600 group"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <Users size={24} />
            </div>
            <span className="font-bold text-sm">View Ledger</span>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-500 font-bold tracking-wide uppercase text-xs">Total Receivable</span>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ArrowDown size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-800 mb-2">₹ {totalReceivable.toLocaleString('en-IN')}</div>
              <p className="text-sm text-slate-400 font-medium">
                {totalReceivable > 0 ? `You have ₹${totalReceivable.toLocaleString('en-IN')} to collect.` : "You don't have any receivables as of now."}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-500 font-bold tracking-wide uppercase text-xs">Total Payable</span>
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <ArrowUp size={20} />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-800 mb-2">₹ 0</div>
              <p className="text-sm text-slate-400 font-medium">You don't have any payables as of now.</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4">
              <div>
                <span className="text-slate-500 font-bold tracking-wide uppercase text-xs">Total Sale</span>
                <div className="text-3xl font-black text-slate-800 mt-1">₹ {totalSales.toLocaleString('en-IN')}</div>
              </div>
              <button 
                onClick={() => alert('Date filter coming soon!')}
                className="flex items-center justify-between sm:justify-start gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors w-full sm:w-auto"
              >
                Last 7 Days
                <ChevronDown size={16} />
              </button>
            </div>
            
            <div className="h-72 w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(value) => value === 0 ? '0' : value >= 1000 ? `${value / 1000}k` : value}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px', fontWeight: 'bold' }}
                      formatter={(value: number) => [`₹ ${value.toLocaleString('en-IN')}`, 'Sales']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Most Used Reports */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-slate-800 font-bold text-lg">Most Used Reports</h3>
              <button 
                onClick={() => alert('View All Reports coming soon')}
                className="text-blue-600 hover:underline text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Sale Report', 'All Transactions', 'Daybook Report', 'Party Statement'].map((report, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab && setActiveTab('invoice')}
                  className="flex items-center justify-between p-4 border border-slate-200 bg-slate-50 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all group shadow-sm hover:shadow-md"
                >
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">{report}</span>
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="w-full lg:w-80 space-y-6">
          {/* WhatsApp Widget */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <MessageCircle size={14} />
                </div>
                <span className="font-bold text-slate-800 text-sm">WhatsApp Connect</span>
              </div>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded">TRIAL EXPIRED</span>
            </div>
            <div className="flex items-start gap-2 mb-4">
              <div className="mt-1 text-slate-400">
                <Globe size={14} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Purchase your license to continue sending invoices, reminders, and using WhatsApp Smart Connect.
              </p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setActiveTab && setActiveTab('subscription')}
                className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                Buy Now <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Google Profile Widget */}
          <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-xs">G</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">Google Profile Manager</span>
              </div>
              <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded">TRIAL EXPIRED</span>
            </div>
            <div className="flex items-start gap-2 mb-4">
              <div className="mt-1 text-slate-400">
                <Globe size={14} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verified businesses on Google appear more trustworthy
              </p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setActiveTab && setActiveTab('subscription')}
                className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                Buy Now <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Add Widget Button */}
          <button 
            onClick={() => setActiveTab && setActiveTab('party-ledger')}
            className="w-full bg-white p-4 rounded-md border border-slate-200 border-dashed hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between text-slate-500 hover:text-blue-600"
          >
            <span className="text-sm font-medium">Add Widget of Your Choice</span>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
