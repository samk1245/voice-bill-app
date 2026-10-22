import React, { useState } from 'react';
import { 
  X, Check, Sparkles, Store, ShoppingBag, 
  Tv, HeartPulse, Utensils, Wrench, Scissors, 
  Car, BookOpen, Layers, Tag, Sliders
} from 'lucide-react';

export const BUSINESS_TEMPLATES = [
  {
    name: 'Kirana & Grocery',
    desc: 'Everyday groceries, grains, dairy, packaged foods, FMCG & daily essentials',
    icon: Store,
    color: 'from-emerald-500 to-teal-600',
    units: 'kg, g, packet, litre, piece',
    tax: '0%, 5%, 12%, 18% GST',
    highlight: 'Weight units + Indian brand catalog'
  },
  {
    name: 'Clothing & Fashion',
    desc: 'Apparel, footwear, ethnic wear, fabrics, accessories with size & color variants',
    icon: ShoppingBag,
    color: 'from-pink-500 to-rose-600',
    units: 'piece, pair, set',
    tax: '5%, 12% GST',
    highlight: 'Size, Color & Exchange policy'
  },
  {
    name: 'Electronics & Mobile',
    desc: 'Smartphones, gadgets, audio, cables, power banks with warranty & IMEI tracking',
    icon: Tv,
    color: 'from-blue-600 to-indigo-600',
    units: 'piece, set',
    tax: '18%, 28% GST',
    highlight: 'Serial/IMEI & Brand Warranty'
  },
  {
    name: 'Medical & Pharmacy',
    desc: 'Chemist, prescription drugs, syrups, healthcare with batch numbers & expiry dates',
    icon: HeartPulse,
    color: 'from-red-500 to-rose-600',
    units: 'strip, tablet, bottle, box',
    tax: '5%, 12% GST',
    highlight: 'Batch No. & Expiry Tracking'
  },
  {
    name: 'Restaurant & Cafe',
    desc: 'Dine-in, takeaway, bakery, cloud kitchen with table numbers & kitchen tokens',
    icon: Utensils,
    color: 'from-amber-500 to-orange-600',
    units: 'portion, plate, cup, glass',
    tax: '5% GST Composition',
    highlight: 'Table No., Token & Dine-in/Takeaway'
  },
  {
    name: 'Hardware & Electrical',
    desc: 'Wires, switches, lighting, plumbing, paints, construction materials & tools',
    icon: Wrench,
    color: 'from-slate-600 to-slate-800',
    units: 'piece, meter, kg, box',
    tax: '18%, 28% GST',
    highlight: 'Length/Weight & Specifications'
  },
  {
    name: 'Beauty Salon & Spa',
    desc: 'Haircuts, facials, spa treatments, bridal packages & salon retail products',
    icon: Scissors,
    color: 'from-purple-500 to-fuchsia-600',
    units: 'session, service, hour',
    tax: '18% GST',
    highlight: 'Pure Service Billing (Zero Inventory)'
  },
  {
    name: 'Automobile & Repair',
    desc: 'Garage, 2-wheeler/4-wheeler service, engine oils, batteries & spare parts',
    icon: Car,
    color: 'from-zinc-600 to-zinc-800',
    units: 'job, piece, litre, set',
    tax: '18%, 28% GST',
    highlight: 'Labor Charge + Spare Parts Split'
  },
  {
    name: 'Bookstores & Stationery',
    desc: 'School supplies, notebooks, pens, competitive exams, novels & office supplies',
    icon: BookOpen,
    color: 'from-sky-500 to-blue-600',
    units: 'piece, set, packet',
    tax: '0% Books, 12-18% Stationery',
    highlight: 'Exempt Books & Standard Stationery'
  },
  {
    name: 'Wholesale & Distribution',
    desc: 'B2B bulk orders, master cartons, sacks, wholesale price tiers & credit terms',
    icon: Layers,
    color: 'from-indigo-600 to-violet-700',
    units: 'carton, bag, box, sack',
    tax: '5%, 12%, 18% GST',
    highlight: 'Bulk Packaging & Payment Terms'
  },
  {
    name: 'General Retail',
    desc: 'Gift shops, home decor, kitchenware, toys, luggage & multi-utility stores',
    icon: Tag,
    color: 'from-teal-500 to-emerald-600',
    units: 'piece, pack, set',
    tax: '5%, 12%, 18% GST',
    highlight: 'Flexible Units & Multi-category'
  },
  {
    name: 'Custom Business',
    desc: 'Freelancers, consultants, customized fabrication & tailored business workflows',
    icon: Sliders,
    color: 'from-violet-600 to-purple-800',
    units: 'customizable',
    tax: 'Fully Configurable',
    highlight: '100% Flexible Fields & Logic'
  }
];

export default function TemplateSelectorModal({
  isOpen,
  onClose,
  currentCategory,
  onApplyTemplate,
  isLoading
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(currentCategory || 'Kirana & Grocery');
  const [seedSampleProducts, setSeedSampleProducts] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-glow-violet">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Universal Business Profiles (12 Industries)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your business type to instantly adapt units, tax rates, terms, and sample catalog items.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 12 Templates Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {BUSINESS_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplate === tmpl.name;
            return (
              <div
                key={tmpl.name}
                onClick={() => setSelectedTemplate(tmpl.name)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected 
                    ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 ring-2 ring-violet-500/30 shadow-md' 
                    : 'border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950/40 hover:border-slate-300 dark:hover:border-navy-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tmpl.color} text-white shadow-sm`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-violet-600 text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    {tmpl.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-navy-800/80 space-y-1 text-[11px]">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    <span className="text-slate-400">Units:</span> {tmpl.units}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    <span className="text-slate-400">Tax:</span> {tmpl.tax}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                    {tmpl.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Options & Apply Button */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
            <input
              type="checkbox"
              checked={seedSampleProducts}
              onChange={(e) => setSeedSampleProducts(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
            />
            <span>Pre-load realistic sample products & services for <strong>{selectedTemplate}</strong></span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onApplyTemplate(selectedTemplate, seedSampleProducts)}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-bold shadow-glow-violet transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Applying Profile...</span>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Apply {selectedTemplate} Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
