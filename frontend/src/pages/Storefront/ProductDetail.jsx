import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/cartSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Loader2, ArrowLeft, ShoppingCart, Check, Info } from 'lucide-react';

export default function ProductDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [store, setStore] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart configuration states
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotify, setAddedNotify] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Store Profile details
        const storeRes = await fetch(`/api/stores/slug/${slug}`);
        const storeData = await storeRes.json();
        if (!storeRes.ok) throw new Error(storeData.message || 'Store not found');
        setStore(storeData);

        // 2. Fetch Product details
        const prodRes = await fetch(`/api/products/${id}`);
        const prodData = await prodRes.json();
        if (!prodRes.ok) throw new Error(prodData.message || 'Product not found');
        setProduct(prodData);

        // Auto-select first variant if exist
        if (prodData.variants && prodData.variants.length > 0) {
          setSelectedVariant(prodData.variants[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug, id]);

  const handleAddToCart = () => {
    if (!product) return;

    dispatch(addToCart({
      storeSlug: slug,
      product: {
        ...product,
        // Override price if selected variant specifies a price
        price: selectedVariant && selectedVariant.price ? selectedVariant.price : product.price
      },
      variantName: selectedVariant ? selectedVariant.name : '',
      quantity
    }));

    setAddedNotify(true);
    setTimeout(() => setAddedNotify(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Inspecting Item Attributes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-red-500/25 text-center space-y-4">
          <Info className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Item Not Available</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <Link to={`/store/${slug}`} className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Back to Store Catalog
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = store?.primaryColor || '#10b981';
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.inventoryCount <= 0;

  // Active price based on variant selection
  const activePrice = selectedVariant && selectedVariant.price ? selectedVariant.price : product.price;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar storeDetails={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full text-left">
        <Link 
          to={`/store/${slug}`} 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-semibold group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
          Back to Catalogue
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Gallery Area */}
          <div className="aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
            {product.images && product.images[0] ? (
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <span className="text-6xl">📦</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">No Image Configured</span>
              </div>
            )}

            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                On Sale
              </span>
            )}
          </div>

          {/* Configuration details */}
          <div className="space-y-6">
            <div>
              <span className="text-xs text-slate-400 font-bold tracking-wider uppercase mb-1.5 block">
                {product.category || 'General'}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white">${activePrice}</span>
              {hasDiscount && (
                <span className="text-lg text-slate-500 line-through">${product.compareAtPrice}</span>
              )}
            </div>

            <p className="text-slate-300 text-base leading-relaxed border-t border-b border-white/5 py-6">
              {product.description || 'No detailed specifications entered.'}
            </p>

            {/* Variants attributes picker */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Configuration
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        selectedVariant?.name === variant.name
                          ? 'text-white border-transparent'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                      style={{ 
                        backgroundColor: selectedVariant?.name === variant.name ? primaryColor : '',
                        borderColor: selectedVariant?.name === variant.name ? primaryColor : ''
                      }}
                    >
                      {variant.name} {variant.price ? `(+$${variant.price - product.price})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantities & CTA */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center bg-white/5 rounded-xl border border-white/5 overflow-hidden shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-semibold text-white select-none">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
                style={{ backgroundColor: isOutOfStock ? '#334155' : primaryColor }}
              >
                {isOutOfStock ? (
                  'Sold Out'
                ) : addedNotify ? (
                  <>
                    <Check className="h-5 w-5 animate-bounce" />
                    Added to Shopping Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Extra details (stocks) */}
            {!isOutOfStock && (
              <div className="text-xs text-slate-500 font-semibold mt-2">
                Available warehouse stock: <span className="text-slate-400 font-medium">{product.inventoryCount} units</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer storeDetails={store} />
    </div>
  );
}
