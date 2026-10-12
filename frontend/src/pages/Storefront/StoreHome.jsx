import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import { Loader2, AlertCircle } from 'lucide-react';

export default function StoreHome() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStorefrontData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch Store Profile details by slug
        const storeRes = await fetch(`/api/stores/slug/${slug}`);
        const storeData = await storeRes.json();
        
        if (!storeRes.ok) {
          throw new Error(storeData.message || 'Store not found or suspended');
        }
        setStore(storeData);

        // 2. Fetch Store's Active Products
        const prodRes = await fetch(`/api/products/store/${slug}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefrontData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        <span className="text-slate-400 font-semibold text-sm">Entering Storefront Catalog...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-red-500/25 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Storefront Unavailable</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
            Return to SaaS Home
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = store?.primaryColor || '#10b981';
  const secondaryColor = store?.secondaryColor || '#065f46';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar storeDetails={store} />

      {/* Store Banner */}
      <div className="h-64 bg-slate-900 relative flex items-end overflow-hidden border-b border-white/5">
        {store.banner ? (
          <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div 
            className="absolute inset-0 bg-gradient-to-tr" 
            style={{ backgroundImage: `linear-gradient(to top right, ${secondaryColor}, ${primaryColor}99)` }}
          />
        )}
        <div className="absolute inset-0 bg-slate-950/40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 relative z-10 flex gap-6 items-end">
          <div className="h-20 w-20 rounded-full bg-slate-950 border-2 border-slate-950 flex items-center justify-center overflow-hidden shadow-2xl grow-0 shrink-0">
            {store.logo ? (
              <img src={store.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black" style={{ backgroundColor: primaryColor }}>
                {store.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-white tracking-tight">{store.name}</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl line-clamp-1 leading-relaxed">
              {store.description || 'Welcome to our online store. Browse our catalogue below.'}
            </p>
          </div>
        </div>
      </div>

      {/* Catalog items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Catalog Items</h2>

        {products.length === 0 ? (
          <div className="text-center py-20 text-slate-500 italic glass-panel border border-white/5 rounded-3xl">
            This store has not published any products in their catalogue yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                storeSlug={slug} 
                themeColor={primaryColor} 
              />
            ))}
          </div>
        )}
      </main>

      <Footer storeDetails={store} />
    </div>
  );
}
