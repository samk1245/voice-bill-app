import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Tag, Barcode, Package, ShoppingCart, 
  TrendingUp, Check, AlertTriangle, Layers, ArrowRight,
  Sparkles, Plus, Minus
} from 'lucide-react';

export default function PriceCheckerModal({
  isOpen,
  onClose,
  products = [],
  currency = '₹',
  onAddToCart
}) {
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedProduct(products[0] || null);
      setQuantity(1);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, products]);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter products by name, SKU, or category
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products.slice(0, 8);
    const q = query.toLowerCase().trim();
    return products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [products, query]);

  // When query changes, select the first match
  useEffect(() => {
    if (filteredProducts.length > 0) {
      setSelectedProduct(filteredProducts[0]);
      setQuantity(1);
    } else {
      setSelectedProduct(null);
    }
  }, [query]);

  const handleAdd = () => {
    if (!selectedProduct) return;
    onAddToCart?.(selectedProduct, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  if (!isOpen) return null;

  // Margin calculation for selected product
  const price = Number(selectedProduct?.price || 0);
  const cost = Number(selectedProduct?.costPrice || (price * 0.75));
  const profit = Math.max(0, price - cost);
  const marginPct = price > 0 ? Math.round(((profit / price) * 100) * 10) / 10 : 0;
  const stock = Number(selectedProduct?.stock || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#080B1A] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-blue-950/40 via-midnight-900 to-cyan-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/20 text-[#00E5FF] border border-blue-500/30">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Instant Price & Stock Checker
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-semibold border border-blue-500/30">
                    Ctrl+P
                  </span>
                </h2>
                <p className="text-xs text-[#B69CFF]/70">
                  Quick barcode or name price lookup for cashiers & floor staff
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-4 border-b border-white/[0.08] bg-[#0D1226]/60">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00E5FF]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Scan barcode or type product name, SKU, category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#080B1A] border border-white/[0.12] text-white text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition shadow-inner"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left Column: Product Search Results */}
            <div className="md:col-span-5 space-y-2 border-r border-white/[0.08] pr-0 md:pr-4">
              <span className="text-[11px] font-bold uppercase text-[#B69CFF]/60 block mb-2">
                Matching Items ({filteredProducts.length})
              </span>
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredProducts.map(p => {
                  const isSelected = selectedProduct?._id === p._id || selectedProduct?.name === p.name;
                  return (
                    <button
                      key={p._id || p.name}
                      onClick={() => {
                        setSelectedProduct(p);
                        setQuantity(1);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-[#00E5FF]/40 text-white shadow-sm'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-xs truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{p.sku || 'SKU-000'}</span>
                          <span>•</span>
                          <span>Stock: {p.stock ?? 0}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 font-bold text-xs text-[#00E5FF]">
                        {currency}{p.price}
                      </div>
                    </button>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No products found matching "{query}"
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Hero Price Card */}
            <div className="md:col-span-7 flex flex-col justify-between">
              {selectedProduct ? (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30">
                      {selectedProduct.category || 'General'}
                    </span>
                    <h3 className="text-xl font-black text-white mt-1.5">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      SKU: {selectedProduct.sku || 'N/A'} • Unit: {selectedProduct.unit || 'pcs'}
                    </p>
                  </div>

                  {/* Giant Price Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0D1226] to-[#131B38] border border-white/[0.1] shadow-xl relative overflow-hidden">
                    <div className="text-xs text-[#B69CFF] font-semibold">Selling Retail Price</div>
                    <div className="text-4xl font-black text-white mt-1 flex items-baseline gap-1">
                      <span className="text-2xl text-[#00E5FF]">{currency}</span>
                      <span>{price.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400 font-normal">/ {selectedProduct.unit || 'pcs'}</span>
                    </div>

                    {/* Cost & Margin Metrics */}
                    <div className="mt-4 pt-3 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Cost Price</span>
                        <div className="font-mono font-bold text-slate-200 mt-0.5">
                          {currency}{cost.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Profit Margin</span>
                        <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{marginPct}% (+{currency}{profit.toFixed(0)})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Status Badge */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#B69CFF]" />
                      <span className="text-xs text-slate-300">Warehouse Inventory:</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      stock <= 0
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : stock <= 5
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {stock <= 0 ? 'Out of Stock' : `${stock} Units Available`}
                    </span>
                  </div>

                  {/* Quantity & 1-Click Add CTA */}
                  <div className="pt-2 flex items-center gap-3">
                    <div className="flex items-center bg-[#0D1226] border border-white/[0.1] rounded-xl p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-sm font-bold font-mono text-white min-w-[32px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-300 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={handleAdd}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
                        addedAnimation
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_-5px_rgba(40,123,255,0.4)]'
                      }`}
                    >
                      {addedAnimation ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Added to Active Bill!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Add {quantity} to Active Bill ({currency}{(price * quantity).toLocaleString('en-IN')})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Package className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="text-sm font-medium">Select a product or scan a barcode</p>
                </div>
              )}
            </div>

          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 border-t border-white/[0.08] bg-[#080B1A] flex items-center justify-between text-[11px] text-slate-400">
            <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white font-mono">Esc</kbd> anytime to exit</span>
            <button
              onClick={onClose}
              className="text-[#00E5FF] hover:underline font-semibold"
            >
              Done & Return to Billing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
