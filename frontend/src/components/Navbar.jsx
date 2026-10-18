import React from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { ShoppingCart, LogOut, LayoutDashboard, User as UserIcon, Store as StoreIcon } from 'lucide-react';

export default function Navbar({ storeDetails }) {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(state => state.auth);
  const carts = useSelector(state => state.cart.carts);

  const isStorefront = !!slug && location.pathname.includes(`/store/${slug}`);
  const cartItems = isStorefront && carts[slug] ? carts[slug] : [];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    if (isStorefront) {
      navigate(`/store/${slug}`);
    } else {
      navigate('/');
    }
  };

  // 1. RENDER STOREFRONT NAVBAR
  if (isStorefront && storeDetails) {
    const primaryColor = storeDetails.primaryColor || '#10b981';
    
    return (
      <nav className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to={`/store/${slug}`} className="flex items-center gap-2">
                {storeDetails.logo ? (
                  <img src={storeDetails.logo} alt={storeDetails.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: primaryColor }}>
                    {storeDetails.name.charAt(0)}
                  </div>
                )}
                <span className="text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity">
                  {storeDetails.name}
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to={`/store/${slug}/cart`} className="relative p-2 text-slate-300 hover:text-white transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs font-bold flex items-center justify-center text-white animate-pulse"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-400">
                    Hi, <span className="text-slate-200 font-medium">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  state={{ fromStore: slug }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // 2. RENDER SAAS PLATFORM NAVBAR
  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <StoreIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                VoiceBill AI
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user.role === 'SuperAdmin' && (
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Super Admin
                  </Link>
                )}

                {user.role === 'Vendor' && (
                  <Link 
                    to="/vendor/dashboard" 
                    className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Vendor Dashboard
                  </Link>
                )}

                <div className="h-4 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <UserIcon className="h-4 w-4 text-indigo-400" />
                    <span className="font-medium text-slate-200">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register-vendor" 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Create Your Store
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
