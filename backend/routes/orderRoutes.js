import express from 'express';
import { Order, Product, Customer } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all bills/invoices for a store
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const orders = await Order.find({ storeId });
    // Sort by date descending
    const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sorted);
  } catch (err) {
    console.error('Fetch bills error:', err);
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// 2. Create a new bill/invoice
router.post('/create', authenticate, async (req, res) => {
  try {
    const {
      storeId,
      customerName,
      customerMobile,
      items,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentMethod,
      cashReceived,
      changeReturn
    } = req.body;

    if (!storeId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Store ID and billing items are required' });
    }

    // Generate consecutive-like invoice number
    const count = await Order.countDocuments({ storeId });
    const invoiceNumber = `VB-${1001 + count}`;

    // Create the order
    const newOrder = await Order.create({
      storeId,
      invoiceNumber,
      customerName: customerName || 'Cash Customer',
      customerMobile: customerMobile || '',
      items,
      subtotal: parseFloat(subtotal),
      discount: parseFloat(discount || 0),
      tax: parseFloat(tax || 0),
      totalAmount: parseFloat(totalAmount),
      paymentMethod,
      cashReceived: cashReceived ? parseFloat(cashReceived) : 0,
      changeReturn: changeReturn ? parseFloat(changeReturn) : 0,
      status: 'Completed'
    });

    // Update Product Inventory (Decrement Stock)
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.quantity);
        await Product.findByIdAndUpdate(item.productId, { stock: newStock });
      }
    }

    // Update Customer Udhaar/Ledger if payment method is Credit/Udhaar
    if (customerName && (paymentMethod === 'Credit/Udhaar' || paymentMethod === 'Udhaar')) {
      let customer = null;
      if (customerMobile) {
        customer = await Customer.findOne({ storeId, mobile: customerMobile });
      } else {
        customer = await Customer.findOne({ storeId, name: customerName });
      }

      const ledgerEntry = {
        type: 'credit',
        amount: parseFloat(totalAmount),
        description: `Invoice #${invoiceNumber}: ${items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}`,
        date: new Date().toISOString()
      };

      if (customer) {
        const updatedLedger = [...(customer.ledger || []), ledgerEntry];
        const newPending = (customer.pendingCredit || 0) + parseFloat(totalAmount);
        await Customer.findByIdAndUpdate(customer._id, {
          ledger: updatedLedger,
          pendingCredit: newPending
        });
      } else {
        // Create new customer
        await Customer.create({
          storeId,
          name: customerName,
          mobile: customerMobile || '',
          pendingCredit: parseFloat(totalAmount),
          ledger: [ledgerEntry]
        });
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Invoice creation error:', err);
    res.status(500).json({ message: 'Error generating invoice' });
  }
});

// 3. Clear/Pay Udhaar Ledger (payment transaction)
router.post('/pay-udhaar', authenticate, async (req, res) => {
  try {
    const { storeId, customerId, amount, paymentMode } = req.body;
    if (!customerId || !amount) {
      return res.status(400).json({ message: 'Customer ID and amount are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const payAmount = parseFloat(amount);
    const newPending = Math.max(0, (customer.pendingCredit || 0) - payAmount);
    
    const ledgerEntry = {
      type: 'payment',
      amount: payAmount,
      description: `Payment received via ${paymentMode || 'Cash'}`,
      date: new Date().toISOString()
    };

    const updated = await Customer.findByIdAndUpdate(customerId, {
      pendingCredit: newPending,
      ledger: [...(customer.ledger || []), ledgerEntry]
    });

    res.json({ message: 'Payment recorded successfully', newPending });
  } catch (err) {
    console.error('Record ledger payment error:', err);
    res.status(500).json({ message: 'Error logging payment transaction' });
  }
});

// 4. Get customer directory for a store
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

// 5. Add custom customer manually
router.post('/customer/add', authenticate, async (req, res) => {
  try {
    const { storeId, name, mobile } = req.body;
    if (!storeId || !name) {
      return res.status(400).json({ message: 'Store ID and Name are required' });
    }

    // Check if customer already exists
    const existing = await Customer.findOne({ storeId, name });
    if (existing) {
      return res.status(400).json({ message: 'Customer with this name already exists' });
    }

    const newCust = await Customer.create({
      storeId,
      name,
      mobile: mobile || '',
      pendingCredit: 0,
      ledger: []
    });

    res.status(201).json(newCust);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Error adding customer' });
  }
});

export default router;
