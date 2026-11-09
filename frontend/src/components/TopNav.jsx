import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Mic, Sun, Moon, Volume2, VolumeX, 
  Wifi, WifiOff, Sparkles, Store, Shield, 
  HelpCircle, ChevronDown, Plus, ShoppingCart,
  Landmark, Globe, DollarSign, Command
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
  onOpenCommandPalette,
  globalSearch,
  setGlobalSearch,
  onNewBillClick,
  currency = '₹',
  setCurrency,
  voiceLang = 'hi-IN',
  setVoiceLang
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080B1A]/85 backdrop-blur-2xl border-b border-white/[0.08] px-3 sm:px-6 flex items-center justify-between transition-colors shadow-xl gap-2">
      {/* Left: Quick Search & Profile selector */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        {/* Industry Profile Quick Switcher Pill */}
        <button
          onClick={onOpenTemplateModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#713CFF]/15 border border-white/[0.08] hover:border-[#713CFF]/40 text-[#B69CFF] hover:text-[#F8FAFF] text-xs font-semibold transition shadow-sm backdrop-blur-xl"
          title="Change Industry Profile (12 Templates Available)"
        >
          <Store className="h-3.5 w-3.5 text-[#00E5FF]" />
          <span className="truncate max-w-[120px]">{selectedStore?.category || 'Kirana & Grocery'}</span>
          <ChevronDown className="h-3 w-3 text-[#B69CFF]" />
        </button>

        {/* Global Search / Command Palette Bar */}
        <div 
          onClick={onOpenCommandPalette}
          className="relative flex-1 cursor-pointer group"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B69CFF]/60 group-hover:text-[#00E5FF] transition-colors" />
          <input
            type="text"
            placeholder="Search commands, SKU, bills, customers... (Ctrl+K)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch?.(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 rounded-xl text-xs sm:text-sm bg-[#0D1226]/80 border border-white/[0.08] text-[#F8FAFF] placeholder-[#B69CFF]/40 focus:outline-none focus:ring-2 focus:ring-[#713CFF]/50 transition cursor-pointer"
          />
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCommandPalette?.();
            }}
            className="hidden sm:flex items-center gap-1 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[#B69CFF] bg-white/[0.06] rounded-md border border-white/[0.1] hover:text-[#00E5FF] transition"
          >
            <span>⌘K</span>
          </button>
        </div>
      </div>

      {/* Right: Currency, Voice Language, Cash Drawer, Actions & Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        
        {/* Currency Selector */}
        {setCurrency && (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#0D1226]/80 border border-white/[0.08] text-[#F8FAFF] focus:outline-none focus:ring-1 focus:ring-[#713CFF]"
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
            className="hidden xl:inline-block px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0D1226]/80 border border-white/[0.08] text-[#F8FAFF] focus:outline-none focus:ring-1 focus:ring-[#713CFF]"
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
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#F8FAFF] text-xs font-semibold transition"
            title="Day-End Cash Drawer Reconciliation (Galla Hisab)"
          >
            <Landmark className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Day-End</span>
          </button>
        )}

        {/* Public Landing Page Link */}
        <Link
          to="/landing"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#B69CFF] hover:text-[#F8FAFF] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition"
          title="Visit Public Product Showcase & Demo"
        >
          <Globe className="h-3.5 w-3.5 text-[#00E5FF]" />
          <span>Showcase</span>
        </Link>

        {/* Quick Voice Bill CTA */}
        <button
          onClick={onNewBillClick}
          className="btn-gradient-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs shadow-glow-purple transition active:scale-95"
        >
          <Mic className="h-3.5 w-3.5 animate-pulse" />
          <span className="hidden sm:inline">Voice Bill</span>
        </button>

        {/* Network Status Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
          }`}
          title={isOnline ? 'System is online & synchronized' : 'Offline mode: Bills will queue locally'}
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Sound Feedback Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-xl border transition ${
            soundEnabled
              ? 'bg-white/[0.06] border-white/[0.1] text-[#F8FAFF]'
              : 'bg-transparent border-transparent text-[#B69CFF]/40'
          }`}
          title={soundEnabled ? 'Audio beeps enabled' : 'Audio muted'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 text-[#00E5FF]" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-[#F8FAFF] transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-[#713CFF]" />}
        </button>

        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center bg-[#0D1226]/80 p-0.5 rounded-xl border border-white/[0.08] text-xs">
          <button
            onClick={() => setActiveRole('Owner')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              activeRole === 'Owner' 
                ? 'bg-gradient-to-r from-[#713CFF] to-[#287BFF] text-white shadow-sm' 
                : 'text-[#B69CFF] hover:text-[#F8FAFF]'
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => setActiveRole('Cashier')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              activeRole === 'Cashier' 
                ? 'bg-gradient-to-r from-[#713CFF] to-[#287BFF] text-white shadow-sm' 
                : 'text-[#B69CFF] hover:text-[#F8FAFF]'
            }`}
          >
            Cashier
          </button>
        </div>

        {/* Help & Shortcuts Button */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#B69CFF] hover:text-[#00E5FF] hover:bg-white/[0.08] transition"
          title="Keyboard Shortcuts & Voice Guide"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
