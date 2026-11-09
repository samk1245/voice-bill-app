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
      } bg-[#080B1A] text-[#F8FAFF] border-r border-white/[0.08] shadow-2xl select-none`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08] bg-[#050711]/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 min-w-10 rounded-2xl bg-gradient-to-tr from-[#713CFF] via-[#287BFF] to-[#00E5FF] flex items-center justify-center shadow-glow-purple text-white font-black text-lg">
            <Mic className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <span className="font-extrabold text-base text-[#F8FAFF] tracking-tight flex items-center gap-1.5 font-display">
                VoiceBill <span className="text-[#00E5FF] font-black text-[10px] px-1.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">AI</span>
              </span>
              <p className="text-[11px] text-[#B69CFF]/80 truncate">Universal Billing OS</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl text-[#B69CFF] hover:text-[#F8FAFF] hover:bg-white/[0.06] transition"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Active Shop Profile Indicator */}
      {!collapsed && selectedStore && (
        <div className="px-3.5 py-2.5 mx-3 mt-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[#F8FAFF] font-semibold truncate flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-[#00E5FF]" />
              {selectedStore.name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#713CFF]/20 text-[#B69CFF] font-bold border border-[#713CFF]/40">
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
              <p className="px-2.5 text-[10px] font-bold text-[#B69CFF]/60 uppercase tracking-widest mb-1">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'btn-gradient-primary text-white shadow-glow-purple font-bold' 
                      : item.highlight
                      ? 'text-[#B69CFF] hover:bg-[#713CFF]/10 hover:text-[#F8FAFF] border border-[#713CFF]/20'
                      : 'text-[#B69CFF]/80 hover:bg-white/[0.04] hover:text-[#F8FAFF]'
                  }`}
                >
                  <Icon className={`h-4 w-4 min-w-4 ${isActive ? 'text-white' : item.highlight ? 'text-[#00E5FF]' : 'text-[#B69CFF]'}`} />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-[#00E5FF] text-[#080B1A]">
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
      <div className="p-3 border-t border-white/[0.08] bg-[#050711]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 min-w-8 rounded-xl bg-gradient-to-tr from-[#713CFF] to-[#287BFF] flex items-center justify-center font-extrabold text-xs text-white shadow-sm">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-[#F8FAFF] truncate">{user?.name || 'Store Owner'}</p>
                <p className="text-[10px] text-[#B69CFF] capitalize">{activeRole} Role</p>
              </div>
            )}
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 rounded-xl text-[#B69CFF] hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
