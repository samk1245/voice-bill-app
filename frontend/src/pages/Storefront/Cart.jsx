import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../store/cartSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Loader2, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { slug } = useParams();
  const dispatch = useDispatch();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const carts = useSelector(state => state.cart.carts);
  const cartItems = carts[slug] || [];

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const res = await fetch(`/api/stores/slug/${slug}`);
        const data = await res.json();
        if (res.ok) {
          setStore(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreDetails();
  }, [slug]);

  const handleUpdateQuantity = (productId, variantName, val) => {
    dispatch(updateQuantity({
      storeSlug: slug,
      productId,
      variantName,
      quantity: val
    }));
  };

  const handleRemove = (productId, variantName) => {
    dispatch(removeFromCart({
      storeSlug: slug,
      productId,
      variantName
    }));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Opening Shopping Bag...</span>
      </div>
    );
  }

  const primaryColor = store?.primaryColor || '#10b981';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar storeDetails={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-12 w-12 text-slate-600" />
            <div className="text-slate-500 italic text-sm">Your shopping cart is empty. Browse products to add items!</div>
            <Link 
              to={`/store/${slug}`} 
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items list */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-5">
                  <div className="h-16 w-16 bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
                    {item.variantName && (
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                        Dimension: {item.variantName}
                      </span>
                    )}
                    <span className="text-sm text-slate-400 font-bold block mt-1">${item.price}</span>
                  </div>

                  {/* Quantity adjusts */}
                  <div className="flex items-center bg-white/5 border border-white/5 rounded-xl overflow-hidden shrink-0">
                    <button 
                      onClick={() => handleUpdateQuantity(item.productId, item.variantName, item.quantity - 1)}
                      className="px-3 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-white select-none">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.productId, item.variantName, item.quantity + 1)}
                      className="px-3 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId, item.variantName)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Price invoice card summary */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white">Invoice Summary</h3>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">Free</span>
                </div>
                <div className="h-px bg-white/5 my-2" />
                <div className="flex justify-between text-base font-bold text-white">
                  <span>Total Amount</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to={`/store/${slug}/checkout`}
                className="w-full py-4 px-4 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 group"
                style={{ backgroundColor: primaryColor }}
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer storeDetails={store} />
    </div>
  );
}
