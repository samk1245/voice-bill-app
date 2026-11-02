import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Mic, Plus, FileText, ShoppingCart, Package, 
  Users, BarChart3, Settings, Moon, Sun, Download, 
  HelpCircle, Sparkles, ArrowRight, X, QrCode, 
  TrendingUp, AlertTriangle, Wallet, Store, Layers
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  onStartVoice,
  onNewBill,
  onOpenCashDrawer,
  onOpenTemplateModal,
  onAskBillMate,
  onExportCSV
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commandGroups = [
    {
      group: 'Quick Actions',
      items: [
        {
          id: 'voice_bill',
          title: 'Start Voice Billing',
          subtitle: 'Activate microphone to speak items, prices & discounts',
          icon: Mic,
          badge: 'Voice',
          color: 'from-violet-500 to-fuchsia-500',
          action: () => {
            setActiveTab('billing');
            onStartVoice?.();
            onClose();
          }
        },
        {
          id: 'new_bill',
          title: 'Create New Invoice',
          subtitle: 'Open blank cart and start a fresh invoice',
          icon: Plus,
          badge: 'N',
          color: 'from-blue-500 to-cyan-500',
          action: () => {
            setActiveTab('billing');
            onNewBill?.();
            onClose();
          }
        },
        {
          id: 'day_end_cash',
          title: 'Day-End Cash Reconciliation',
          subtitle: 'Close register, calculate expected vs counted cash (Z-Report)',
          icon: Wallet,
          badge: 'Z-Report',
          color: 'from-emerald-500 to-teal-500',
          action: () => {
            onOpenCashDrawer?.();
            onClose();
          }
        },
        {
          id: 'change_template',
          title: 'Switch Business Profile',
          subtitle: 'Choose between 12 industry catalog templates',
          icon: Store,
          badge: '12 Profiles',
          color: 'from-amber-500 to-orange-500',
          action: () => {
            onOpenTemplateModal?.();
            onClose();
          }
        }
      ]
    },
    {
      group: 'Navigation',
      items: [
        { id: 'nav_billing', title: 'Smart Voice Billing', subtitle: 'Voice & manual line items, tax, discounts', icon: Mic, tab: 'billing' },
        { id: 'nav_pos', title: 'POS Quick Checkout Counter', subtitle: 'Grid catalog, barcode scanning, fast cash settlement', icon: ShoppingCart, tab: 'pos' },
        { id: 'nav_dashboard', title: 'Analytics & Revenue Dashboard', subtitle: 'Live sales charts, profit, category distribution', icon: BarChart3, tab: 'dashboard' },
        { id: 'nav_bills', title: 'Invoice & Receipts History', subtitle: 'Search, filter, reprint, WhatsApp share, PDF', icon: FileText, tab: 'bills' },
        { id: 'nav_products', title: 'Product Catalog & Pricing', subtitle: 'Manage items, barcodes, SKU, tax rates, images', icon: Package, tab: 'products' },
        { id: 'nav_inventory', title: 'Inventory & Stock Alerts', subtitle: 'Real-time stock valuation, low-stock notifications', icon: Layers, tab: 'inventory' },
        { id: 'nav_customers', title: 'Customer CRM & Udhaar Ledger', subtitle: 'Customer profiles, credit balances, payment history', icon: Users, tab: 'customers' },
        { id: 'nav_billmate', title: 'BillMate AI Business Assistant', subtitle: 'Ask questions about revenue, debts, predictive insights', icon: Sparkles, tab: 'billmate' },
        { id: 'nav_settings', title: 'Enterprise Settings Hub', subtitle: 'GSTIN, UPI QR, thermal printer, AI voice dialect tuning', icon: Settings, tab: 'settings' }
      ]
    },
    {
      group: 'Ask BillMate AI Copilot',
      items: [
        {
          id: 'ai_today',
          title: 'How much did I sell today?',
          subtitle: 'Get instant summary of today\'s orders & revenue',
          icon: Sparkles,
          color: 'from-purple-500 to-indigo-500',
          action: () => {
            setActiveTab('billmate');
            onAskBillMate?.('How much did I sell today?');
            onClose();
          }
        },
        {
          id: 'ai_unpaid',
          title: 'Who has not paid me?',
          subtitle: 'List all overdue customer debts and pending udhaar',
          icon: AlertTriangle,
          color: 'from-rose-500 to-pink-500',
          action: () => {
            setActiveTab('billmate');
            onAskBillMate?.('Who has not paid me?');
            onClose();
          }
        },
        {
          id: 'ai_predict',
          title: 'Predict next month\'s revenue',
          subtitle: 'Run predictive linear velocity model on recent billing data',
          icon: TrendingUp,
          color: 'from-cyan-500 to-blue-500',
          action: () => {
            setActiveTab('billmate');
            onAskBillMate?.('Predict next month\'s revenue');
            onClose();
          }
        }
      ]
    },
    {
      group: 'System Preferences',
      items: [
        {
          id: 'toggle_theme',
          title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          subtitle: darkMode ? 'Clean crisp day aesthetic' : 'Futuristic neon cyberpunk night aesthetic',
          icon: darkMode ? Sun : Moon,
          action: () => {
            toggleDarkMode?.();
            onClose();
          }
        },
        {
          id: 'export_csv',
          title: 'Export Invoices to CSV',
          subtitle: 'Download complete billing ledger as RFC-4180 spreadsheet',
          icon: Download,
          action: () => {
            onExportCSV?.();
            onClose();
          }
        }
      ]
    }
  ];

  // Flatten and filter items based on user query
  const filteredCommands = commandGroups.map(group => ({
    group: group.group,
    items: group.items.filter(item => {
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    })
  })).filter(group => group.items.length > 0);

  const flatList = filteredCommands.flatMap(g => g.items);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (flatList.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatList.length) % (flatList.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatList[selectedIndex];
        if (selected) {
          if (selected.action) {
            selected.action();
          } else if (selected.tab) {
            setActiveTab(selected.tab);
            onClose();
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatList, selectedIndex, setActiveTab, onClose]);

  if (!isOpen) return null;

  let currentItemCounter = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 dark:shadow-[0_0_50px_rgba(139,92,246,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80">
          <Search className="h-5 w-5 text-violet-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. 'voice', 'sales', 'z-report', 'tax')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {flatList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium">No matching commands found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for 'voice', 'bill', 'customer' or 'settings'</p>
            </div>
          ) : (
            filteredCommands.map((group) => (
              <div key={group.group} className="py-2">
                <div className="px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  {group.group}
                </div>
                <div className="space-y-1 mt-1">
                  {group.items.map((item) => {
                    const isSelected = currentItemCounter === selectedIndex;
                    const thisIndex = currentItemCounter;
                    currentItemCounter++;

                    const Icon = item.icon || FileText;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else if (item.tab) {
                            setActiveTab(item.tab);
                            onClose();
                          }
                        }}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-violet-50 dark:bg-slate-800 text-violet-600 dark:text-violet-400'
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="truncate">
                            <div className="text-xs sm:text-sm font-semibold truncate flex items-center gap-2">
                              {item.title}
                              {item.badge && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isSelected 
                                    ? 'bg-white/30 text-white' 
                                    : 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.subtitle && (
                              <div className={`text-[11px] truncate ${
                                isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-400'
                              }`}>
                                {item.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${
                          isSelected ? 'translate-x-1 opacity-100 text-white' : 'opacity-0 -translate-x-1'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↵</kbd> to select</span>
          </div>
          <div className="flex items-center gap-1.5 text-violet-500 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>VoiceBill AI Command Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}
