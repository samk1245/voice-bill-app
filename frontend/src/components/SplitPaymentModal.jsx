import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Split, Banknote, QrCode, CreditCard, 
  UserCheck, AlertCircle, CheckCircle2, Copy, 
  ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { generateUpiQrSvg } from '../utils/qrCodeSvg';

export default function SplitPaymentModal({
  isOpen,
  onClose,
  grandTotal = 0,
  currency = '₹',
  customerName = '',
  storeUpiId = 'store@okaxis',
  storeName = 'VoiceBill AI Store',
  onConfirmSplit
}) {
  const [cashAmount, setCashAmount] = useState('');
  const [cashTendered, setCashTendered] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [udhaarAmount, setUdhaarAmount] = useState('');
  const [upiRef, setUpiRef] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Initialize with 50/50 split or default amounts when opened
  useEffect(() => {
    if (isOpen) {
      const half = Math.round((grandTotal / 2) * 100) / 100;
      const rest = Math.round((grandTotal - half) * 100) / 100;
      setCashAmount(String(half));
      setCashTendered(String(half));
      setUpiAmount(String(rest));
      setCardAmount('');
      setUdhaarAmount('');
      setUpiRef('');
      setNotes('');
    }
  }, [isOpen, grandTotal]);

  const numCash = Number(cashAmount) || 0;
  const numUpi = Number(upiAmount) || 0;
  const numCard = Number(cardAmount) || 0;
  const numUdhaar = Number(udhaarAmount) || 0;
  const numTendered = Number(cashTendered) || numCash;

  const totalAllocated = Math.round((numCash + numUpi + numCard + numUdhaar) * 100) / 100;
  const balanceRemaining = Math.round((grandTotal - totalAllocated) * 100) / 100;
  const cashChangeReturn = Math.round(Math.max(0, numTendered - numCash) * 100) / 100;
  const isBalanced = Math.abs(balanceRemaining) < 0.01;

  // Generate UPI string and QR code
  const upiUrl = useMemo(() => {
    if (numUpi <= 0) return '';
    return `upi://pay?pa=${encodeURIComponent(storeUpiId)}&pn=${encodeURIComponent(storeName)}&am=${numUpi.toFixed(2)}&cu=INR&tn=SplitBill_${Date.now()}`;
  }, [numUpi, storeUpiId, storeName]);

  const qrSvgMarkup = useMemo(() => {
    if (!upiUrl) return '';
    return generateUpiQrSvg(upiUrl, 160);
  }, [upiUrl]);

  // Quick Preset Handlers
  const handlePreset5050 = () => {
    const half = Math.round((grandTotal / 2) * 100) / 100;
    setCashAmount(String(half));
    setCashTendered(String(half));
    setUpiAmount(String(Math.round((grandTotal - half) * 100) / 100));
    setCardAmount('');
    setUdhaarAmount('');
  };

  const handlePresetRoundCash = () => {
    // Round cash to nearest 50 or 100 lower
    const roundedCash = Math.floor(grandTotal / 100) * 100;
    const remainder = Math.round((grandTotal - roundedCash) * 100) / 100;
    setCashAmount(String(roundedCash > 0 ? roundedCash : Math.floor(grandTotal / 50) * 50));
    setCashTendered(String(roundedCash > 0 ? roundedCash : Math.floor(grandTotal / 50) * 50));
    setUpiAmount(String(remainder > 0 ? remainder : grandTotal));
    setCardAmount('');
    setUdhaarAmount('');
  };

  const handlePresetAllUpi = () => {
    setCashAmount('');
    setCashTendered('');
    setUpiAmount(String(grandTotal));
    setCardAmount('');
    setUdhaarAmount('');
  };

  const handlePresetAllCash = () => {
    setCashAmount(String(grandTotal));
    setCashTendered(String(grandTotal));
    setUpiAmount('');
    setCardAmount('');
    setUdhaarAmount('');
  };

  const handleCopyUpiLink = () => {
    if (!upiUrl) return;
    navigator.clipboard?.writeText(upiUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleConfirm = () => {
    if (!isBalanced) return;
    onConfirmSplit?.({
      cashPaid: numCash,
      cashTendered: numTendered,
      cashChangeReturn,
      upiPaid: numUpi,
      cardPaid: numCard,
      udhaarAmount: numUdhaar,
      upiRef,
      notes: notes || `Split: Cash ${currency}${numCash} + UPI ${currency}${numUpi}${numCard ? ` + Card ${currency}${numCard}` : ''}${numUdhaar ? ` + Udhaar ${currency}${numUdhaar}` : ''}`
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#080B1A] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-midnight-900 to-violet-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Split className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  Multi-Tender Split Payment
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    Live Balance Engine
                  </span>
                </h2>
                <p className="text-xs text-[#B69CFF]/70">
                  Combine Cash, UPI, and Card into one settlement
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            
            {/* Grand Total Bar & Status */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B69CFF]/60">Total Bill Amount</span>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  <span>{currency}</span>
                  <span>{grandTotal.toLocaleString('en-IN')}</span>
                  {customerName && (
                    <span className="text-xs font-medium text-[#00E5FF] ml-2">
                      ({customerName})
                    </span>
                  )}
                </div>
              </div>

              {/* Live Remaining Balance Pill */}
              <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 transition-all ${
                isBalanced 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' 
                  : balanceRemaining > 0 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              }`}>
                {isBalanced ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5 animate-pulse" />
                )}
                <div>
                  <div className="text-[10px] font-bold uppercase">
                    {isBalanced ? 'Bill Fully Settled' : balanceRemaining > 0 ? 'Remaining to Allocate' : 'Over-Allocated'}
                  </div>
                  <div className="text-base font-black">
                    {isBalanced ? '100% Balanced' : `${currency}${Math.abs(balanceRemaining).toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-xs font-semibold text-[#B69CFF]/60 mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={handlePreset5050}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold transition"
              >
                50% Cash + 50% UPI
              </button>
              <button
                type="button"
                onClick={handlePresetRoundCash}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold transition"
              >
                Round Cash + Remainder UPI
              </button>
              <button
                type="button"
                onClick={handlePresetAllUpi}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-blue-500/20 border border-white/[0.08] hover:border-blue-500/40 text-xs font-semibold transition"
              >
                All UPI
              </button>
              <button
                type="button"
                onClick={handlePresetAllCash}
                className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold transition"
              >
                All Cash
              </button>
            </div>

            {/* Split Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Cash Portion */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Banknote className="h-4 w-4" />
                    <span>Cash Payment</span>
                  </div>
                  <span className="text-xs text-slate-400">Cash in Hand</span>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0D1226] border border-white/[0.1] text-white font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Cash Tendered & Change Return */}
                {numCash > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Customer Tendered Note:</span>
                      <input
                        type="number"
                        placeholder={String(numCash)}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg bg-[#0D1226] border border-white/[0.1] text-right font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    {cashChangeReturn > 0 && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                        <span>Change to Return:</span>
                        <span className="text-sm font-black">{currency}{cashChangeReturn}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* UPI Portion */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00E5FF] font-bold text-sm">
                    <QrCode className="h-4 w-4" />
                    <span>UPI Payment</span>
                  </div>
                  <span className="text-xs text-slate-400">QR / Intent</span>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0D1226] border border-white/[0.1] text-white font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                    />
                  </div>
                </div>

                {numUpi > 0 && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <input
                      type="text"
                      placeholder="UPI Ref / UTR No. (optional)"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D1226] border border-white/[0.1] text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
                    />
                  </div>
                )}
              </div>

              {/* Card / POS Machine */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#713CFF] font-bold text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Card Swipe / POS</span>
                  </div>
                  <span className="text-xs text-slate-400">Debit / Credit</span>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0D1226] border border-white/[0.1] text-white font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#713CFF]"
                    />
                  </div>
                </div>
              </div>

              {/* Udhaar / Customer Credit */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <UserCheck className="h-4 w-4" />
                    <span>Customer Udhaar</span>
                  </div>
                  <span className="text-xs text-slate-400">Ledger Balance</span>
                </div>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={udhaarAmount}
                      onChange={(e) => setUdhaarAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0D1226] border border-white/[0.1] text-white font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Dynamic Live UPI QR Code Drawer */}
            {numUpi > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-violet-950/20 border border-[#00E5FF]/20 flex flex-col sm:flex-row items-center gap-5">
                <div 
                  className="bg-white p-2 rounded-2xl shadow-xl flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: qrSvgMarkup }}
                />
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="h-4 w-4 text-[#00E5FF]" />
                    <span className="text-xs font-bold text-[#00E5FF] uppercase tracking-wider">
                      Dynamic UPI Portion QR
                    </span>
                  </div>
                  <div className="text-xl font-black text-white">
                    Scan {currency}{numUpi.toLocaleString('en-IN')} with any UPI App
                  </div>
                  <p className="text-xs text-[#B69CFF]/80">
                    Works with Google Pay, PhonePe, Paytm, BHIM, CRED or bank UPI apps.
                  </p>
                  <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={handleCopyUpiLink}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedLink ? 'Copied Link!' : 'Copy UPI Link'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      VPA: {storeUpiId}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Note input */}
            <div>
              <input
                type="text"
                placeholder="Optional split transaction remarks or bank notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0D1226] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/[0.08] bg-[#080B1A] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isBalanced}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)] transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Confirm & Settle {currency}{grandTotal.toLocaleString('en-IN')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
