import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Store, Shield, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, token } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Revenue analytics charts mock data
  const analyticsData = [
    { month: 'Jan', revenue: 4500, orders: 120 },
    { month: 'Feb', revenue: 5200, orders: 150 },
    { month: 'Mar', revenue: 6100, orders: 180 },
    { month: 'Apr', revenue: 7800, orders: 210 },
    { month: 'May', revenue: 9500, orders: 270 },
    { month: 'Jun', revenue: 12800, orders: 350 },
  ];

  useEffect(() => {
    if (!user || user.role !== 'SuperAdmin') {
      navigate('/login');
      return;
    }

    const fetchAllStores = async () => {
      try {
        const response = await fetch('/api/stores', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch stores');
        }
        setStores(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStores();
  }, [user, token, navigate]);

  const handleToggleStatus = async (storeId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const response = await fetch(`/api/stores/${storeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change status');
      }

      // Local state update
      setStores(stores.map(store => store._id === storeId ? { ...store, status: nextStatus } : store));
    } catch (err) {
      alert(`Error toggling store status: ${err.message}`);
    }
  };

  const activeStoresCount = stores.filter(s => s.status === 'Active').length;
  const suspendedStoresCount = stores.filter(s => s.status === 'Suspended').length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar role="SuperAdmin" />

        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                <Shield className="h-8 w-8 text-indigo-400" /> Platform Controller
              </h1>
              <p className="text-slate-400 text-sm mt-1.5">
                Inspect live SaaS tenant profiles, restrict/unsuspend stores, and review global volume charts.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Stores</span>
                <span className="text-3xl font-black text-white">{stores.length}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Active Status</span>
                <span className="text-3xl font-black text-emerald-400">{activeStoresCount} <span className="text-xs font-normal text-slate-500">Active</span></span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Restricted Shops</span>
                <span className="text-3xl font-black text-amber-500">{suspendedStoresCount} <span className="text-xs font-normal text-slate-500">Suspended</span></span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Aggregated Platform Sales Volume</h2>
              <span className="text-xs text-slate-400">Total processed volume across all registered storefront networks.</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="indigoGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#indigoGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Store Tenants Manager */}
          <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Registered Tenant Storefronts</h2>
              <p className="text-xs text-slate-400 mt-1">Suspend stores immediately to disable public storefront browsing and checkout access.</p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading tenant registry...</div>
            ) : stores.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No stores registered in the platform database yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-slate-400 font-medium">
                      <th className="px-6 py-4">Store Identity</th>
                      <th className="px-6 py-4">Router Slug</th>
                      <th className="px-6 py-4">Onboarding Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stores.map((store) => (
                      <tr key={store._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: store.primaryColor }}>
                              {store.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{store.name}</div>
                              <div className="text-xs text-slate-500">Owner ID: {store.ownerId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-slate-300">/store/{store.slug}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(store.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            store.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${store.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            {store.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(store._id, store.status)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all text-xs font-semibold select-none"
                          >
                            {store.status === 'Active' ? (
                              <>
                                <ToggleLeft className="h-4.5 w-4.5 text-amber-500" />
                                Suspend Store
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4.5 w-4.5 text-emerald-400" />
                                Reactivate
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
