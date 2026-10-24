// Universal CSV / Excel data exporter for VoiceBill AI

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 1. Export Invoices
export const exportInvoicesToCSV = (bills) => {
  if (!bills || bills.length === 0) return false;

  const headers = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Customer Mobile',
    'Customer GSTIN',
    'Subtotal',
    'Discount',
    'Tax (GST)',
    'Grand Total',
    'Amount Paid',
    'Balance Due',
    'Payment Method',
    'Payment Status',
    'Items Summary'
  ];

  const rows = bills.map(b => {
    const itemsSummary = (b.items || [])
      .map(i => `${i.name} (x${i.quantity})`)
      .join('; ');

    return [
      `"${b.invoiceNumber || ''}"`,
      `"${b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : ''}"`,
      `"${(b.customerName || '').replace(/"/g, '""')}"`,
      `"${b.customerMobile || ''}"`,
      `"${b.customerGstin || ''}"`,
      b.subtotal || 0,
      b.discount || 0,
      b.tax || 0,
      b.totalAmount || 0,
      b.amountPaid !== undefined ? b.amountPaid : b.totalAmount || 0,
      b.balanceDue || 0,
      `"${b.paymentMethod || 'Cash'}"`,
      `"${b.paymentStatus || 'Paid'}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `VoiceBill_Invoices_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
  return true;
};

// 2. Export Products Catalog
export const exportProductsToCSV = (products) => {
  if (!products || products.length === 0) return false;

  const headers = [
    'SKU',
    'Barcode',
    'Product Name',
    'Category',
    'Unit',
    'Selling Price',
    'Cost Price',
    'Tax Rate (%)',
    'Stock Quantity',
    'Low Stock Limit',
    'Type',
    'Status'
  ];

  const rows = products.map(p => [
    `"${p.sku || ''}"`,
    `"${p.barcode || ''}"`,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.category || 'General').replace(/"/g, '""')}"`,
    `"${p.unit || 'piece'}"`,
    p.price || 0,
    p.costPrice || 0,
    p.taxRate || 0,
    p.isService ? 'N/A' : (p.stock || 0),
    p.lowStockAlertLimit || 10,
    p.isService ? 'Service' : 'Physical Product',
    `"${p.status || 'Active'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `VoiceBill_Products_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
  return true;
};

// 3. Export Customer Udhaar Ledger
export const exportCustomersToCSV = (customers) => {
  if (!customers || customers.length === 0) return false;

  const headers = [
    'Customer ID',
    'Name',
    'Mobile',
    'Email',
    'Address',
    'GSTIN',
    'Pending Udhaar Balance',
    'Ledger Entries Count'
  ];

  const rows = customers.map(c => [
    `"${c._id || ''}"`,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${c.mobile || ''}"`,
    `"${c.email || ''}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    `"${c.gstin || ''}"`,
    c.pendingCredit || 0,
    (c.ledger || []).length
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `VoiceBill_Customers_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
  return true;
};

// 4. Export Expenses
export const exportExpensesToCSV = (expenses) => {
  if (!expenses || expenses.length === 0) return false;

  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount',
    'Payment Method',
    'Reference ID'
  ];

  const rows = expenses.map(e => [
    `"${e.date ? new Date(e.date).toLocaleDateString('en-IN') : ''}"`,
    `"${e.category || 'Miscellaneous'}"`,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.amount || 0,
    `"${e.paymentMethod || 'Cash'}"`,
    `"${e.reference || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `VoiceBill_Expenses_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadCSV(csvContent, filename);
  return true;
};
