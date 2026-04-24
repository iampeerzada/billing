import React, { useState, useEffect } from 'react';
import { Users, Activity, Plus, Shield } from 'lucide-react';
import { API_URL } from '../config';

export function StaffLogs() {
  const [activeTab, setActiveTab] = useState<'staff'|'logs'>('staff');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [logsList, setLogsList] = useState<any[]>([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', loginId: '', password: '' });

  const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
  const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{}');
  const activeStaff = JSON.parse(localStorage.getItem('active_staff') || 'null');

  const headers = { 'x-tenant-id': activeTenant.id || '', 'x-company-id': activeCompany.id || '' };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/api/staff`, { headers });
      if (res.ok) setStaffList(await res.json());
    } catch(e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/activity_logs`, { headers });
      if (res.ok) setLogsList(await res.json());
    } catch(e) {}
  };

  useEffect(() => {
    if (activeTenant.id && activeCompany.id) {
       fetchStaff();
       fetchLogs();
    }
  }, [activeTenant.id, activeCompany.id]);

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.loginId || !newStaff.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/staff`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'staff_' + Date.now(),
          ...newStaff,
          role: 'staff'
        })
      });
      if (res.ok) {
        setIsAdding(false);
        setNewStaff({ name: '', loginId: '', password: '' });
        fetchStaff();
        alert("Staff created successfully");
      } else {
        alert("Failed to create staff");
      }
    } catch(e) {
      alert("Error saving staff");
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/staff/${id}`, { method: 'DELETE', headers });
      if (res.ok) fetchStaff();
    } catch(e) {}
  };

  if (activeStaff) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
         <Shield size={48} className="text-slate-300 mb-4" />
         <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
         <p className="text-slate-500 mt-2">Staff accounts are not authorized to view the Staff & Logs panel.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff & Logs</h1>
          <p className="text-slate-500">Manage staff access for {activeCompany.name || 'this company'} and view activity.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button 
          className={`pb-3 px-4 font-bold border-b-2 flex gap-2 items-center ${activeTab === 'staff' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
          onClick={() => setActiveTab('staff')}
        >
          <Users size={18} /> Staff Members
        </button>
        <button 
          className={`pb-3 px-4 font-bold border-b-2 flex gap-2 items-center ${activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={18} /> Activity Logs
        </button>
      </div>

      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800 text-lg">Staff Directory</h3>
             <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center hover:bg-blue-700">
                <Plus size={16} /> Add Staff
             </button>
          </div>

          {isAdding && (
            <div className="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex gap-4 items-end">
               <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-600 mb-1">Staff Name</label>
                 <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded outline-none" />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-600 mb-1">Login ID</label>
                 <input type="text" value={newStaff.loginId} onChange={e => setNewStaff({...newStaff, loginId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded outline-none" />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                 <input type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded outline-none" />
               </div>
               <div>
                  <button onClick={handleAddStaff} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">Save</button>
                  <button onClick={() => setIsAdding(false)} className="ml-2 text-slate-500 font-bold hover:text-slate-700 transition">Cancel</button>
               </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                 <tr>
                    <th className="p-3 font-medium rounded-tl-lg">Name</th>
                    <th className="p-3 font-medium">Login ID</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium text-right rounded-tr-lg">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {staffList.filter(s => s.companyId === activeCompany.id).map(s => (
                   <tr key={s.id}>
                      <td className="p-3 font-bold text-slate-800">{s.name}</td>
                      <td className="p-3 text-slate-600">{s.loginId}</td>
                      <td className="p-3 text-slate-500 capitalize">{s.role}</td>
                      <td className="p-3 text-right">
                         <button onClick={() => handleDeleteStaff(s.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Revoke Access</button>
                      </td>
                   </tr>
                 ))}
                 {staffList.filter(s => s.companyId === activeCompany.id).length === 0 && !isAdding && (
                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">No staff accounts for this company yet.</td></tr>
                 )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                 <tr>
                    <th className="p-4 font-medium border-b border-slate-200">Date & Time</th>
                    <th className="p-4 font-medium border-b border-slate-200">User</th>
                    <th className="p-4 font-medium border-b border-slate-200">Action</th>
                    <th className="p-4 font-medium border-b border-slate-200">Details</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logsList.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                     <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                     <td className="p-4 font-medium text-blue-700">
                       <span className="bg-blue-50 px-2 py-1 rounded">{log.userName}</span>
                     </td>
                     <td className="p-4 font-bold text-slate-800">{log.action}</td>
                     <td className="p-4 text-slate-500">{log.details}</td>
                  </tr>
                ))}
                {logsList.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">No activity logs recorded yet.</td></tr>
                )}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
