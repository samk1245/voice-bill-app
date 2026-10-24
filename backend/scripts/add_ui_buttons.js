import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dashboardPath = path.resolve(__dirname, '../../frontend/src/pages/Dashboards/VendorDashboard.jsx');

let c = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add "Day-End Closing" button to Dashboard header
if (!c.includes('Day-End Closing (Z-Report)')) {
  c = c.replace(
    `<button
                    onClick={() => setActiveTab('billing')}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Create Voice Bill</span>
                  </button>`,
    `<button
                    onClick={() => setShowCashDrawerModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Landmark className="h-4 w-4 text-emerald-600" />
                    <span>Day-End Closing (Z-Report)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-2"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Create Voice Bill</span>
                  </button>`
  );
}

// 2. Add "Export Invoices CSV" in Invoices header
if (!c.includes('Export Invoices CSV')) {
  c = c.replace(
    `<h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Invoices & Receipts History ({bills.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    View, reprint thermal receipts, download A4 tax PDFs, or share via WhatsApp.
                  </p>
                </div>
              </div>`,
    `<h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Invoices & Receipts History ({bills.length})
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    View, reprint thermal receipts, download A4 tax PDFs, or share via WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const ok = exportInvoicesToCSV(bills);
                    if (ok) addToast('Exported invoices to CSV file!', 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:text-violet-600 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Invoices CSV</span>
                </button>
              </div>`
  );
}

// 3. Add "Export Catalog CSV" in Products header
if (!c.includes('Export Catalog CSV')) {
  c = c.replace(
    `<button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
                        price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10,
                        status: 'Active', image: '', isService: false, batchNumber: '', expiryDate: ''
                      });
                      setShowProductModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Item</span>
                  </button>`,
    `<button
                    onClick={() => {
                      const ok = exportProductsToCSV(products);
                      if (ok) addToast('Exported product catalog to CSV file!', 'success');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:text-violet-600 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Catalog CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        name: '', sku: '', barcode: '', category: 'General', unit: 'piece',
                        price: '', costPrice: '', taxRate: 5, stock: '', lowStockAlertLimit: 10,
                        status: 'Active', image: '', isService: false, batchNumber: '', expiryDate: ''
                      });
                      setShowProductModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Item</span>
                  </button>`
  );
}

// 4. Add "Export Ledger CSV" and "WhatsApp Reminder" in Customers tab
if (!c.includes('Export Ledger CSV')) {
  c = c.replace(
    `<h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Customer Directory & Udhaar Ledger
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Track customer credit balances, payment histories, and contact info.
                  </p>
                </div>
              </div>`,
    `<h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    Customer Directory & Udhaar Ledger
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Track customer credit balances, payment histories, and contact info.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const ok = exportCustomersToCSV(customers);
                    if (ok) addToast('Exported customer ledger to CSV file!', 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:text-violet-600 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Ledger CSV</span>
                </button>
              </div>`
  );

  // Add WhatsApp payment reminder button next to "Record Payment"
  c = c.replace(
    `<button
                                onClick={() => {
                                  setPayUdhaarCustomer(c);
                                  setPayUdhaarAmount(String(c.pendingCredit));
                                  setShowPayUdhaarModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition"
                              >
                                Record Payment
                              </button>`,
    `<div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={\`https://wa.me/\${(c.mobile || '').replace(/\\D/g, '')}?text=\${encodeURIComponent(
                                    \`🙏 Namaste \${c.name} ji,\\nAapke store *\${selectedStore?.name || 'Hamari Dukan'}* par kul *\${currency}\${c.pendingCredit}* ka Udhaar balance baaki hai.\\nKripya shighra bhugtan karein.\\n\` +
                                    (selectedStore?.upiId ? \`💳 UPI ID: \${selectedStore.upiId}\\n\\n\` : '') +
                                    \`Dhanyawad!\\n_\${selectedStore?.name || 'VoiceBill AI'}_\`
                                  )}\`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition flex items-center gap-1 text-[11px]"
                                  title="Send WhatsApp payment reminder"
                                >
                                  <Share2 className="h-3 w-3" />
                                  <span>Reminder</span>
                                </a>
                                <button
                                  onClick={() => {
                                    setPayUdhaarCustomer(c);
                                    setPayUdhaarAmount(String(c.pendingCredit));
                                    setShowPayUdhaarModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-300 font-bold hover:bg-violet-100 transition"
                                >
                                  Pay
                                </button>
                              </div>`
  );
}

// 5. Add "Export Expenses CSV" in Expenses header
if (!c.includes('Export Expenses CSV')) {
  c = c.replace(
    `<button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log New Expense</span>
                </button>`,
    `<button
                  onClick={() => {
                    const ok = exportExpensesToCSV(expenses);
                    if (ok) addToast('Exported expenses to CSV file!', 'success');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200 hover:text-violet-600 font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Expenses CSV</span>
                </button>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-glow-violet transition flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log New Expense</span>
                </button>`
  );
}

// 6. Add Loyalty Points Card in Active Bill Tape
if (!c.includes('Loyalty Points:')) {
  const loyaltyCard = `
                    {/* Customer Loyalty Points Redemption */}
                    {customerLoyaltyPoints > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs animate-fade-in">
                        <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium truncate pr-2">
                          <Award className="h-4 w-4 text-amber-500 min-w-4" />
                          <span className="truncate">Loyalty: <strong>{customerLoyaltyPoints} pts</strong> ({currency}{customerLoyaltyPoints} discount value)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (redeemedPoints > 0) {
                              setRedeemedPoints(0);
                              addToast('Cancelled points redemption', 'info');
                            } else {
                              setRedeemedPoints(customerLoyaltyPoints);
                              addToast(\`Redeemed \${customerLoyaltyPoints} points for \${currency}\${customerLoyaltyPoints} discount!\`, 'success');
                            }
                          }}
                          className={\`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition \${
                            redeemedPoints > 0 
                              ? 'bg-amber-500 text-white shadow-sm' 
                              : 'bg-white dark:bg-navy-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100'
                          }\`}
                        >
                          {redeemedPoints > 0 ? '✓ Redeemed' : 'Redeem'}
                        </button>
                      </div>
                    )}
`;

  c = c.replace(
    `{/* Cart Items List with Photos */}`,
    loyaltyCard + `\n                    {/* Cart Items List with Photos */}`
  );
}

fs.writeFileSync(dashboardPath, c, 'utf8');
console.log('UI buttons and Loyalty points added successfully!');
