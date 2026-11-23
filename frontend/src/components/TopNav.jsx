import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Mic, Sun, Moon, Volume2, VolumeX, 
  Wifi, WifiOff, Sparkles, Store, Shield, 
  HelpCircle, ChevronDown, Plus, ShoppingCart,
  Landmark, Globe, DollarSign, Command, Tag, Palette, Check
} from 'lucide-react';
import { PALETTES } from '../utils/themePalettes';

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
  onOpenPriceChecker,
  globalSearch,
  setGlobalSearch,
  onNewBillClick,
  currency = '₹',
  setCurrency,
  voiceLang = 'hi-IN',
  setVoiceLang,
  activePalette = 'billing',
  onChangePalette
}) {
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 flex items-center justify-between transition-colors shadow-sm gap-2">
      {/* Left: Quick Search & Profile selector */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
        {/* Industry Profile Quick Switcher Pill */}
        <button
          onClick={onOpenTemplateModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          title="Change Industry Profile (12 Templates Available)"
        >
          <Store className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="truncate max-w-[120px]">{selectedStore?.category || 'Kirana & Grocery'}</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {/* Global Search / Command Palette Bar */}
        <div 
          onClick={onOpenCommandPalette}
          className="relative flex-1 cursor-pointer group"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search commands, SKU, bills, customers... (Ctrl+K)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch?.(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition cursor-pointer"
          />
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCommandPalette?.();
            }}
            className="hidden sm:flex items-center gap-1 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 hover:text-blue-500 transition"
          >
            <span>⌘K</span>
          </button>
        </div>
      </div>

      {/* Right: Actions, Palette Switcher, Price Checker, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        
        {/* Instant Price & Stock Checker Button (Ctrl+P) */}
        {onOpenPriceChecker && (
          <button
            onClick={onOpenPriceChecker}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
            title="Instant Price & Stock Checker (Ctrl+P)"
          >
            <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden lg:inline">Price Check</span>
            <span className="text-[10px] font-mono opacity-60">^P</span>
          </button>
        )}

        {/* Currency Selector */}
        {setCurrency && (
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="hidden sm:inline-block px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="hidden xl:inline-block px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        {/* Palette Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPaletteMenu(!showPaletteMenu)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1"
            title="Section Theme & Color System"
          >
            <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="w-2 h-2 rounded-full hidden sm:inline-block" style={{ backgroundColor: PALETTES[activePalette]?.primary || '#2563EB' }} />
          </button>

          {showPaletteMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                Purpose-Driven Color Palettes
              </div>
              {Object.values(PALETTES).map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    onChangePalette?.(pal.id);
                    setShowPaletteMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                    activePalette === pal.id ? 'font-bold bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0" 
                      style={{ background: pal.swatch }}
                    />
                    <div>
                      <div className="text-slate-900 dark:text-slate-100">{pal.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{pal.tagline}</div>
                    </div>
                  </div>
                  {activePalette === pal.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Day-End Cash Closing (Z-Report) */}
        {onOpenCashDrawerModal && (
          <button
            onClick={onOpenCashDrawerModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            title="Day-End Cash Drawer Reconciliation (Galla Hisab)"
          >
            <Landmark className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden md:inline">Day-End</span>
          </button>
        )}

        {/* Public Showcase Link */}
        <Link
          to="/landing"
          target="_blank"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
          title="Visit Public Product Showcase & Demo"
        >
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          <span>Showcase</span>
        </Link>

        {/* Quick Voice Bill CTA */}
        <button
          onClick={onNewBillClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition active:scale-95"
        >
          <Mic className="h-3.5 w-3.5 animate-pulse" />
          <span className="hidden sm:inline">Voice Bill</span>
        </button>

        {/* Network Status Pill */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
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
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
              : 'bg-transparent border-transparent text-slate-400'
          }`}
          title={soundEnabled ? 'Audio beeps enabled' : 'Audio muted'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 text-blue-500" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-500" />}
        </button>

        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveRole('Owner')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              activeRole === 'Owner' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => setActiveRole('Cashier')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              activeRole === 'Cashier' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Cashier
          </button>
        </div>

        {/* Help & Shortcuts Button */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Keyboard Shortcuts & Voice Guide"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
