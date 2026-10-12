import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Package, Settings, ShoppingBag, Store, Users, LayoutGrid } from 'lucide-react';

export default function Sidebar({ role }) {
  const isSuperAdmin = role === 'SuperAdmin';

  const vendorLinks = [
    { name: 'Overview', path: '/vendor/dashboard', icon: BarChart3 },
    { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
    { name: 'Orders', path: '/vendor/dashboard/orders', icon: ShoppingBag },
    { name: 'Store Settings', path: '/vendor/dashboard/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutGrid },
    { name: 'Manage Tenants', path: '/admin/dashboard/stores', icon: Store },
  ];

  const links = isSuperAdmin ? adminLinks : vendorLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isSuperAdmin ? 'Platform Management' : 'Store Control Panel'}
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? isSuperAdmin
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/25'
                      : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
