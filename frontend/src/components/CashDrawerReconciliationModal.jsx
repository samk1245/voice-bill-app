import React, { useState, useMemo } from 'react';
import { X, Landmark, DollarSign, Calculator, Printer, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CashDrawerReconciliationModal({
  isOpen,
  onClose,
  store,
  orders = [],
  expenses = [],
  activeRole
}) {
  const [openingCash, setOpeningCash] = useState('2000');
  const [actualCash, setActualCash] = useState('');
  const [cashierNotes, setCashierNotes] = useState('');
  const [closingSaved, setClosingSaved] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Filter today's transactions
  const { cashSales, upiSales, cardSales, udhaarSales, cashExpenses, totalSales } = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let udhaar = 0;
    let tot = 0;

    orders.forEach(o => {
      if (o.status === 'Cancelled') return;
      const oDate = (o.createdAt || '').slice(0, 10);
      if (oDate === todayStr) {
        const amt = Number(o.amountPaid !== undefined ? o.amountPaid : o.totalAmount || 0);
        tot += Number(o.totalAmount || 0);
        if (o.paymentMethod === 'Cash') cash += amt;
        else if (o.paymentMethod === 'UPI') upi += amt;
        else if (o.paymentMethod === 'Card') card += amt;
        else if (o.paymentMethod === 'Credit/Udhaar') udhaar += amt;
      }
    });

    let expCash = 0;
    expenses.forEach(e => {
      const eDate = (e.date || e.createdAt || '').slice(0, 10);
      if (eDate === todayStr && (e.paymentMethod === 'Cash' || !e.paymentMethod)) {
        expCash += Number(e.amount || 0);
      }
    });

    return {
      cashSales: Math.round(cash * 100) / 100,
      upiSales: Math.round(upi * 100) / 100,
      cardSales: Math.round(card * 100) / 100,
      udhaarSales: Math.round(udhaar * 100) / 100,
      cashExpenses: Math.round(expCash * 100) / 100,
      totalSales: Math.round(tot * 100) / 100
    };
  }, [orders, expenses, todayStr]);

  const expectedCash = useMemo(() => {
    const open = Number(openingCash || 0);
    return Math.round((open + cashSales - cashExpenses) * 100) / 100;
  }, [openingCash, cashSales, cashExpenses]);

  const variance = useMemo(() => {
    if (actualCash === '') return null;
    return Math.round((Number(actualCash) - expectedCash) * 100) / 100;
  }, [actualCash, expectedCash]);

  const handlePrintZReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-glow-violet">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Day-End Cash Drawer & Z-Report</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shift closing, physical cash reconciliation & sales summary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Z-Report Body */}
        <div id="printable-z-report" className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
          
          {/* Store Brand Heading */}
          <div className="text-center pb-3 border-b border-slate-100 dark:border-navy-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {store?.name || 'VoiceBill AI Store'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Daily Closing Summary & Register Audit
            </p>
          </div>

          {/* Today's Sales Channel Breakdown */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              1. Today's Revenue by Tender Mode
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-semibold text-slate-400">CASH SALES</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹{cashSales}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-semibold text-slate-400">UPI / QR</span>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400 mt-0.5">₹{upiSales}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-semibold text-slate-400">CARD / POS</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">₹{cardSales}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-semibold text-slate-400">UDHAAR / CREDIT</span>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">₹{udhaarSales}</p>
              </div>
            </div>
          </div>

          {/* Cash Drawer Calculator */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              2. Cash Drawer Reconciliation (Galla Hisab)
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">(+) Opening Cash Balance:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span>₹</span>
                  <input
                    type="number"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    className="w-24 px-2 py-1 rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-right font-bold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>(+) Cash Sales Invoiced Today:</span>
                <span className="font-mono font-bold">+₹{cashSales}</span>
              </div>

              <div className="flex items-center justify-between text-rose-500 font-medium">
                <span>(-) Cash Expenses Paid from Drawer:</span>
                <span className="font-mono font-bold">-₹{cashExpenses}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>(=) Expected Cash in Drawer:</span>
                <span className="font-mono text-sm text-violet-600 dark:text-violet-400">₹{expectedCash}</span>
              </div>
            </div>

            {/* Actual Physical Cash Input */}
            <div className="pt-3 border-t border-dashed border-slate-300 dark:border-navy-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-violet-500" />
                  <span>Physical Cash Counted:</span>
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <span>₹</span>
                  <input
                    type="number"
                    placeholder="Enter counted cash"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    className="w-32 px-2.5 py-1.5 rounded-xl border border-violet-400 bg-white dark:bg-navy-900 text-right font-black text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
              </div>

              {/* Variance Indicator */}
              {variance !== null && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  variance === 0 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : variance > 0
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {variance === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>
                      {variance === 0 ? 'Exact Match! Zero Variance' : variance > 0 ? 'Cash Surplus (Extra)' : 'Cash Shortage (Deficit)'}
                    </span>
                  </div>
                  <span className="font-mono text-sm">
                    {variance > 0 ? `+₹${variance}` : `₹${variance}`}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Cashier Notes */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1 font-medium text-[11px]">
              Closing Remarks / Cashier Note:
            </label>
            <input
              type="text"
              placeholder="e.g. 5x ₹500 notes deposited into safe lock"
              value={cashierNotes}
              onChange={(e) => setCashierNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs"
            />
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-200 dark:border-navy-800 grid grid-cols-2 gap-8 text-[11px] text-slate-500 text-center">
            <div className="border-t border-slate-300 dark:border-navy-700 pt-1 mt-4">
              Cashier Signature ({activeRole})
            </div>
            <div className="border-t border-slate-300 dark:border-navy-700 pt-1 mt-4">
              Store Owner Sign & Seal
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800 transition"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintZReport}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print Z-Report</span>
            </button>
            <button
              onClick={() => {
                setClosingSaved(true);
                setTimeout(() => {
                  setClosingSaved(false);
                  onClose();
                }, 1200);
              }}
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
            >
              {closingSaved ? <CheckCircle2 className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
              <span>{closingSaved ? 'Day Closed!' : 'Finalize Day Closing'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
