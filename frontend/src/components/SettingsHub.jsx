import React, { useState, useEffect } from 'react';
import { 
  Store, Receipt, QrCode, Printer, Mic, Database, 
  History, Check, Save, Upload, Download, Sparkles, 
  AlertCircle, Shield, Award, Sliders, CheckCircle2
} from 'lucide-react';

export default function SettingsHub({
  store,
  onUpdateStore,
  token,
  addToast,
  soundEnabled,
  setSoundEnabled,
  talkbackEnabled,
  setTalkbackEnabled,
  voiceLang,
  setVoiceLang,
  currency,
  setCurrency,
  onOpenTemplateModal,
  bills = [],
  expenses = []
}) {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: store?.name || '',
    category: store?.category || 'Kirana & Grocery',
    tagline: store?.tagline || 'Your Friendly Neighborhood Smart Store',
    phone: store?.phone || store?.mobile || '9876543210',
    email: store?.email || 'store@voicebill.com',
    address: store?.address || 'Shop No. 5, Sector 4, Rohini, New Delhi 110085',
    logoUrl: store?.logoUrl || '',
    gstNumber: store?.gstNumber || '07AAAAA0000A1Z5',
    upiId: store?.upiId || 'shop@okhdfcbank',
    currency: store?.currency || currency || '₹',
    invoicePrefix: store?.invoicePrefix || 'VB-',
    defaultTaxRate: store?.defaultTaxRate !== undefined ? store.defaultTaxRate : 5,
    taxInclusive: store?.taxInclusive !== undefined ? store.taxInclusive : false,
    termsAndConditions: store?.termsAndConditions || 'Goods once sold will not be exchanged or refunded without bill.',
    receiptFooter: store?.receiptFooter || 'Thank you for your business! Please visit again.',
    printerFormat: store?.printerFormat || 'thermal',
    autoPrint: store?.autoPrint !== undefined ? store.autoPrint : false
  });

  // Sync if store prop changes
  useEffect(() => {
    if (store) {
      setFormData(prev => ({
        ...prev,
        name: store.name || prev.name,
        category: store.category || prev.category,
        address: store.address || prev.address,
        gstNumber: store.gstNumber || prev.gstNumber,
        upiId: store.upiId || prev.upiId,
        termsAndConditions: store.termsAndConditions || prev.termsAndConditions,
        currency: store.currency || prev.currency,
        invoicePrefix: store.invoicePrefix || prev.invoicePrefix
      }));
    }
  }, [store]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    if (!store?._id) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/stores/${store._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update store settings');
      }

      const updated = await res.json();
      if (onUpdateStore) onUpdateStore(updated);
      if (setCurrency && formData.currency) setCurrency(formData.currency);

      addToast('Store settings saved successfully!', 'success');
    } catch (err) {
      console.error('Save settings error:', err);
      addToast(err.message || 'Error updating settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Full Database Backup Download
  const handleDownloadBackup = async () => {
    if (!store?._id) return;
    try {
      const res = await fetch(`/api/stores/${store._id}/backup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate backup');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voicebill_backup_${store.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('Downloaded complete database backup!', 'success');
    } catch (err) {
      console.error('Backup error:', err);
      addToast('Error downloading backup', 'error');
    }
  };

  // Dynamic UPI QR code preview
  const upiPreviewUri = `upi://pay?pa=${encodeURIComponent(formData.upiId)}&pn=${encodeURIComponent(formData.name)}&cu=INR`;
  const upiQrPreview = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiPreviewUri)}&margin=2`;

  const sections = [
    { id: 'profile', label: 'Store Identity', icon: Store },
    { id: 'tax', label: 'GST & Invoicing', icon: Receipt },
    { id: 'payments', label: 'UPI & Payments', icon: QrCode },
    { id: 'printer', label: 'Printer & POS Hardware', icon: Printer },
    { id: 'voice', label: 'Voice & AI Tuning', icon: Mic },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'audit', label: 'Live Audit Log', icon: History }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            Universal Store Configuration & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Customize business profile, tax rules, invoice formats, UPI QR codes, and hardware preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTemplateModal}
            className="px-3.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 font-bold text-xs hover:bg-violet-100 transition flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>12 Industry Profiles</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <span className="animate-spin">⌛</span> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Layout: Left Nav Pills + Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Navigation Pills */}
        <div className="lg:col-span-1 space-y-1 bg-white dark:bg-navy-800 p-2.5 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-card-soft h-fit">
          {sections.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-glow-violet'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Body Card */}
        <div className="lg:col-span-3 bg-white dark:bg-navy-800 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-card-soft">
          
          {/* SECTION 1: STORE PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Store Identity & Public Profile</h3>
                <p className="text-slate-500">Business details printed on customer receipts and A4 invoices.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Store / Business Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Business Industry Profile</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.category}
                      readOnly
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-700 text-violet-600 dark:text-violet-400 font-bold"
                    />
                    <button
                      type="button"
                      onClick={onOpenTemplateModal}
                      className="px-3 py-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold hover:bg-violet-200"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Store Tagline / Slogan</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="e.g. Quality Groceries at Wholesale Rates"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Billing Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-bold"
                  >
                    <option value="₹">₹ Indian Rupee (INR)</option>
                    <option value="$">$ US Dollar (USD)</option>
                    <option value="€">€ Euro (EUR)</option>
                    <option value="£">£ British Pound (GBP)</option>
                    <option value="د.إ">د.إ UAE Dirham (AED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Contact Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Support Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Shop Physical Address</label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: GST & INVOICING */}
          {activeSection === 'tax' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">GST & Sequential Invoicing Rules</h3>
                <p className="text-slate-500">Configure Indian GST compliance, invoice numbering, and customer terms.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Business GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Invoice Number Prefix</label>
                  <input
                    type="text"
                    value={formData.invoicePrefix}
                    onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                    placeholder="e.g. VB-, INV-, BILL-"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-mono font-bold text-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Default Tax Category Rate</label>
                  <select
                    value={formData.defaultTaxRate}
                    onChange={(e) => handleInputChange('defaultTaxRate', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-bold"
                  >
                    <option value={0}>0% GST (Exempt / Grains / Books)</option>
                    <option value={5}>5% GST (Standard Kirana / Food)</option>
                    <option value={12}>12% GST (Processed Foods / Apparel)</option>
                    <option value={18}>18% GST (Services / Electronics / Hardware)</option>
                    <option value={28}>28% GST (Automotive Luxury Spares)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Tax Calculation Policy</label>
                  <select
                    value={formData.taxInclusive ? 'inclusive' : 'exclusive'}
                    onChange={(e) => handleInputChange('taxInclusive', e.target.value === 'inclusive')}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                  >
                    <option value="exclusive">Tax-Exclusive (GST added on top of subtotal)</option>
                    <option value="inclusive">Tax-Inclusive (Prices already contain GST - MRP)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Invoice Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={formData.termsAndConditions}
                    onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Receipt Footer Note</label>
                  <input
                    type="text"
                    value={formData.receiptFooter}
                    onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                    placeholder="e.g. Thank you for your business! Please visit again."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PAYMENTS & UPI QR */}
          {activeSection === 'payments' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">UPI QR Code & Digital Payments</h3>
                <p className="text-slate-500">Configure your merchant VPA for instant BharatQR / UPI scan-and-pay on receipts.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Merchant UPI VPA ID *</label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      placeholder="e.g. shopname@okhdfcbank or 9876543210@paytm"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-mono font-bold text-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Customers can scan the printed receipt using Google Pay, PhonePe, Paytm, or BHIM UPI to pay invoices directly to your bank account.
                  </p>
                </div>

                {/* Live QR Preview Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Dynamic QR Preview</span>
                  <img
                    src={upiQrPreview}
                    alt="UPI QR Code Preview"
                    className="h-28 w-28 rounded-xl border border-slate-200 dark:border-navy-700 shadow-sm"
                  />
                  <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 font-semibold mt-2">{formData.upiId}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: PRINTER & HARDWARE */}
          {activeSection === 'printer' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">POS Printer & Output Preferences</h3>
                <p className="text-slate-500">Configure thermal receipt printers, auto-print triggers, and page sizes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Default Receipt Format</label>
                  <select
                    value={formData.printerFormat}
                    onChange={(e) => handleInputChange('printerFormat', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-bold"
                  >
                    <option value="thermal">58mm Thermal Slip (ESC/POS Standard)</option>
                    <option value="80mm">80mm Wide Thermal Receipt (Supermarket)</option>
                    <option value="a4">Full A4 Tax Invoice (Office Printers / PDF)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="autoPrintCheck"
                    checked={formData.autoPrint}
                    onChange={(e) => handleInputChange('autoPrint', e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                  <label htmlFor="autoPrintCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                    Automatically trigger print dialog when invoice is finalized
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: VOICE & AI TUNING */}
          {activeSection === 'voice' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Voice Billing & AI Copilot Tuning</h3>
                <p className="text-slate-500">Tune voice recognition language, speech synthesizer accents, and retail beeps.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Speech Recognition Accent</span>
                    <p className="text-slate-400 text-[11px]">Primary language for Web Speech API</p>
                  </div>
                  <select
                    value={voiceLang}
                    onChange={(e) => setVoiceLang(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 font-semibold"
                  >
                    <option value="hi-IN">🇮🇳 Hindi (hi-IN)</option>
                    <option value="en-IN">🇮🇳 English India (en-IN)</option>
                    <option value="en-US">🇺🇸 English US (en-US)</option>
                    <option value="ta-IN">🇮🇳 Tamil (ta-IN)</option>
                    <option value="te-IN">🇮🇳 Telugu (te-IN)</option>
                    <option value="bn-IN">🇮🇳 Bengali (bn-IN)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Voice Talkback (Speech Synthesis)</span>
                    <p className="text-slate-400 text-[11px]">Speaks added items and bill total back in Hindi/English</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={talkbackEnabled}
                    onChange={(e) => setTalkbackEnabled(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Zero-Latency Retail Audio Chimes</span>
                    <p className="text-slate-400 text-[11px]">Barcode scan beeps, success chimes, and delete sweeps</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: BACKUP & RESTORE */}
          {activeSection === 'backup' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Database Backup & Disaster Recovery</h3>
                <p className="text-slate-500">Safely backup all products, invoices, customer ledgers, and expenses.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-violet-600" />
                    <span>Download JSON Backup</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Creates a point-in-time snapshot of your catalog, bills, customers, and expenses.
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition shadow-glow-violet mt-2 flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Backup Now</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Switch Industry Template</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Switch between Kirana, Pharmacy, Fashion, Salon, Cafe, Hardware and pre-seed catalogs.
                  </p>
                  <button
                    onClick={onOpenTemplateModal}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition mt-2 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span>Choose Industry Template</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: LIVE AUDIT TRAIL */}
          {activeSection === 'audit' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="border-b border-slate-100 dark:border-navy-700 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Store Activity Log & Audit Trail</h3>
                <p className="text-slate-500">Traceable historical audit of transactions, invoices, and expenses.</p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {bills.slice(0, 8).map(b => (
                  <div key={b._id} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          Invoice #{b.invoiceNumber} Finalized ({formData.currency}{b.totalAmount})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Billed to {b.customerName} • {b.paymentMethod} ({b.paymentStatus})
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
