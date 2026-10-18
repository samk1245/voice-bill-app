import React from 'react';

export default function Footer({ storeDetails }) {
  if (storeDetails) {
    return (
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {storeDetails.name}. Powered by VoiceBill AI Smart POS System.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            VoiceBill AI — Voice-Powered Smart Billing & Invoicing
          </div>
          <div>
            © {new Date().getFullYear()} VoiceBill AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
