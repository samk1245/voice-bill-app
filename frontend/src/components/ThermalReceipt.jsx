import React, { useState } from 'react';
import { Printer, Share2, Download, X, Check, Smartphone, FileText } from 'lucide-react';

export default function ThermalReceipt({ invoice, store, onClose }) {
  const [receiptType, setReceiptType] = useState('thermal'); // 'thermal' | 'tax_invoice'
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  // Build UPI URI for genuine QR code scanning (GPay, PhonePe, Paytm, BHIM)
  const upiId = store?.upiId || 'shop@upi';
  const payeeName = encodeURIComponent(store?.name || 'Local Shop');
  const upiAmount = invoice.totalAmount || 0;
  const upiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${upiAmount}&cu=INR&tn=Bill-${invoice.invoiceNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}&margin=4`;

  // WhatsApp prefilled message
  const itemsSummary = (invoice.items || [])
    .map(i => `• ${i.name} (${i.quantity} ${i.unit}) - ₹${i.price * i.quantity}`)
    .join('\n');
  const whatsappText = encodeURIComponent(
    `🙏 *${store?.name || 'VoiceBill AI'}*\n` +
    `🧾 *Invoice #${invoice.invoiceNumber}*\n` +
    `📅 Date: ${new Date(invoice.createdAt).toLocaleDateString()}\n\n` +
    `*Items:*\n${itemsSummary}\n\n` +
    `Subtotal: ₹${invoice.subtotal}\n` +
    (invoice.discount > 0 ? `Discount: -₹${invoice.discount}\n` : '') +
    `Tax/GST: ₹${invoice.tax}\n` +
    `*Grand Total: ₹${invoice.totalAmount}*\n` +
    `Payment Mode: ${invoice.paymentMethod}\n\n` +
    (store?.upiId ? `Pay via UPI: ${store.upiId}\n\n` : '') +
    `_Thank you for shopping with us!_`
  );
  const whatsappUrl = `https://wa.me/${invoice.customerMobile ? `91${invoice.customerMobile}` : ''}?text=${whatsappText}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const rawText = decodeURIComponent(whatsappText);
    navigator.clipboard?.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] my-auto">
        
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReceiptType('thermal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                receiptType === 'thermal'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              🧾 Thermal (58mm)
            </button>
            <button
              onClick={() => setReceiptType('tax_invoice')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                receiptType === 'tax_invoice'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              📄 GST Tax Invoice
            </button>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto py-4 flex justify-center">
          
          {/* THERMAL 58MM PAPER SLIP */}
          {receiptType === 'thermal' ? (
            <div 
              id="printable-receipt"
              className="w-full max-w-[340px] bg-[#fafaf9] text-slate-900 p-5 rounded-t-lg font-mono text-[11px] shadow-2xl border-t-8 border-emerald-500 relative select-none"
              style={{
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.4)',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
              }}
            >
              {/* Jagged bottom edge simulation using CSS border pattern */}
              <div 
                className="absolute -bottom-3 left-0 right-0 h-3 bg-repeat-x"
                style={{
                  backgroundImage: 'radial-gradient(circle, transparent, transparent 50%, #fafaf9 50%, #fafaf9 100%)',
                  backgroundSize: '12px 12px'
                }}
              />

              {/* Shop Header */}
              <div className="text-center space-y-0.5 pb-3 border-b-2 border-dashed border-slate-400">
                <div className="inline-block px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded uppercase tracking-wider mb-1">
                  OFFICIAL RECEIPT
                </div>
                <h3 className="text-base font-black tracking-tight uppercase">{store?.name || 'Apna Kirana Store'}</h3>
                <p className="text-[10px] text-slate-600 leading-tight">{store?.address || 'Main Market, Local City'}</p>
                {store?.gstNumber && (
                  <p className="text-[9px] font-bold text-slate-700">GSTIN: {store.gstNumber}</p>
                )}
                {store?.upiId && (
                  <p className="text-[9px] text-slate-600">UPI: {store.upiId}</p>
                )}
              </div>

              {/* Meta Info */}
              <div className="py-2 border-b border-dashed border-slate-300 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill No: <strong className="font-bold">{invoice.invoiceNumber}</strong></span>
                  <span>Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer: <strong className="font-bold">{invoice.customerName || 'Cash'}</strong></span>
                  <span>{new Date(invoice.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {invoice.customerMobile && (
                  <div>Mobile: {invoice.customerMobile}</div>
                )}
              </div>

              {/* Items Table */}
              <div className="py-2 border-b-2 border-dashed border-slate-400 space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-300 pb-1">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/4 text-center">QTY</span>
                  <span className="w-1/4 text-right">AMT</span>
                </div>

                {(invoice.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[10px]">
                    <div className="w-1/2 pr-1 font-semibold leading-tight">
                      {item.name}
                      <span className="block text-[8px] text-slate-500 font-normal">@₹{item.price}/{item.unit}</span>
                    </div>
                    <div className="w-1/4 text-center text-slate-700">
                      {item.quantity} {item.unit}
                    </div>
                    <div className="w-1/4 text-right font-bold">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="py-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Savings:</span>
                    <span>-₹{invoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>CGST + SGST:</span>
                  <span>₹{invoice.tax}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-950 pt-1.5 border-t-2 border-dashed border-slate-900">
                  <span>NET TOTAL:</span>
                  <span className="text-base">₹{invoice.totalAmount}</span>
                </div>
                {invoice.paymentMethod === 'Cash' && invoice.cashReceived > 0 && (
                  <div className="text-[10px] pt-1 text-slate-600 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Cash Paid:</span>
                      <span>₹{invoice.cashReceived}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Change Returned:</span>
                      <span>₹{invoice.changeReturn}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* UPI Dynamic QR Code */}
              <div className="mt-2 pt-2 border-t-2 border-dashed border-slate-400 text-center flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 mb-1">Scan & Pay Any UPI App</span>
                <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
                  <img
                    src={qrUrl}
                    alt="UPI QR Code"
                    className="h-28 w-28 object-contain"
                    onError={(e) => {
                      // Fallback SVG if image server unavailable
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-[8px] font-mono font-bold text-slate-600 mt-1">GPay • PhonePe • Paytm • BHIM</span>
              </div>

              {/* Footer barcode & greeting */}
              <div className="mt-3 text-center space-y-1 pt-2 border-t border-slate-300">
                <div className="tracking-widest font-mono text-[10px] font-bold text-slate-700">
                  ||||| | |||| ||| ||||||| | |||
                </div>
                <p className="text-[9px] font-bold text-slate-800">*** Thank You! Visit Again ***</p>
                <p className="text-[8px] text-slate-500">Voice-Powered by VoiceBill AI</p>
              </div>

            </div>
          ) : (
            /* TAX INVOICE A4 FORMAT */
            <div className="w-full bg-white text-slate-900 p-6 rounded-2xl font-sans text-xs shadow-xl space-y-4 border border-slate-300">
              <div className="flex justify-between items-start border-b border-slate-300 pb-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase">{store?.name}</h2>
                  <p className="text-slate-600 text-[11px]">{store?.address}</p>
                  <p className="text-[11px] font-mono">GSTIN: {store?.gstNumber || 'Unregistered'}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-600">TAX INVOICE</div>
                  <div className="text-[11px] font-mono text-slate-600">#{invoice.invoiceNumber}</div>
                  <div className="text-[10px] text-slate-500">{new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl flex justify-between text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Billed To:</span>
                  <span className="font-bold text-slate-800">{invoice.customerName || 'Cash Customer'}</span>
                  {invoice.customerMobile && <span className="block text-slate-600 font-mono">{invoice.customerMobile}</span>}
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Payment Method:</span>
                  <span className="font-bold text-slate-800">{invoice.paymentMethod}</span>
                  <span className="block text-emerald-600 font-bold">PAID</span>
                </div>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-[10px] uppercase font-bold text-slate-700">
                    <th className="py-1.5">Item Description</th>
                    <th className="py-1.5 text-center">Qty</th>
                    <th className="py-1.5 text-right">Price</th>
                    <th className="py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(invoice.items || []).map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-semibold">{i.name}</td>
                      <td className="py-2 text-center text-slate-600">{i.quantity} {i.unit}</td>
                      <td className="py-2 text-right">₹{i.price}</td>
                      <td className="py-2 text-right font-bold">₹{i.price * i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-end border-t border-slate-300 pt-3">
                <div className="text-[10px] text-slate-500 max-w-[200px]">
                  Payment received with thanks. Computer generated invoice without signature.
                </div>
                <div className="space-y-1 text-right text-[11px] min-w-[140px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-₹{invoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST Tax:</span>
                    <span>₹{invoice.tax}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-400 pt-1">
                    <span>Total:</span>
                    <span className="text-emerald-700">₹{invoice.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 shrink-0">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4 text-emerald-400" />
            <span>Print Slip</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 text-center shadow-lg shadow-emerald-500/20"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleCopySummary}
            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <FileText className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy Bill'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
