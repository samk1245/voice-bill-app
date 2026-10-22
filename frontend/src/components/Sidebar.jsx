import React from 'react';
import { 
  LayoutDashboard, Mic, ShoppingBag, Package, AlertTriangle, 
  FileText, FileCheck, Users, Truck, Wallet, 
  BarChart3, Sparkles, Shield, Settings, HelpCircle, 
  ChevronLeft, ChevronRight, LogOut, Store
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  activeRole,
  selectedStore,
  user,
  onLogout
}) {
  const navSections = [
    {
      group: 'Core Billing',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'billing', label: 'Voice & Smart Bill', icon: Mic, highlight: true },
        { id: 'pos', label: 'Manual POS Grid', icon: ShoppingBag },
      ]
    },
    {
      group: 'Catalog & Stock',
      items: [
        { id: 'products', label: 'Products & Services', icon: Package },
        { id: 'inventory', label: 'Stock & Inventory', icon: AlertTriangle },
      ]
    },
    {
      group: 'Sales & Invoicing',
      items: [
        { id: 'bills', label: 'Invoices & Receipts', icon: FileText },
        { id: 'quotations', label: 'Quotations & Estimates', icon: FileCheck },
      ]
    },
    {
      group: 'Parties & Finances',
      items: [
        { id: 'customers', label: 'Customers & Udhaar', icon: Users },
        { id: 'suppliers', label: 'Suppliers Directory', icon: Truck },
        { id: 'expenses', label: 'Expenses & Cashflow', icon: Wallet },
        { id: 'reports', label: 'Reports & GST', icon: BarChart3 },
      ]
    },
    {
      group: 'Intelligence & Admin',
      items: [
        { id: 'billmate', label: 'BillMate AI Copilot', icon: Sparkles, badge: 'AI' },
        { id: 'staff', label: 'Staff & Roles', icon: Shield },
        { id: 'settings', label: '12 Business Profiles', icon: Settings },
        { id: 'help', label: 'Help & Shortcuts', icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } bg-navy-950 text-slate-200 border-r border-navy-800 shadow-xl select-none`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800/80 bg-navy-900/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 min-w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-glow-violet text-white font-black text-lg">
            <Mic className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                VoiceBill <span className="text-violet-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-violet-950/80 border border-violet-800/60">AI 2.0</span>
              </span>
              <p className="text-[11px] text-slate-400 truncate">Universal Billing OS</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Active Shop Profile Indicator */}
      {!collapsed && selectedStore && (
        <div className="px-3.5 py-2.5 mx-3 mt-3 rounded-xl bg-navy-900/80 border border-navy-800 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium truncate flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-softblue-500" />
              {selectedStore.name}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-950 text-violet-300 font-semibold border border-violet-800/60">
              {selectedStore.category || 'Universal'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {section.group}
              </p>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                    isActive 
                      ? 'bg-violet-600 text-white shadow-glow-violet font-semibold' 
                      : item.highlight
                      ? 'text-violet-300 hover:bg-violet-950/40 hover:text-white'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 min-w-4 ${isActive ? 'text-white' : item.highlight ? 'text-violet-400' : 'text-slate-400'}`} />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-400 text-navy-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-navy-800 bg-navy-900/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 min-w-8 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center font-bold text-xs text-softblue-500">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Store Owner'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{activeRole} Role</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
