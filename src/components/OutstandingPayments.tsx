import React, { useState } from 'react';
import { Search, Filter, Download, AlertCircle, MessageCircle, IndianRupee, X } from 'lucide-react';
import { API_URL } from '../config';

export function OutstandingPayments() {
  const [agingFilter, setAgingFilter] = useState('all');
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, id: -1, balance: 0, invoice: '' });
  const [paymentData, setPaymentData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'Online / Gateway', reference: '' });

  const [outstanding, setOutstanding] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
        const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');
        if (!activeTenant.id) return;

        const res = await fetch(`${API_URL}/api/invoices`, {
          headers: { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id }
        });
        if (res.ok) {
          const data = await res.json();
          const unpaid = data.filter((inv: any) => inv.status !== 'Paid' && inv.status !== 'Completed').map((inv: any) => {
            const dueDateStr = inv.dueDate || inv.date;
            const dueTime = new Date(dueDateStr).getTime();
            const daysOffset = Math.floor((Date.now() - dueTime) / (1000 * 3600 * 24));
            return {
              id: inv.id,
              customer: inv.customerData?.name || 'Walk-in',
              invoice: inv.invoiceNumber,
              date: inv.date,
              dueDate: dueDateStr,
              amount: inv.total,
              balance: inv.total,
              daysOverdue: daysOffset,
              phone: inv.customerData?.phone
            };
          });
          setOutstanding(unpaid);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleOpenPayment = (id: number, balance: number, invoice: string) => {
    setPaymentModal({ isOpen: true, id, balance, invoice });
    setPaymentData({ amount: balance.toString(), date: new Date().toISOString().split('T')[0], method: 'Online / Gateway', reference: '' });
  };

  const handleRecordPaymentSubmit = () => {
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0 || amount > paymentModal.balance) {
      alert(`Invalid amount. Must be greater than 0 and less than or equal to ₹${paymentModal.balance}`);
      return;
    }

    setOutstanding(prev => prev.map(item => {
      if (item.id === paymentModal.id) {
        return { ...item, balance: item.balance - amount };
      }
      return item;
    }).filter(item => item.balance > 0)); // Automatically remove if fully paid
    
    alert(`Payment of ₹${amount} recorded successfully for ${paymentModal.invoice}!\n\nDetails Recorded:\nDate: ${paymentData.date}\nMethod: ${paymentData.method}${paymentData.reference ? `\nRef: ${paymentData.reference}` : ''}`);
    setPaymentModal({ isOpen: false, id: -1, balance: 0, invoice: '' });
  };

  const handleBulkSend = () => {
    setIsSendingBulk(true);
    setTimeout(() => {
      setIsSendingBulk(false);
      alert('Successfully sent WhatsApp reminders to 3 overdue customers.');
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outstanding Payments</h1>
          <p className="text-slate-500">Track unpaid invoices and follow up with customers</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBulkSend}
            disabled={isSendingBulk}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm disabled:opacity-50"
          >
            {isSendingBulk ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <MessageCircle size={18} /> Send All Reminders
              </>
            )}
          </button>
          <button 
            onClick={() => alert('Exporting Outstanding Payments Report...')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* Aging Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Not Yet Due</p>
          <p className="text-xl font-bold text-slate-900">₹ 12,000</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/30">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">1 - 30 Days</p>
          <p className="text-xl font-bold text-amber-700">₹ 10,000</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm bg-orange-50/30">
          <p className="text-xs font-medium text-orange-600 uppercase tracking-wider mb-1">31 - 60 Days</p>
          <p className="text-xl font-bold text-orange-700">₹ 45,000</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/30">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">61 - 90 Days</p>
          <p className="text-xl font-bold text-rose-700">₹ 8,500</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-300 shadow-sm bg-rose-50">
          <p className="text-xs font-medium text-rose-700 uppercase tracking-wider mb-1">&gt; 90 Days</p>
          <p className="text-xl font-bold text-rose-800">₹ 0</p>
        </div>
      </div>

      {/* Outstanding Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search customer or invoice..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <select 
              value={agingFilter}
              onChange={(e) => setAgingFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="all">All Outstanding</option>
              <option value="overdue">Overdue Only</option>
              <option value="1-30">1 - 30 Days Overdue</option>
              <option value="31-60">31 - 60 Days Overdue</option>
              <option value=">60">&gt; 60 Days Overdue</option>
            </select>
          </div>
          <button 
            onClick={() => alert('Advanced filters coming soon')}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Filter size={18} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Invoice No.</th>
                <th className="p-4 font-medium">Due Date</th>
                <th className="p-4 font-medium text-right">Invoice Amount</th>
                <th className="p-4 font-medium text-right">Balance Due</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outstanding.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 font-medium text-slate-900">{item.customer}</td>
                  <td className="p-4 text-blue-600 hover:underline cursor-pointer">{item.invoice}</td>
                  <td className="p-4 text-slate-600">{item.dueDate}</td>
                  <td className="p-4 text-right text-slate-600">₹ {item.amount.toLocaleString()}</td>
                  <td className="p-4 text-right font-bold text-slate-900">₹ {item.balance.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    {item.daysOverdue > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        <AlertCircle size={12} /> {item.daysOverdue} Days Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Due in {Math.abs(item.daysOverdue)} Days
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => alert(`Sending WhatsApp reminder to ${item.customer} for ${item.invoice}`)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" 
                        title="Send WhatsApp Reminder"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenPayment(item.id, item.balance, item.invoice)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                        title="Record Payment"
                      >
                        <IndianRupee size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Record Payment - {paymentModal.invoice}</h3>
              <button onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (₹)</label>
                <input 
                  type="number" 
                  max={paymentModal.balance}
                  value={paymentData.amount} 
                  onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" 
                />
                <p className="text-xs text-slate-500 mt-1">Maximum due: ₹{paymentModal.balance.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                <input 
                  type="date" 
                  value={paymentData.date} 
                  onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select 
                  value={paymentData.method} 
                  onChange={e => setPaymentData({...paymentData, method: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                >
                  <option value="Online / Gateway">Online / Gateway</option>
                  <option value="Google Pay (GPay)">Google Pay (GPay)</option>
                  <option value="UPI">UPI (PhonePe, Paytm, etc)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference No. / UTR (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. UTR123456789"
                  value={paymentData.reference} 
                  onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" 
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRecordPaymentSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-600/20"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
