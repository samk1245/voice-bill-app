import React from 'react';
import { X, Mic, Keyboard, Zap, Sparkles, Check } from 'lucide-react';

export default function HelpShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + B', action: 'Quick Voice & New Bill workspace' },
    { key: 'Ctrl + M', action: 'Switch to Manual POS Grid mode' },
    { key: 'Ctrl + K', action: 'Focus Global Search bar' },
    { key: 'Ctrl + I', action: 'Open BillMate AI Copilot' },
    { key: 'Space (in Bill)', action: 'Toggle Voice Microphone recording' },
    { key: 'Ctrl + Enter', action: 'Finalize & Save current invoice' },
    { key: 'Ctrl + P', action: 'Print current bill receipt' },
    { key: 'Esc', action: 'Close any active modal or preview' },
  ];

  const voiceExamples = [
    { cmd: '"Add 2 chawal and 1 oil"', desc: 'Adds multiple items simultaneously from catalog' },
    { cmd: '"Add 5 notebooks at 50 rupees each"', desc: 'Adds item with explicit quantity and unit price' },
    { cmd: '"Apply 10 percent discount"', desc: 'Applies bill-level percentage discount automatically' },
    { cmd: '"Set GST to 18 percent"', desc: 'Configures tax rate for current bill' },
    { cmd: '"Change quantity of rice to 5"', desc: 'Modifies line item quantity on the fly' },
    { cmd: '"Remove the notebook"', desc: 'Deletes specific product from current bill' },
    { cmd: '"Customer paid 500 rupees in cash"', desc: 'Records partial or full payment tendered' },
    { cmd: '"Clear the cart"', desc: 'Clears all draft items from the bill tape' },
    { cmd: '"Show me the total"', desc: 'Recalculates and reads out grand total with audio' },
    { cmd: '"Save this bill and print receipt"', desc: 'Finalizes the bill and triggers print dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between bg-slate-50 dark:bg-navy-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-glow-violet">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Keyboard Shortcuts & Voice Command Guide
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up billing operations at the cash counter with natural voice and fast keys.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Keyboard Shortcuts */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Counter Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {shortcuts.map((s, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-xs"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{s.action}</span>
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-navy-800 font-mono font-bold text-violet-600 dark:text-violet-400 border border-slate-300 dark:border-navy-700 shadow-sm text-[11px]">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Multilingual Voice Commands */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Supported Voice Commands (Hindi, English & Hinglish)
            </h3>
            <div className="space-y-2">
              {voiceExamples.map((v, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono text-violet-600 dark:text-violet-300">
                    {v.cmd}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {v.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-glow-violet"
          >
            Got it, Let's Bill!
          </button>
        </div>

      </div>
    </div>
  );
}
