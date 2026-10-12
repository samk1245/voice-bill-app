import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Loader2, ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const { user } = useSelector(state => state.auth);
  const [name, setName] = useState(user ? user.name : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  const carts = useSelector(state => state.cart.carts);
  const cartItems = carts[slug] || [];

  useEffect(() => {
    const fetchStore = async () => {
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
    fetchStore();
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your shopping cart is empty');
      return;
    }

    if (!name || !email || !street || !city || !state || !zip || !country) {
      setError('Please fill in all shipping and contact fields');
      return;
    }

    setCheckoutLoading(true);

    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variantName: item.variantName
      }));

      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store._id.toString(),
          items: itemsPayload,
          shippingAddress: { street, city, state, zip, country },
          customerName: name,
          customerEmail: email,
          customerId: user ? user.id : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Payment checkout registration failed');
      }

      // Redirect client to checkout URL (either mock sandbox local path or real Stripe checkout page)
      if (data.isMock) {
        navigate(data.url);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Opening Secure Checkout...</span>
      </div>
    );
  }

  const primaryColor = store?.primaryColor || '#10b981';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar storeDetails={store} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full text-left">
        <Link 
          to={`/store/${slug}/cart`} 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-semibold group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" />
          Back to Shopping Bag
        </Link>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Secure Checkout</h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {/* Contact details */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                1. Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@gmail.com"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Shipping details */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                2. Shipping Address
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">State / Region</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Postal / ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="94103"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full px-4 py-3 rounded-xl text-white glass-input text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkoutLoading || cartItems.length === 0}
              className="w-full py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            >
              <CreditCard className="h-5 w-5" />
              {checkoutLoading ? 'Redirecting to payment...' : 'Proceed to Payment Gateway'}
            </button>
          </form>

          {/* Cart review */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-400" /> Review Items
            </h3>

            <div className="divide-y divide-white/5 max-h-[250px] overflow-y-auto pr-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="py-3.5 flex justify-between gap-4">
                  <div className="text-sm">
                    <span className="font-semibold text-white">{item.name}</span>
                    {item.variantName && (
                      <span className="block text-xs text-slate-500 font-semibold uppercase mt-0.5">{item.variantName}</span>
                    )}
                    <span className="text-xs text-slate-400 font-bold block mt-1">${item.price} × {item.quantity}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-300 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 text-sm space-y-3">
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
                <span>Checkout Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer storeDetails={store} />
    </div>
  );
}
