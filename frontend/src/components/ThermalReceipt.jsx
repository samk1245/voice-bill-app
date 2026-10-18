import React, { useState, useRef } from 'react';
import { 
  Printer, Share2, Download, X, Check, Smartphone, FileText, 
  Copy, RefreshCw, CheckCircle2, QrCode, ArrowLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ThermalReceipt({ invoice, store, onClose, onNewBill }) {
  const [receiptType, setReceiptType] = useState('thermal'); // 'thermal' | 'a4'
  const [thermalWidth, setThermalWidth] = useState('58mm'); // '58mm' | '80mm'
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!invoice) return null;

  // Build UPI URI for dynamic, scannable QR Code
  const upiId = store?.upiId || 'shop@upi';
  const payeeName = encodeURIComponent(store?.name || 'Local Shop');
  const upiAmount = invoice.totalAmount || 0;
  const upiUri = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${upiAmount}&cu=INR&tn=Invoice-${invoice.invoiceNumber}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUri)}&margin=4`;

  // WhatsApp prefilled message
  const itemsSummary = (invoice.items || [])
    .map(i => `• ${i.name} (${i.quantity} ${i.unit || 'pcs'}) @ ₹${i.price} = ₹${i.lineTotal || (i.price * i.quantity)}`)
    .join('\n');

  const whatsappText = encodeURIComponent(
    `🙏 *${store?.name || 'VoiceBill AI'}*\n` +
    `🧾 *Tax Invoice #${invoice.invoiceNumber}*\n` +
    `📅 Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n` +
    `*Items:*\n${itemsSummary}\n\n` +
    `Subtotal: ₹${invoice.subtotal}\n` +
    (invoice.discount > 0 ? `Discount: -₹${invoice.discount}\n` : '') +
    `Tax (GST): ₹${invoice.tax}\n` +
    `*Grand Total: ₹${invoice.totalAmount}*\n` +
    `Amount Paid: ₹${invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.totalAmount}\n` +
    (invoice.balanceDue > 0 ? `*Balance Due: ₹${invoice.balanceDue}*\n` : '') +
    `Payment Status: ${invoice.paymentStatus || 'Paid'} (${invoice.paymentMethod || 'Cash'})\n\n` +
    (store?.upiId ? `Pay online via UPI: ${store.upiId}\n\n` : '') +
    `_Thank you for your business!_`
  );

  const customerPhoneClean = (invoice.customerMobile || '').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${customerPhoneClean ? `91${customerPhoneClean}` : ''}?text=${whatsappText}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const elementId = receiptType === 'thermal' ? 'printable-receipt' : 'printable-a4-invoice';
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      setIsGeneratingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const isThermal = receiptType === 'thermal';
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: isThermal ? (thermalWidth === '58mm' ? [58, 200] : [80, 240]) : 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoice.invoiceNumber || 'bill'}.pdf`);
    } catch (err) {
      console.error('PDF generation error, falling back to window.print():', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopySummary = () => {
    const rawText = decodeURIComponent(whatsappText);
    navigator.clipboard?.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] my-auto overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Layout:</span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
              <button
                onClick={() => setReceiptType('thermal')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  receiptType === 'thermal'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🧾 Thermal Slip
              </button>
              <button
                onClick={() => setReceiptType('a4')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  receiptType === 'a4'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📄 A4 Tax Invoice
              </button>
            </div>

            {receiptType === 'thermal' && (
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 text-xs">
                <button
                  onClick={() => setThermalWidth('58mm')}
                  className={`px-2.5 py-1 rounded font-medium ${thermalWidth === '58mm' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  58mm
                </button>
                <button
                  onClick={() => setThermalWidth('80mm')}
                  className={`px-2.5 py-1 rounded font-medium ${thermalWidth === '80mm' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  80mm
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close Preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp Bill
            </a>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Copy Summary Text"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {onNewBill && (
            <button
              onClick={() => {
                onClose();
                onNewBill();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New Bill
            </button>
          )}
        </div>

        {/* Printable Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/50 flex justify-center">
          
          {/* LAYOUT 1: THERMAL RECEIPT (58mm / 80mm) */}
          {receiptType === 'thermal' && (
            <div
              id="printable-receipt"
              style={{ width: thermalWidth === '58mm' ? '280px' : '360px' }}
              className="bg-white text-slate-900 p-5 rounded-lg shadow-md font-mono text-[11px] leading-relaxed border border-slate-200 select-none"
            >
              {/* Store Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-bold text-sm uppercase tracking-wide">{store?.name || 'VOICEBILL STORE'}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{store?.address || 'Main Market, City'}</div>
                {store?.gstNumber && (
                  <div className="text-[10px] text-slate-700 font-semibold mt-0.5">GSTIN: {store.gstNumber}</div>
                )}
                {store?.phone && (
                  <div className="text-[10px] text-slate-600">Ph: {store.phone}</div>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="py-2 border-b border-dashed border-slate-400 flex justify-between text-[10px]">
                <div>
                  <div><span className="font-bold">INV:</span> #{invoice.invoiceNumber}</div>
                  <div><span className="font-bold">Date:</span> {new Date(invoice.createdAt).toLocaleDateString('en-IN')}</div>
                  <div><span className="font-bold">Time:</span> {new Date(invoice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="text-right">
                  <div><span className="font-bold">Cust:</span> {invoice.customerName || 'Walk-in'}</div>
                  {invoice.customerMobile && <div>Ph: {invoice.customerMobile}</div>}
                  <div><span className="font-bold">Mode:</span> {invoice.paymentMethod || 'Cash'}</div>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold pb-1 text-[10px] border-b border-slate-200">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/4 text-center">QTY</span>
                  <span className="w-1/4 text-right">AMT</span>
                </div>
                <div className="pt-1.5 space-y-1.5">
                  {(invoice.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[10.5px]">
                      <div className="w-1/2">
                        <div className="font-semibold leading-tight">{item.name}</div>
                        <div className="text-[9px] text-slate-500">
                          ₹{item.price}/{item.unit || 'pc'}
                          {item.taxRate ? ` • GST ${item.taxRate}%` : ''}
                        </div>
                      </div>
                      <div className="w-1/4 text-center text-slate-700">
                        {item.quantity} {item.unit || 'pcs'}
                      </div>
                      <div className="w-1/4 text-right font-medium">
                        ₹{(item.lineTotal || (item.price * item.quantity)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Tax Breakdown */}
              <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-slate-400">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{Number(invoice.subtotal || 0).toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount:</span>
                    <span>-₹{Number(invoice.discount).toFixed(2)}</span>
                  </div>
                )}
                {invoice.taxBreakdown ? (
                  <>
                    {invoice.taxBreakdown.cgst > 0 && (
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>CGST:</span>
                        <span>₹{Number(invoice.taxBreakdown.cgst).toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.taxBreakdown.sgst > 0 && (
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>SGST:</span>
                        <span>₹{Number(invoice.taxBreakdown.sgst).toFixed(2)}</span>
                      </div>
                    )}
                    {invoice.taxBreakdown.igst > 0 && (
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>IGST:</span>
                        <span>₹{Number(invoice.taxBreakdown.igst).toFixed(2)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-slate-600">
                    <span>GST/Tax:</span>
                    <span>₹{Number(invoice.tax || 0).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-300">
                  <span>GRAND TOTAL:</span>
                  <span>₹{Number(invoice.totalAmount || 0).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
                  <span>Paid ({invoice.paymentMethod || 'Cash'}):</span>
                  <span>₹{Number(invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.totalAmount).toFixed(2)}</span>
                </div>

                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between text-[11px] font-bold text-red-600 pt-0.5">
                    <span>BALANCE DUE:</span>
                    <span>₹{Number(invoice.balanceDue).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* UPI QR Code */}
              {store?.upiId && (
                <div className="py-2.5 text-center flex flex-col items-center border-b border-dashed border-slate-400">
                  <div className="text-[10px] font-semibold text-slate-700 mb-1">SCAN TO PAY VIA UPI</div>
                  <img
                    src={qrUrl}
                    alt="UPI QR Code"
                    className="w-24 h-24 border border-slate-300 p-1 rounded bg-white shadow-sm"
                  />
                  <div className="text-[9px] text-slate-500 mt-1">{store.upiId}</div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 text-center text-[10px] text-slate-500">
                <div>Thank you for visiting! Please visit again.</div>
                <div className="text-[8px] text-slate-400 mt-1">Generated by VoiceBill AI System</div>
              </div>
            </div>
          )}

          {/* LAYOUT 2: A4 GST TAX INVOICE */}
          {receiptType === 'a4' && (
            <div
              id="printable-a4-invoice"
              className="w-full max-w-2xl bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 text-xs select-none"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">{store?.name || 'VOICEBILL STORE'}</h1>
                  <p className="text-slate-600 text-xs mt-1 max-w-xs">{store?.address || 'Shop No. 5, Main Commercial Complex, New Delhi'}</p>
                  <p className="text-slate-600 text-xs mt-0.5">Phone: {store?.phone || '+91 98765 43210'} | Email: {store?.email || 'billing@store.in'}</p>
                  {store?.gstNumber && (
                    <p className="text-slate-800 text-xs font-semibold mt-1">GSTIN: {store.gstNumber}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded border border-blue-200">
                    TAX INVOICE
                  </span>
                  <div className="mt-2 text-xs">
                    <span className="font-semibold text-slate-600">Invoice #: </span>
                    <span className="font-bold text-slate-900">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Date: <span className="font-medium text-slate-900">{new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Payment Status: <span className={`font-bold ${invoice.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{invoice.paymentStatus || 'Paid'}</span>
                  </div>
                </div>
              </div>

              {/* Buyer & Bill Details */}
              <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200 bg-slate-50/50 p-4 rounded-lg my-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Billed To (Customer):</h3>
                  <p className="font-bold text-slate-900 text-sm">{invoice.customerName || 'Walk-in Cash Customer'}</p>
                  {invoice.customerAddress && (
                    <p className="text-slate-600 text-xs mt-0.5">{invoice.customerAddress}</p>
                  )}
                  {invoice.customerMobile && (
                    <p className="text-slate-600 text-xs mt-0.5">Phone: {invoice.customerMobile}</p>
                  )}
                  {invoice.customerGstin && (
                    <p className="text-slate-800 text-xs font-semibold mt-0.5">Customer GSTIN: {invoice.customerGstin}</p>
                  )}
                </div>

                <div className="text-right">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Payment Details:</h3>
                  <p className="text-slate-700 text-xs"><span className="font-medium">Payment Mode:</span> {invoice.paymentMethod || 'Cash'}</p>
                  <p className="text-slate-700 text-xs mt-0.5"><span className="font-medium">Amount Received:</span> ₹{Number(invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.totalAmount).toFixed(2)}</p>
                  {invoice.balanceDue > 0 && (
                    <p className="text-red-600 font-bold text-xs mt-0.5">Balance Outstanding: ₹{Number(invoice.balanceDue).toFixed(2)}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 uppercase tracking-wider text-[10px] bg-slate-100">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-2 text-center">SKU</th>
                      <th className="py-2 px-2 text-right">Unit Price</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Tax (%)</th>
                      <th className="py-2 px-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(invoice.items || []).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-2 text-center text-slate-500 font-mono text-[10px]">{item.sku || 'N/A'}</td>
                        <td className="py-2.5 px-2 text-right text-slate-700">₹{Number(item.price).toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-center font-medium text-slate-900">{item.quantity} {item.unit || 'pcs'}</td>
                        <td className="py-2.5 px-2 text-right text-slate-600">{item.taxRate || 0}%</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{Number(item.lineTotal || (item.price * item.quantity)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-start">
                <div className="w-1/2 pr-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-[11px] text-slate-800 mb-1">Terms & Conditions:</h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      1. Goods once sold will be accepted for exchange within 7 days with original receipt.<br />
                      2. Subject to local municipal jurisdiction.<br />
                      3. E. & O.E.
                    </p>
                  </div>
                </div>

                <div className="w-1/2 max-w-xs space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span>₹{Number(invoice.subtotal || 0).toFixed(2)}</span>
                  </div>

                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-₹{Number(invoice.discount).toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.taxBreakdown ? (
                    <>
                      {invoice.taxBreakdown.cgst > 0 && (
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>CGST:</span>
                          <span>₹{Number(invoice.taxBreakdown.cgst).toFixed(2)}</span>
                        </div>
                      )}
                      {invoice.taxBreakdown.sgst > 0 && (
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>SGST:</span>
                          <span>₹{Number(invoice.taxBreakdown.sgst).toFixed(2)}</span>
                        </div>
                      )}
                      {invoice.taxBreakdown.igst > 0 && (
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>IGST:</span>
                          <span>₹{Number(invoice.taxBreakdown.igst).toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>Total Tax (GST):</span>
                      <span>₹{Number(invoice.tax || 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span className="text-blue-700">₹{Number(invoice.totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600 text-xs">
                    <span>Amount Received:</span>
                    <span>₹{Number(invoice.amountPaid !== undefined ? invoice.amountPaid : invoice.totalAmount).toFixed(2)}</span>
                  </div>

                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-between text-xs font-bold text-red-600">
                      <span>Balance Outstanding:</span>
                      <span>₹{Number(invoice.balanceDue).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature Line */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[10px] text-slate-400">
                  This is a computer-generated invoice and requires no physical signature.
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800 text-xs">For {store?.name || 'VoiceBill Store'}</div>
                  <div className="mt-8 border-t border-slate-400 w-36 ml-auto"></div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Authorized Signatory</div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
