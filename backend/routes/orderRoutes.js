import express from 'express';
import { Order, Product, Customer, Store } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: 2-decimal rounding
const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

// 1. Get all bills/invoices for a store with filtering & search
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { search, paymentStatus, paymentMethod, startDate, endDate } = req.query;

    let orders = await Order.find({ storeId });

    // Filter by search query (invoice number, customer name, customer mobile, or product name)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      orders = orders.filter(order => {
        const inv = (order.invoiceNumber || '').toLowerCase();
        const cName = (order.customerName || '').toLowerCase();
        const cMobile = (order.customerMobile || '').toLowerCase();
        const hasItem = (order.items || []).some(item => (item.name || '').toLowerCase().includes(q));
        return inv.includes(q) || cName.includes(q) || cMobile.includes(q) || hasItem;
      });
    }

    // Filter by paymentStatus
    if (paymentStatus && paymentStatus !== 'All') {
      orders = orders.filter(order => order.paymentStatus === paymentStatus);
    }

    // Filter by paymentMethod
    if (paymentMethod && paymentMethod !== 'All') {
      orders = orders.filter(order => order.paymentMethod === paymentMethod);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime();
      orders = orders.filter(order => new Date(order.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      orders = orders.filter(order => new Date(order.createdAt).getTime() <= end.getTime());
    }

    // Sort descending by date
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    console.error('Fetch bills error:', err);
    res.status(500).json({ message: 'Error fetching bills', error: err.message });
  }
});

// 2. Real-time Analytics & Dashboard Metrics
router.get('/analytics/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const orders = await Order.find({ storeId });
    const customers = await Customer.find({ storeId });
    const products = await Product.find({ storeId });

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todaySales = 0;
    let monthSales = 0;
    let totalBills = orders.length;
    let paidBillsCount = 0;
    let unpaidBillsCount = 0;
    let partialBillsCount = 0;
    let totalTaxCollected = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const productSalesMap = {};
    const dailyMap = {};

    // Initialize last 7 days in dailyMap
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      dailyMap[dKey] = { date: dKey, label, sales: 0, orders: 0 };
    }

    orders.forEach(order => {
      if (order.status === 'Cancelled') return;

      const orderTotal = Number(order.totalAmount || 0);
      const orderDate = new Date(order.createdAt);
      const orderDateStr = order.createdAt ? order.createdAt.slice(0, 10) : '';

      // Today's Sales
      if (orderDateStr === todayStr) {
        todaySales += orderTotal;
      }

      // Month's Sales
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        monthSales += orderTotal;
      }

      // Payment status counts
      if (order.paymentStatus === 'Paid') {
        paidBillsCount++;
      } else if (order.paymentStatus === 'Partial') {
        partialBillsCount++;
      } else {
        unpaidBillsCount++;
      }

      // Tax collections
      const tax = Number(order.tax || 0);
      totalTaxCollected += tax;
      if (order.taxBreakdown) {
        totalCgst += Number(order.taxBreakdown.cgst || 0);
        totalSgst += Number(order.taxBreakdown.sgst || 0);
        totalIgst += Number(order.taxBreakdown.igst || 0);
      } else {
        totalCgst += tax / 2;
        totalSgst += tax / 2;
      }

      // Daily trend mapping
      if (dailyMap[orderDateStr]) {
        dailyMap[orderDateStr].sales = round2(dailyMap[orderDateStr].sales + orderTotal);
        dailyMap[orderDateStr].orders += 1;
      }

      // Product sales frequencies
      (order.items || []).forEach(item => {
        const pKey = item.productId || item.name;
        if (!productSalesMap[pKey]) {
          productSalesMap[pKey] = {
            id: pKey,
            name: item.name,
            quantity: 0,
            revenue: 0,
            unit: item.unit || 'pcs'
          };
        }
        productSalesMap[pKey].quantity += Number(item.quantity || 1);
        productSalesMap[pKey].revenue = round2(
          productSalesMap[pKey].revenue + (Number(item.price || 0) * Number(item.quantity || 1))
        );
      });
    });

    // Top products by quantity
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Outstanding Udhaar from customer ledger
    const outstandingUdhaar = customers.reduce((sum, c) => sum + Number(c.pendingCredit || 0), 0);

    // Low stock items count
    const lowStockCount = products.filter(p => Number(p.stock || 0) <= Number(p.lowStockAlertLimit || 10)).length;

    // Recent 5 bills
    const recentBills = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
      todaySales: round2(todaySales),
      monthSales: round2(monthSales),
      totalBills,
      paidBillsCount,
      unpaidBillsCount,
      partialBillsCount,
      outstandingUdhaar: round2(outstandingUdhaar),
      lowStockCount,
      taxSummary: {
        totalTax: round2(totalTaxCollected),
        cgst: round2(totalCgst),
        sgst: round2(totalSgst),
        igst: round2(totalIgst)
      },
      salesTrends: Object.values(dailyMap),
      topProducts,
      recentBills
    });
  } catch (err) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ message: 'Error generating analytics report', error: err.message });
  }
});

// 3. Create a new verified bill/invoice with strict arithmetic & stock updates
router.post('/create', authenticate, async (req, res) => {
  try {
    const {
      storeId,
      customerName,
      customerMobile,
      customerAddress,
      customerGstin,
      items,
      overallDiscount = 0,
      paymentMethod = 'Cash',
      amountPaid: rawAmountPaid,
      cashReceived,
      changeReturn,
      isInterState = false,
      notes = '',
      allowNegativeStock = false
    } = req.body;

    if (!storeId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Store ID and at least one bill item are required.' });
    }

    // 3a. Verify and recalculate every line item on backend
    let computedSubtotal = 0;
    let computedTotalTax = 0;
    const validatedItems = [];

    for (const item of items) {
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for item: ${item.name}` });
      }

      // Check product in DB to ensure price integrity
      let dbProduct = null;
      if (item.productId) {
        dbProduct = await Product.findById(item.productId);
      } else {
        dbProduct = await Product.findOne({ storeId, name: item.name });
      }

      const unitPrice = dbProduct ? Number(dbProduct.price) : Number(item.price || 0);
      if (unitPrice <= 0 && (!item.price || Number(item.price) <= 0)) {
        return res.status(400).json({ message: `Price cannot be 0 or empty for product "${item.name}". Please set a price.` });
      }

      // Check stock availability
      if (dbProduct && !allowNegativeStock) {
        const currentStock = Number(dbProduct.stock || 0);
        if (currentStock < qty) {
          return res.status(400).json({
            message: `Insufficient stock for "${dbProduct.name}". Requested: ${qty} ${dbProduct.unit}, Available: ${currentStock} ${dbProduct.unit}.`,
            productId: dbProduct._id,
            availableStock: currentStock
          });
        }
      }

      const itemDiscount = Number(item.discount || 0);
      const lineSubtotal = round2(unitPrice * qty);
      const taxable = Math.max(0, round2(lineSubtotal - itemDiscount));
      const taxRate = dbProduct && dbProduct.taxRate !== undefined ? Number(dbProduct.taxRate) : Number(item.taxRate || 0);
      const lineTax = round2(taxable * (taxRate / 100));
      const lineTotal = round2(taxable + lineTax);

      computedSubtotal = round2(computedSubtotal + lineSubtotal);
      computedTotalTax = round2(computedTotalTax + lineTax);

      validatedItems.push({
        productId: dbProduct ? dbProduct._id : (item.productId || `custom_${Date.now()}`),
        sku: dbProduct?.sku || item.sku || 'SKU-GEN',
        name: dbProduct?.name || item.name,
        price: unitPrice,
        quantity: qty,
        unit: dbProduct?.unit || item.unit || 'pcs',
        discount: itemDiscount,
        taxRate,
        taxAmount: lineTax,
        lineTotal,
        image: dbProduct?.image || item.image || ''
      });
    }

    const finalDiscount = Number(overallDiscount || 0);
    const grandTotal = round2(Math.max(0, computedSubtotal - finalDiscount + computedTotalTax));

    // Tax breakdown (CGST + SGST for Intra-state; IGST for Inter-state)
    const taxBreakdown = isInterState
      ? { cgst: 0, sgst: 0, igst: computedTotalTax }
      : { cgst: round2(computedTotalTax / 2), sgst: round2(computedTotalTax / 2), igst: 0 };

    // Payment validation & balance tracking
    let amountPaid = rawAmountPaid !== undefined ? Number(rawAmountPaid) : null;
    if (amountPaid === null) {
      if (paymentMethod === 'Credit/Udhaar' || paymentMethod === 'Udhaar') {
        amountPaid = 0;
      } else {
        amountPaid = grandTotal;
      }
    }
    amountPaid = round2(Math.max(0, amountPaid));
    const balanceDue = round2(Math.max(0, grandTotal - amountPaid));

    let paymentStatus = 'Paid';
    if (balanceDue === grandTotal) {
      paymentStatus = 'Unpaid';
    } else if (balanceDue > 0) {
      paymentStatus = 'Partial';
    }

    // Consecutive Invoice Number Generation (Thread-safe sequential counter)
    const count = await Order.countDocuments({ storeId });
    const invoiceNumber = `VB-${1001 + count}`;

    // Create the finalized Order record
    const newOrder = await Order.create({
      storeId,
      invoiceNumber,
      customerName: customerName ? customerName.trim() : 'Walk-in Customer',
      customerMobile: customerMobile ? customerMobile.trim() : '',
      customerAddress: customerAddress ? customerAddress.trim() : '',
      customerGstin: customerGstin ? customerGstin.trim() : '',
      items: validatedItems,
      subtotal: computedSubtotal,
      discount: finalDiscount,
      tax: computedTotalTax,
      taxBreakdown,
      totalAmount: grandTotal,
      amountPaid,
      balanceDue,
      paymentMethod,
      paymentStatus,
      cashReceived: cashReceived ? Number(cashReceived) : amountPaid,
      changeReturn: changeReturn ? Number(changeReturn) : 0,
      notes,
      status: 'Completed'
    });

    // Decrement stock for inventory products
    for (const item of validatedItems) {
      if (item.productId && !item.productId.toString().startsWith('custom_')) {
        const prod = await Product.findById(item.productId);
        if (prod) {
          const updatedStock = Math.max(0, Number(prod.stock || 0) - item.quantity);
          const historyEntry = {
            date: new Date().toISOString(),
            type: 'sale',
            quantity: -item.quantity,
            resultingStock: updatedStock,
            reference: invoiceNumber
          };
          const history = Array.isArray(prod.stockHistory) ? [...prod.stockHistory, historyEntry] : [historyEntry];
          await Product.findByIdAndUpdate(item.productId, {
            stock: updatedStock,
            stockHistory: history
          });
        }
      }
    }

    // Customer Ledger update if there is an outstanding balance
    if (balanceDue > 0 && customerName && customerName !== 'Walk-in Customer') {
      let customer = null;
      if (customerMobile) {
        customer = await Customer.findOne({ storeId, mobile: customerMobile });
      }
      if (!customer) {
        customer = await Customer.findOne({ storeId, name: customerName });
      }

      const ledgerEntry = {
        type: 'credit',
        amount: balanceDue,
        description: `Invoice #${invoiceNumber}: Pending balance of ₹${balanceDue}`,
        date: new Date().toISOString(),
        invoiceNumber
      };

      if (customer) {
        const updatedLedger = [...(customer.ledger || []), ledgerEntry];
        const newPending = round2((customer.pendingCredit || 0) + balanceDue);
        await Customer.findByIdAndUpdate(customer._id, {
          ledger: updatedLedger,
          pendingCredit: newPending,
          address: customerAddress || customer.address,
          gstin: customerGstin || customer.gstin
        });
      } else {
        await Customer.create({
          storeId,
          name: customerName,
          mobile: customerMobile || '',
          address: customerAddress || '',
          gstin: customerGstin || '',
          pendingCredit: balanceDue,
          ledger: [ledgerEntry]
        });
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Invoice creation error:', err);
    res.status(500).json({ message: 'Error generating invoice', error: err.message });
  }
});

// 4. Cancel/Refund an Invoice (With Inventory & Ledger Restoration)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    if (order.status === 'Cancelled' && status === 'Cancelled') {
      return res.status(400).json({ message: 'Invoice is already cancelled.' });
    }

    // If cancelling an invoice, restore stock for all products
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items || []) {
        if (item.productId && !item.productId.toString().startsWith('custom_')) {
          const prod = await Product.findById(item.productId);
          if (prod) {
            const restoredStock = Number(prod.stock || 0) + Number(item.quantity || 0);
            await Product.findByIdAndUpdate(item.productId, { stock: restoredStock });
          }
        }
      }

      // If customer had pending credit recorded for this bill, revert it
      if (order.balanceDue > 0 && order.customerMobile) {
        const customer = await Customer.findOne({ storeId: order.storeId, mobile: order.customerMobile });
        if (customer) {
          const newCredit = Math.max(0, round2((customer.pendingCredit || 0) - order.balanceDue));
          const ledgerEntry = {
            type: 'cancellation_credit',
            amount: -order.balanceDue,
            description: `Cancellation of Invoice #${order.invoiceNumber} (${reason || 'Order cancelled'})`,
            date: new Date().toISOString()
          };
          await Customer.findByIdAndUpdate(customer._id, {
            pendingCredit: newCredit,
            ledger: [...(customer.ledger || []), ledgerEntry]
          });
        }
      }
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: status || order.status,
        cancellationReason: reason || order.cancellationReason
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Invoice status update error:', err);
    res.status(500).json({ message: 'Error updating invoice status', error: err.message });
  }
});

// 5. Record subsequent payment for partial/unpaid invoice
router.post('/:id/payment', authenticate, async (req, res) => {
  try {
    const { amount, paymentMethod = 'Cash', note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required.' });
    }

    const currentDue = Number(order.balanceDue || 0);
    const newAmountPaid = round2(Number(order.amountPaid || 0) + payAmt);
    const newBalanceDue = round2(Math.max(0, currentDue - payAmt));
    const newPaymentStatus = newBalanceDue === 0 ? 'Paid' : 'Partial';

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus
      },
      { new: true }
    );

    // If customer has ledger, record payment to reduce customer credit
    if (order.customerMobile) {
      const customer = await Customer.findOne({ storeId: order.storeId, mobile: order.customerMobile });
      if (customer) {
        const newCustCredit = round2(Math.max(0, (customer.pendingCredit || 0) - payAmt));
        const ledgerEntry = {
          type: 'payment',
          amount: payAmt,
          description: `Payment received for Invoice #${order.invoiceNumber} via ${paymentMethod}`,
          date: new Date().toISOString()
        };
        await Customer.findByIdAndUpdate(customer._id, {
          pendingCredit: newCustCredit,
          ledger: [...(customer.ledger || []), ledgerEntry]
        });
      }
    }

    res.json({ message: 'Payment recorded successfully', order: updated });
  } catch (err) {
    console.error('Record invoice payment error:', err);
    res.status(500).json({ message: 'Error recording invoice payment', error: err.message });
  }
});

// 6. Customer Ledger & Directory
router.get('/customers/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const list = await Customer.find({ storeId });
    res.json(list);
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ message: 'Error retrieving ledger customers' });
  }
});

// 7. Add Customer
router.post('/customer/add', authenticate, async (req, res) => {
  try {
    const { storeId, name, mobile, email, address, gstin } = req.body;
    if (!storeId || !name) {
      return res.status(400).json({ message: 'Store ID and Customer Name are required' });
    }

    const existing = await Customer.findOne({ storeId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: `Customer "${name}" already exists.` });
    }

    const newCust = await Customer.create({
      storeId,
      name: name.trim(),
      mobile: mobile ? mobile.trim() : '',
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      gstin: gstin ? gstin.trim() : '',
      pendingCredit: 0,
      ledger: []
    });

    res.status(201).json(newCust);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Error adding customer' });
  }
});

// 8. Pay Udhaar Ledger directly
router.post('/pay-udhaar', authenticate, async (req, res) => {
  try {
    const { storeId, customerId, amount, paymentMode = 'Cash', note } = req.body;
    if (!customerId || !amount) {
      return res.status(400).json({ message: 'Customer ID and amount are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const payAmount = round2(Number(amount));
    const newPending = round2(Math.max(0, (customer.pendingCredit || 0) - payAmount));

    const ledgerEntry = {
      type: 'payment',
      amount: payAmount,
      description: note || `Udhaar payment received via ${paymentMode}`,
      date: new Date().toISOString()
    };

    const updated = await Customer.findByIdAndUpdate(customerId, {
      pendingCredit: newPending,
      ledger: [...(customer.ledger || []), ledgerEntry]
    });

    res.json({ message: 'Payment recorded successfully', newPending, customer: updated });
  } catch (err) {
    console.error('Record ledger payment error:', err);
    res.status(500).json({ message: 'Error logging payment transaction' });
  }
});

// 9. Export Orders to CSV
router.get('/export-csv/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const orders = await Order.find({ storeId });

    let csvContent = 'Invoice Number,Date,Customer Name,Mobile,Payment Method,Payment Status,Subtotal,Discount,Tax,Grand Total,Amount Paid,Balance Due,Status\n';

    orders.forEach(o => {
      const row = [
        o.invoiceNumber,
        `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
        `"${(o.customerName || '').replace(/"/g, '""')}"`,
        `"${o.customerMobile || ''}"`,
        `"${o.paymentMethod || 'Cash'}"`,
        o.paymentStatus || 'Paid',
        o.subtotal || 0,
        o.discount || 0,
        o.tax || 0,
        o.totalAmount || 0,
        o.amountPaid || 0,
        o.balanceDue || 0,
        o.status || 'Completed'
      ].join(',');
      csvContent += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="VoiceBill_Orders_${storeId}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('CSV Export error:', err);
    res.status(500).json({ message: 'Error exporting CSV' });
  }
});

export default router;
