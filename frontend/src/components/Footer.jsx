import React from 'react';

export default function Footer({ storeDetails }) {
  if (storeDetails) {
    return (
      <footer className="bg-slate-950 border-t border-white/5 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} {storeDetails.name}. Powered by Zaalima Multi-Tenant SaaS.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-slate-950 border-t border-white/5 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            ZAALIMA SaaS E-Commerce
          </div>
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Zaalima. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
