import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownToLine, ArrowUpFromLine, Plus, Package } from 'lucide-react';

export function StockInOut() {
  const [transactionType, setTransactionType] = useState('in');
  const [itemName, setItemName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [batch, setBatch] = useState('');
  const [expiry, setExpiry] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Movement data
  const [movements, setMovements] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('stock_movements');
    if (saved) {
      setMovements(JSON.parse(saved).reverse()); // Make newest first
    } else {
      const defaultMovements = [
        { id: 1, date: '2023-10-25', item: 'Paracetamol 500mg', type: 'in', qty: 500, unit: 'box', batch: 'B-2023-10', expiry: '2025-10-01', notes: 'New purchase' },
        { id: 2, date: '2023-10-24', item: 'Basmati Rice', type: 'out', qty: 50, unit: 'kg', batch: 'BR-001', expiry: '2024-06-15', notes: 'Sales Order #1024' },
        { id: 3, date: '2023-10-23', item: 'Wireless Mouse', type: 'in', qty: 100, unit: 'pcs', batch: '-', expiry: '-', notes: 'Restock' },
        { id: 4, date: '2023-10-22', item: 'Notebooks', type: 'out', qty: 20, unit: 'pcs', batch: '-', expiry: '-', notes: 'Office Use' },
      ];
      setMovements(defaultMovements);
      localStorage.setItem('stock_movements', JSON.stringify(defaultMovements));
    }
  }, []);

  const handleSaveMovement = () => {
    if (!itemName || !qty || Number(qty) <= 0) {
      alert("Please enter a valid item name and quantity");
      return;
    }

    const newMovement = {
      id: Date.now(),
      date,
      item: itemName,
      type: transactionType,
      qty: Number(qty),
      unit,
      batch: batch || '-',
      expiry: expiry || '-',
      notes: remarks || 'Manual entry'
    };

    const exList = JSON.parse(localStorage.getItem('stock_movements') || '[]');
    exList.push(newMovement);
    localStorage.setItem('stock_movements', JSON.stringify(exList));
    setMovements([...exList].reverse());
    
    // Update Item Master Stock
    const savedItems = JSON.parse(localStorage.getItem('system_items') || '[]');
    const itemsUpdated = savedItems.map((si: any) => {
      if (si.name === itemName) {
        return {
          ...si,
          currentStock: transactionType === 'in' ? Number(si.currentStock) + Number(qty) : Math.max(0, Number(si.currentStock) - Number(qty))
        };
      }
      return si;
    });
    localStorage.setItem('system_items', JSON.stringify(itemsUpdated));

    // Reset form
    setItemName('');
    setQty('');
    setBatch('');
    setExpiry('');
    setRemarks('');
    
    alert(`Stock Movement Saved:\n${transactionType === 'in' ? '+' : '-'}${qty} ${unit} of ${itemName}`);
  };

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
                onClick={() => setTransactionType('in')}
              >
                <ArrowDownToLine size={16} /> Stock In
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-medium flex justify-center items-center gap-2 ${transactionType === 'out' ? 'bg-rose-50 text-rose-700 border-b-2 border-rose-500' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                onClick={() => setTransactionType('out')}
              >
                <ArrowUpFromLine size={16} /> Stock Out
              </button>
            </div>
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Search or enter item name..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white">
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="box">Boxes (box)</option>
              <option value="ltr">Liters (L)</option>
              <option value="m">Meters (m)</option>
              <option value="pack">Packs</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Batch No. (Optional)</label>
            <input type="text" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. B-101" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-500" />
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
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search items..." 
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <button 
              onClick={() => alert('Advanced filters coming soon')}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Batch / Expiry</th>
                <th className="p-4 font-medium text-right">Quantity</th>
                <th className="p-4 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="p-4 text-slate-600">{mov.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      mov.type === 'in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {mov.type === 'in' ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
                      {mov.type === 'in' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900">{mov.item}</td>
                  <td className="p-4 text-slate-600">
                    {mov.batch !== '-' ? (
                      <div>
                        <span className="font-medium text-slate-700">{mov.batch}</span>
                        <span className="text-xs text-slate-400 block">Exp: {mov.expiry}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className={`p-4 text-right font-bold ${mov.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {mov.type === 'in' ? '+' : '-'}{mov.qty} <span className="text-xs font-normal text-slate-500">{mov.unit}</span>
                  </td>
                  <td className="p-4 text-slate-500">{mov.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
