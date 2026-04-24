import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownToLine, ArrowUpFromLine, Plus, Package } from 'lucide-react';
import { API_URL } from '../config';

export function StockInOut() {
  const [transactionType, setTransactionType] = useState('in');
  const [itemObj, setItemObj] = useState<any>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [qty, setQty] = useState('');
  const [refType, setRefType] = useState('manual');
  const [refId, setRefId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Data
  const [movements, setMovements] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  const fetchAll = async () => {
    try {
      const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
      const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

      if (!activeTenant.id) return;
      const headers = { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id };

      const [movRes, itemRes, invRes, purRes] = await Promise.all([
        fetch(`${API_URL}/api/movements`, { headers }),
        fetch(`${API_URL}/api/items`, { headers }),
        fetch(`${API_URL}/api/invoices`, { headers }),
        fetch(`${API_URL}/api/purchases`, { headers })
      ]);
      
      if (movRes.ok) setMovements(await movRes.json());
      if (itemRes.ok) setItems(await itemRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
      if (purRes.ok) setPurchases(await purRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSaveMovement = async () => {
    if (!itemObj || !qty || Number(qty) <= 0) {
      alert("Please select an item and enter a valid quantity");
      return;
    }

    const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
    const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');
    if (!activeTenant.id) return;

    const isolationHeaders = {
      'Content-Type': 'application/json',
      'x-tenant-id': activeTenant.id as string,
      'x-company-id': activeCompany.id as string
    };

    let finalRemarks = remarks;
    let finalParty = partyName;
    if (refType === 'invoice') {
      const inv = invoices.find(i => i.id === refId);
      if (inv) {
        finalParty = inv.customerName || (inv.customerData ? JSON.parse(inv.customerData).name : '');
        finalRemarks = `Invoice Ref: ${inv.invoiceNumber || inv.number || ''} ${remarks ? '- ' + remarks : ''}`;
      }
    } else if (refType === 'purchase') {
      const pur = purchases.find(i => i.id === refId);
      if (pur) {
        finalParty = pur.vendorName || (pur.vendorData ? JSON.parse(pur.vendorData).name : '');
        finalRemarks = `Purchase Ref: ${pur.number || ''} ${remarks ? '- ' + remarks : ''}`;
      }
    } else {
        finalRemarks = `Manual Entry ${remarks ? '- ' + remarks : ''}`;
    }

    const newMovement = {
      id: Date.now().toString(),
      date,
      itemId: itemObj.id,
      item: itemObj.name, // Will be ignored by DB if not exists, but we can use it on UI if backend saves it? DB has itemId.
      type: transactionType === 'in' ? 'IN' : 'OUT',
      quantity: Number(qty),
      partyName: finalParty,
      remarks: finalRemarks
    };

    try {
      // 1. Save movement to backend
      const res = await fetch(`${API_URL}/api/movements`, {
        method: 'POST',
        headers: isolationHeaders,
        body: JSON.stringify(newMovement)
      });
      if (!res.ok) throw new Error("Failed to save movement");

      // 2. Update stock in item master on backend
      const itemResponse = await fetch(`${API_URL}/api/items`, { headers: isolationHeaders });
      if (itemResponse.ok) {
        const savedItems = await itemResponse.json();
        const si = savedItems.find((s: any) => s.id === itemObj.id);
        if (si) {
          const newStock = transactionType === 'in' ? Number(si.currentStock) + Number(qty) : Math.max(0, Number(si.currentStock) - Number(qty));
          await fetch(`${API_URL}/api/items`, {
            method: 'POST',
            headers: isolationHeaders,
            body: JSON.stringify({ ...si, currentStock: newStock })
          });
        }
      }

      await fetchAll();
      
      // Reset form
      setItemObj(null);
      setQty('');
      setRemarks('');
      setPartyName('');
      setRefId('');
      setRefType('manual');
      
      alert(`Stock Movement Saved:\n${transactionType === 'in' ? '+' : '-'}${qty} ${itemObj.unit || 'pcs'} of ${itemObj.name}`);
    } catch (error) {
      console.error("Error saving movement:", error);
      alert("Error saving movement to backend");
    }
  };

  const currentRefs = transactionType === 'in' ? purchases : invoices;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock In / Out</h1>
          <p className="text-slate-500">Record and track daily inventory movements</p>
        </div>
      </div>

      {/* Quick Entry Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Package size={20} className="text-blue-600" />
          Record New Stock Movement
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Movement Type</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button 
                className={`flex-1 py-2 text-sm font-medium flex justify-center items-center gap-2 ${transactionType === 'in' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                onClick={() => { setTransactionType('in'); setRefType('manual'); setRefId(''); }}
              >
                <ArrowDownToLine size={16} /> Stock In
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-medium flex justify-center items-center gap-2 ${transactionType === 'out' ? 'bg-rose-50 text-rose-700 border-b-2 border-rose-500' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                onClick={() => { setTransactionType('out'); setRefType('manual'); setRefId(''); }}
              >
                <ArrowUpFromLine size={16} /> Stock Out
              </button>
            </div>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Item from Master</label>
            <select 
                value={itemObj ? itemObj.id : ''} 
                onChange={(e) => {
                    const it = items.find(i => i.id === e.target.value);
                    setItemObj(it || null);
                }} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
            >
                <option value="">-- Select Item --</option>
                {items.map(it => <option key={it.id} value={it.id}>{it.name} (Cur: {it.currentStock} {it.unit})</option>)}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <div className="flex">
                <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-200 rounded-l-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
                <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-slate-500 text-sm flex items-center">
                    {itemObj ? itemObj.unit : 'Unit'}
                </span>
            </div>
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
            <select value={refType} onChange={(e) => { setRefType(e.target.value); setRefId(''); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
              <option value="manual">Manual Entry</option>
              {transactionType === 'in' && <option value="purchase">With Purchase Bill</option>}
              {transactionType === 'out' && <option value="invoice">With Sales Invoice</option>}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ref ID</label>
            {refType === 'manual' ? (
                <input type="text" disabled placeholder="N/A" className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-400" />
            ) : (
                <select value={refId} onChange={e => setRefId(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white">
                    <option value="">- Select -</option>
                    {currentRefs.map(r => (
                        <option key={r.id} value={r.id}>{r.number || r.invoiceNumber || 'No.'} - {r.customerName || r.vendorName || 'Client'}</option>
                    ))}
                </select>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Party Name (Optional)</label>
            <input type="text" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="Name..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
            <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason/Ref No." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSaveMovement}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} /> Save Movement
          </button>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-slate-800">Recent Movements</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Party</th>
                <th className="p-4 font-medium text-right">Quantity</th>
                <th className="p-4 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((mov) => {
                const item = items.find(i => i.id === mov.itemId || i.name === mov.itemId || i.name === mov.item);
                const itemNameDisplay = item ? item.name : (mov.itemId || mov.item);
                const isTypeIn = mov.type === 'IN' || mov.type === 'in';
                
                return (
                <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 text-slate-600">{mov.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isTypeIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isTypeIn ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                      {isTypeIn ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900">{itemNameDisplay}</td>
                  <td className="p-4 text-slate-600">
                    {mov.partyName || '-'}
                  </td>
                  <td className={`p-4 text-right font-bold ${isTypeIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isTypeIn ? '+' : '-'}{mov.quantity || mov.qty} <span className="text-xs font-normal text-slate-500">{item ? item.unit : ''}</span>
                  </td>
                  <td className="p-4 text-slate-500">{mov.remarks || mov.notes || '-'}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

