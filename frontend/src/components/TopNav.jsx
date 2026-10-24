import React from 'react';
import { 
  Search, Mic, Sun, Moon, Volume2, VolumeX, 
  Wifi, WifiOff, Sparkles, Store, Shield, 
  HelpCircle, ChevronDown, Plus, ShoppingCart,
  Landmark, Globe, DollarSign
} from 'lucide-react';

export default function TopNav({
  collapsed,
  activeTab,
  setActiveTab,
  selectedStore,
  stores,
  onSelectStore,
  onOpenTemplateModal,
  darkMode,
  toggleDarkMode,
  soundEnabled,
  setSoundEnabled,
  talkbackEnabled,
  setTalkbackEnabled,
  isOnline,
  activeRole,
  setActiveRole,
  onOpenHelpModal,
  onOpenCashDrawerModal,
  globalSearch,
  setGlobalSearch,
  onNewBillClick,
  currency = '₹',
  setCurrency,
  voiceLang = 'hi-IN',
  setVoiceLang
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-navy-950/95 backdrop-blur-md border-b border-slate-200 dark:border-navy-800 px-3 sm:px-6 flex items-center justify-between transition-colors shadow-sm gap-2">
      {/* Left: Quick Search & Profile selector */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        {/* Industry Profile Quick Switcher Pill */}
        <button
          onClick={onOpenTemplateModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100 dark:hover:bg-violet-900/60 transition shadow-sm"
          title="Change Industry Profile (12 Templates Available)"
        >
          <Store className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          <span className="truncate max-w-[120px]">{selectedStore?.category || 'Kirana & Grocery'}</span>
          <ChevronDown className="h-3 w-3 text-violet-500" />
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search items, SKU, bills, customers... (Ctrl+K)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
          <kbd className="hidden lg:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-navy-800 rounded border border-slate-300 dark:border-navy-700">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Currency, Voice Language, Cash Drawer, Actions & Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        
        {/* Currency Selector */}
        {setCurrency && (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="hidden sm:inline-block px-2 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
            title="Active Billing Currency"
          >
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
            <option value="د.إ">د.إ AED</option>
          </select>
        )}

        {/* Speech Recognition Language */}
        {setVoiceLang && (
          <select
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            className="hidden xl:inline-block px-2 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
            title="Speech Recognition Language & Accent"
          >
            <option value="hi-IN">🇮🇳 Hindi (hi-IN)</option>
            <option value="en-IN">🇮🇳 English (en-IN)</option>
            <option value="en-US">🇺🇸 English (en-US)</option>
            <option value="ta-IN">🇮🇳 Tamil (ta-IN)</option>
            <option value="te-IN">🇮🇳 Telugu (te-IN)</option>
            <option value="bn-IN">🇮🇳 Bengali (bn-IN)</option>
          </select>
        )}

        {/* Day-End Cash Closing (Z-Report) */}
        {onOpenCashDrawerModal && (
          <button
            onClick={onOpenCashDrawerModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 text-xs font-semibold transition"
            title="Day-End Cash Drawer Reconciliation (Galla Hisab)"
          >
            <Landmark className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden md:inline">Day-End</span>
          </button>
        )}

        {/* Quick Voice Bill CTA */}
        <button
          onClick={onNewBillClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-violet transition active:scale-95"
        >
          <Mic className="h-3.5 w-3.5 animate-pulse" />
          <span className="hidden sm:inline">Voice Bill</span>
        </button>

        {/* Network Status Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${
            isOnline 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse'
          }`}
          title={isOnline ? 'System is online & synchronized' : 'Offline mode: Bills will queue locally'}
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Sound Feedback Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border transition ${
            soundEnabled
              ? 'bg-slate-100 dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200'
              : 'bg-slate-50 dark:bg-navy-900 border-transparent text-slate-400'
          }`}
          title={soundEnabled ? 'Audio beeps enabled' : 'Audio muted'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-navy-700 transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-600" />}
        </button>

        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-navy-900 p-0.5 rounded-xl border border-slate-200 dark:border-navy-800 text-xs">
          <button
            onClick={() => setActiveRole('Owner')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              activeRole === 'Owner' 
                ? 'bg-white dark:bg-navy-800 text-violet-600 dark:text-violet-400 shadow-sm font-semibold' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => setActiveRole('Cashier')}
            className={`px-2 py-1 rounded-lg font-medium transition ${
              activeRole === 'Cashier' 
                ? 'bg-white dark:bg-navy-800 text-violet-600 dark:text-violet-400 shadow-sm font-semibold' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Cashier
          </button>
        </div>

        {/* Help & Shortcuts Button */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:text-violet-600 transition"
          title="Keyboard Shortcuts & Voice Guide"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
