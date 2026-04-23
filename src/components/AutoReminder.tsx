import React, { useState } from 'react';
import { MessageCircle, Settings, Clock, Check, Power, AlertCircle } from 'lucide-react';

export function AutoReminder() {
  const [isAutoReminderEnabled, setIsAutoReminderEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const handleRunAutomation = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      alert('Automation completed! Sent 12 reminders to overdue customers.');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auto Reminders (WhatsApp)</h1>
          <p className="text-slate-500">Configure automated payment reminders for your customers</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRunAutomation}
            disabled={isSending || !isAutoReminderEnabled}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="animate-pulse">Sending...</span>
            ) : (
              <>
                <MessageCircle size={18} />
                Run Automation Now
              </>
            )}
          </button>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${isAutoReminderEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isAutoReminderEnabled ? 'Active' : 'Paused'}
            </span>
            <button 
              onClick={() => setIsAutoReminderEnabled(!isAutoReminderEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoReminderEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoReminderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {!isAutoReminderEnabled && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold">Auto Reminders are currently paused.</h3>
            <p className="text-sm mt-1">Customers will not receive automatic WhatsApp messages for their outstanding payments until you reactivate this feature.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Settings size={18} className="text-slate-600" />
              <h2 className="font-bold text-slate-800">Reminder Schedule & Templates</h2>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Before Due Date */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <span className="font-medium text-slate-800">Before Due Date</span>
                  </div>
                  <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none">
                    <option>3 Days Before</option>
                    <option>5 Days Before</option>
                    <option>7 Days Before</option>
                  </select>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 font-mono">
                  "Hi [Customer Name], this is a gentle reminder that your invoice [Invoice No] for ₹[Amount] is due on [Due Date]. Thank you!"
                </div>
              </div>

              {/* On Due Date */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <span className="font-medium text-slate-800">On Due Date</span>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 font-mono">
                  "Hi [Customer Name], your invoice [Invoice No] for ₹[Amount] is due today. Please arrange the payment. Thank you!"
                </div>
              </div>

              {/* Overdue */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                    <span className="font-medium text-slate-800">Overdue Reminders</span>
                  </div>
                  <select className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none">
                    <option>Every 3 Days</option>
                    <option>Every 5 Days</option>
                    <option>Every 7 Days</option>
                  </select>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600 font-mono">
                  "URGENT: Hi [Customer Name], your invoice [Invoice No] for ₹[Amount] is overdue by [Days] days. Please process the payment immediately to avoid late fees."
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => alert('Settings saved successfully!')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Status & Logs */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-6 bg-emerald-50/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">WhatsApp Status</p>
                <p className="font-bold text-emerald-700">Connected</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Number: +91 98765 43210</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Clock size={18} className="text-slate-600" />
              <h3 className="font-bold text-slate-800">Recent Logs</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 flex items-start gap-3">
                <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Sent to Global Enterprises</p>
                  <p className="text-xs text-slate-500">Overdue Reminder • Today, 10:00 AM</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3">
                <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Sent to Tech Solutions Ltd</p>
                  <p className="text-xs text-slate-500">Due Today • Today, 09:30 AM</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3">
                <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Sent to Local Retailers</p>
                  <p className="text-xs text-slate-500">Before Due • Yesterday, 11:15 AM</p>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 text-center">
              <button 
                onClick={() => alert('View All Logs coming soon')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
