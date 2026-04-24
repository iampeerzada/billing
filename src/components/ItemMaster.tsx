import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Box, Edit2 } from 'lucide-react';
import { API_URL } from '../config';
import { HSN_DATA } from '../hsnData';

export function ItemMaster() {
  const [items, setItems] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ id: '', name: '', category: '', price: '', unit: 'pcs', currentStock: '0', minStock: '0', description: '', hsn: '', gstRate: '18', vendorId: '', vendorName: '', purchaseRate: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
      const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');
      if (!activeTenant.id) return;
      
      const response = await fetch(`${API_URL}/api/vendors`, {
        headers: { 'x-tenant-id': activeTenant.id, 'x-company-id': activeCompany.id }
      });
      if (response.ok) {
        setVendors(await response.json());
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
      const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

      if (!activeTenant.id) return;

      const response = await fetch(`${API_URL}/api/items`, {
        headers: {
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchVendors();
  }, []);

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.price) return;
    
    const activeTenant = JSON.parse(localStorage.getItem('active_tenant') || '{}');
    const activeCompany = JSON.parse(localStorage.getItem('active_company') || '{"id": "default"}');

    if (!activeTenant.id) return;
    
    const itemData = {
      ...newItem,
      id: isEditing ? newItem.id : Date.now().toString(),
      price: Number(newItem.price),
      currentStock: Number(newItem.currentStock),
      gstRate: Number(newItem.gstRate)
    };

    try {
      const response = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenant.id,
          'x-company-id': activeCompany.id
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        await fetchItems();
        setIsModalOpen(false);
        resetForm();
      } else {
        alert("Failed to save item to backend");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Error saving item");
    }
  };

  const handleEdit = (item: any) => {
    setNewItem({
      id: item.id,
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      price: item.price.toString(),
      unit: item.unit || 'pcs',
      currentStock: item.currentStock.toString(),
      minStock: item.minStock ? item.minStock.toString() : '0',
      hsn: item.hsn || '',
      gstRate: item.gstRate ? item.gstRate.toString() : '18',
      vendorId: item.vendorId || '',
      vendorName: item.vendorName || '',
      purchaseRate: item.purchaseRate ? item.purchaseRate.toString() : ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewItem({ id: '', name: '', description: '', category: '', price: '', unit: 'pcs', currentStock: '0', minStock: '0', hsn: '', gstRate: '18', vendorId: '', vendorName: '', purchaseRate: '' });
    setIsEditing(false);
  };

  const openNewItemModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Item Master</h1>
          <p className="text-slate-500">Manage all your products, services, and base stock</p>
        </div>
        <button 
          onClick={openNewItemModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Price</th>
                <th className="p-4 font-medium text-center">Unit</th>
                <th className="p-4 font-medium text-right">Current Stock</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                    <Box size={16} className="text-slate-400" /> {item.name}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">{item.description}</td>
                  <td className="p-4 text-slate-600">{item.category}</td>
                  <td className="p-4 text-right font-medium">₹ {item.price}</td>
                  <td className="p-4 text-center text-slate-500 text-sm">{item.unit}</td>
                  <td className="p-4 text-right font-bold text-slate-700">{item.currentStock}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleEdit(item)} className="p-1 hover:bg-slate-200 rounded text-blue-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-100 font-bold bg-slate-50">{isEditing ? 'Edit Item' : 'Add New Item'}</div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-600">Item Name</label>
                <input value={newItem.name} onChange={e=>setNewItem({...newItem, name: e.target.value})} className="w-full border rounded-lg p-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-600">Description</label>
                <input value={newItem.description} onChange={e=>setNewItem({...newItem, description: e.target.value})} className="w-full border rounded-lg p-2 outline-none" placeholder="Small description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-slate-600">HSN & Category</label>
                  <input
                    list="hsn-list"
                    placeholder="Search or Select HSN Code..."
                    value={newItem.hsn}
                    onChange={e => {
                      const hsn = e.target.value;
                      const cat = HSN_DATA.find(d => d.code === hsn)?.description || newItem.category;
                      setNewItem({...newItem, hsn, category: cat});
                    }}
                    className="w-full border rounded-lg p-2 outline-none bg-white max-w-full"
                  />
                  <datalist id="hsn-list">
                    {HSN_DATA.map(d => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.description.length > 80 ? d.description.substring(0, 80) + '...' : d.description}
                      </option>
                    ))}
                  </datalist>
                  <input 
                    type="text" 
                    list="category-list"
                    placeholder="Search or type custom category..." 
                    value={newItem.category} 
                    onChange={e => setNewItem({...newItem, category: e.target.value})} 
                    className="w-full border rounded-lg p-2 outline-none mt-2" 
                  />
                  <datalist id="category-list">
                    <option value="Electronics"></option>
                    <option value="Clothing & Apparel"></option>
                    <option value="Home & Kitchen"></option>
                    <option value="Groceries & Food"></option>
                    <option value="Health & Beauty"></option>
                    <option value="Automotive"></option>
                    <option value="Sports & Outdoors"></option>
                    <option value="Toys & Games"></option>
                    <option value="Books & Stationery"></option>
                    <option value="Furniture"></option>
                    <option value="Jewelry & Watches"></option>
                    <option value="Hardware & Tools"></option>
                    <option value="Industrial & Scientific"></option>
                    <option value="Pet Supplies"></option>
                    <option value="Office Products"></option>
                    <option value="Musical Instruments"></option>
                    <option value="Software"></option>
                    <option value="Baby Products"></option>
                    <option value="Shoes & Footwear"></option>
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Sales Rate (₹)</label>
                  <input type="number" value={newItem.price} onChange={e=>setNewItem({...newItem, price: e.target.value})} className="w-full border rounded-lg p-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">GST Rate (%)</label>
                  <select value={newItem.gstRate} onChange={e=>setNewItem({...newItem, gstRate: e.target.value})} className="w-full border rounded-lg p-2 outline-none bg-white">
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Opening Stock</label>
                  <input type="number" value={newItem.currentStock} onChange={e=>setNewItem({...newItem, currentStock: e.target.value})} className="w-full border rounded-lg p-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-600">Min. Stock Alert</label>
                  <input type="number" value={newItem.minStock} onChange={e=>setNewItem({...newItem, minStock: e.target.value})} className="w-full border rounded-lg p-2 outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1 text-slate-600">Unit</label>
                  <select value={newItem.unit} onChange={e=>setNewItem({...newItem, unit: e.target.value})} className="w-full border rounded-lg p-2 outline-none bg-white">
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="box">Boxes (box)</option>
                    <option value="pack">Packs</option>
                  </select>
                </div>
                <div className="sm:col-span-2 border-t pt-4">
                  <span className="text-sm font-bold text-slate-700 block mb-3">Vendor & Purchase Settings</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 text-slate-600">Primary Vendor</label>
                      <select 
                        value={newItem.vendorId} 
                        onChange={e => {
                          const vendor = vendors.find(v => v.id === e.target.value);
                          setNewItem({...newItem, vendorId: e.target.value, vendorName: vendor ? vendor.name : ''});
                        }}
                        className="w-full border rounded-lg p-2 outline-none bg-white"
                      >
                        <option value="">-- Select Vendor --</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-slate-600">Purchase Rate (₹)</label>
                      <input type="number" value={newItem.purchaseRate} onChange={e=>setNewItem({...newItem, purchaseRate: e.target.value})} className="w-full border rounded-lg p-2 outline-none" placeholder="Vendor rate..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-end gap-2 bg-slate-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-slate-200 rounded-lg">Cancel</button>
              <button onClick={handleSaveItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {isEditing ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
