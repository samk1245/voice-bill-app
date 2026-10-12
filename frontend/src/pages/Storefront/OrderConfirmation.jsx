import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/cartSlice.js';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Loader2, CheckCircle2, ArrowRight, XCircle, ShoppingBag } from 'lucide-react';

export default function OrderConfirmation() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const [store, setStore] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const confirmAndRetrieveOrder = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Store Profile details
        const storeRes = await fetch(`/api/stores/slug/${slug}`);
        const storeData = await storeRes.json();
        if (!storeRes.ok) throw new Error(storeData.message || 'Store not found');
        setStore(storeData);

        if (!sessionId) {
          throw new Error('Checkout session token identifier is missing');
        }

        // 2. Confirm payment and trigger stock adjustment in backend
        const confirmRes = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        const confirmData = await confirmRes.json();
        
        if (!confirmRes.ok) {
          throw new Error(confirmData.message || 'Payment verification failed');
        }

        setOrder(confirmData.order);

        // 3. Clear cart since checkout was successful
        dispatch(clearCart({ storeSlug: slug }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    confirmAndRetrieveOrder();
  }, [slug, sessionId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Verifying Invoice Payment...</span>
      </div>
    );
  }

  const primaryColor = store?.primaryColor || '#10b981';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar storeDetails={store} />

      <main className="max-w-3xl mx-auto px-4 py-16 flex-1 w-full text-left">
        {error ? (
          <div className="glass-panel p-8 rounded-3xl border border-red-500/25 text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Payment Unverified</h2>
            <p className="text-slate-400 text-sm">{error}</p>
            <Link to={`/store/${slug}`} className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Return to Store Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header Success alert */}
            <div className="text-center space-y-3">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Order Confirmed!</h1>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Thank you for shopping at <span className="text-slate-200 font-bold">{store.name}</span>. Your invoice has been paid.
              </p>
            </div>

            {/* Invoice card details */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/5 pb-4 gap-2 text-sm">
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block text-xs">Invoice Ref</span>
                  <span className="text-white font-semibold font-mono">{order._id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase tracking-wider block text-xs">Invoice Date</span>
                  <span className="text-slate-300 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Items listing */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-indigo-400" /> Items Purchased
                </h3>
                
                <div className="divide-y divide-white/5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex justify-between gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-white">{item.name}</span>
                        {item.variantName && (
                          <span className="block text-xs text-slate-500 font-semibold uppercase mt-0.5">{item.variantName}</span>
                        )}
                        <span className="text-slate-400 text-xs mt-1 block">${item.price} × {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-200 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping and total totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5 text-sm">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Delivery Address</h4>
                  <div className="text-slate-300 space-y-0.5 leading-relaxed">
                    <div>{order.customerName}</div>
                    <div>{order.shippingAddress.street}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end text-right bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoice Total Paid</span>
                  <span className="text-3xl font-black text-emerald-400 mt-2">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to={`/store/${slug}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all shadow-md group"
                style={{ backgroundColor: primaryColor }}
              >
                Continue Shopping
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
