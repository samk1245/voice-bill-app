// Theme Palettes Configuration for VoiceBill AI
// Multi-colour design system based on purpose (Stripe / Linear / Shopify enterprise standards)

export const PALETTES = {
  billing: {
    id: 'billing',
    name: 'Deep Navy & Electric Blue',
    tagline: 'Professional POS & Billing Checkout',
    primary: '#2563EB',
    secondary: '#0F172A',
    accent: '#38BDF8',
    bg: '#0F172A',
    surface: '#1E293B',
    border: '#334155',
    activeTabClass: 'bg-blue-600 text-white shadow-sm',
    badgeClass: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
    iconColor: '#2563EB',
    swatch: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)'
  },
  analytics: {
    id: 'analytics',
    name: 'Forest Green & Muted Gold',
    tagline: 'Financial Analytics & Revenue Performance',
    primary: '#059669',
    secondary: '#D97706',
    accent: '#10B981',
    bg: '#064E3B',
    surface: '#0F291E',
    border: '#1E3A2F',
    activeTabClass: 'bg-emerald-600 text-white shadow-sm',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    iconColor: '#059669',
    swatch: 'linear-gradient(135deg, #064E3B 0%, #D97706 100%)'
  },
  voice: {
    id: 'voice',
    name: 'Charcoal & Soft Studio Orange',
    tagline: 'Voice Studio & AI Audio Interface',
    primary: '#EA580C',
    secondary: '#18181B',
    accent: '#F97316',
    bg: '#18181B',
    surface: '#27272A',
    border: '#3F3F46',
    activeTabClass: 'bg-orange-600 text-white shadow-sm',
    badgeClass: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20',
    iconColor: '#EA580C',
    swatch: 'linear-gradient(135deg, #18181B 0%, #EA580C 100%)'
  },
  invoices: {
    id: 'invoices',
    name: 'Burgundy & Champagne',
    tagline: 'Executive Invoicing & Receipts',
    primary: '#BE123C',
    secondary: '#FDE047',
    accent: '#FB7185',
    bg: '#881337',
    surface: '#4C0519',
    border: '#9F1239',
    activeTabClass: 'bg-rose-700 text-white shadow-sm',
    badgeClass: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20',
    iconColor: '#BE123C',
    swatch: 'linear-gradient(135deg, #881337 0%, #FDE047 100%)'
  },
  cashflow: {
    id: 'cashflow',
    name: 'Slate & Mint Emerald',
    tagline: 'Cashflow & Balance Reconciliation',
    primary: '#10B981',
    secondary: '#334155',
    accent: '#06B6D4',
    bg: '#0F172A',
    surface: '#1E293B',
    border: '#334155',
    activeTabClass: 'bg-emerald-600 text-white shadow-sm',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
    iconColor: '#10B981',
    swatch: 'linear-gradient(135deg, #334155 0%, #10B981 100%)'
  },
  inventory: {
    id: 'inventory',
    name: 'Terracotta & Sand',
    tagline: 'Stock Replenishment & Catalog Management',
    primary: '#9A3412',
    secondary: '#D97706',
    accent: '#EA580C',
    bg: '#451A03',
    surface: '#2E1002',
    border: '#78350F',
    activeTabClass: 'bg-amber-700 text-white shadow-sm',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconColor: '#9A3412',
    swatch: 'linear-gradient(135deg, #9A3412 0%, #D97706 100%)'
  }
};

export const getSavedThemePalette = () => {
  if (typeof window === 'undefined') return PALETTES.billing;
  const saved = localStorage.getItem('vb_color_palette');
  return PALETTES[saved] || PALETTES.billing;
};

export const applyThemePalette = (paletteKey) => {
  if (typeof window === 'undefined') return;
  const palette = PALETTES[paletteKey] || PALETTES.billing;
  localStorage.setItem('vb_color_palette', palette.id);
  
  const root = document.documentElement;
  root.setAttribute('data-palette', palette.id);
  root.style.setProperty('--primary-accent', palette.primary);
  root.style.setProperty('--secondary-accent', palette.secondary);
  
  window.dispatchEvent(new CustomEvent('palette-change', { detail: palette }));
  return palette;
};
