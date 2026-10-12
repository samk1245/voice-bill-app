import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, storeSlug, themeColor }) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.inventoryCount <= 0;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full border border-white/5">
      <Link to={`/store/${storeSlug}/product/${product._id}`} className="block relative aspect-square bg-slate-900 overflow-hidden">
        {product.images && product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-600 gap-2">
            <span className="text-4xl">📦</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">No Image</span>
          </div>
        )}
        
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Sale
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1 block">
            {product.category || 'General'}
          </span>
          <Link to={`/store/${storeSlug}/product/${product._id}`}>
            <h3 className="text-lg font-bold text-white leading-snug hover:text-opacity-80 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-slate-400 text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white">${product.price}</span>
            {hasDiscount && (
              <span className="text-sm text-slate-500 line-through">${product.compareAtPrice}</span>
            )}
          </div>

          <Link 
            to={`/store/${storeSlug}/product/${product._id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md active:scale-95"
            style={{ 
              backgroundColor: isOutOfStock ? '#334155' : themeColor, 
              pointerEvents: isOutOfStock ? 'none' : 'auto' 
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Buy
          </Link>
        </div>
      </div>
    </div>
  );
}
