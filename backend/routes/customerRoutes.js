import express from 'express';
import { Customer, Order } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: 2-decimal rounding
const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

// 1. List all customers for a store (with search by name/mobile)
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { search } = req.query;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    let customers = await Customer.find({ storeId });

    // Filter by search query (name or mobile)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      customers = customers.filter(c => {
        const name = (c.name || '').toLowerCase();
        const mobile = (c.mobile || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        return name.includes(q) || mobile.includes(q) || email.includes(q);
      });
    }

    // Sort by name alphabetically
    customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    res.json(customers);
  } catch (err) {
    console.error('Fetch customers error:', err);
    res.status(500).json({ message: 'Error retrieving customers', error: err.message });
  }
});

// 2. Create a new customer
router.post('/create', authenticate, async (req, res) => {
  try {
    const { name, mobile, email, address, gstin, storeId } = req.body;

    if (!storeId || !name || !name.trim()) {
      return res.status(400).json({ message: 'Store ID and Customer Name are required' });
    }

    // Check for duplicate by name within the same store
    const existingByName = await Customer.findOne({ storeId, name: name.trim() });
    if (existingByName) {
      return res.status(400).json({ message: `Customer "${name.trim()}" already exists in this store.` });
    }

    // Check for duplicate by mobile if provided
    if (mobile && mobile.trim()) {
      const existingByMobile = await Customer.findOne({ storeId, mobile: mobile.trim() });
      if (existingByMobile) {
        return res.status(400).json({ message: `A customer with mobile "${mobile.trim()}" already exists in this store.` });
      }
    }

    const newCustomer = await Customer.create({
      storeId,
      name: name.trim(),
      mobile: mobile ? mobile.trim() : '',
      email: email ? email.trim() : '',
      address: address ? address.trim() : '',
      gstin: gstin ? gstin.trim() : '',
      pendingCredit: 0,
      ledger: []
    });

    res.status(201).json(newCustomer);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
});

// 3. Update customer details
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, mobile, email, address, gstin } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: name !== undefined ? name.trim() : customer.name,
        mobile: mobile !== undefined ? mobile.trim() : customer.mobile,
        email: email !== undefined ? email.trim() : customer.email,
        address: address !== undefined ? address.trim() : customer.address,
        gstin: gstin !== undefined ? gstin.trim() : customer.gstin
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ message: 'Error updating customer', error: err.message });
  }
});

// 4. Get customer with purchase history (join with orders)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Fetch orders associated with this customer by mobile or name
    let orders = [];
    if (customer.storeId) {
      const allOrders = await Order.find({ storeId: customer.storeId });
      orders = allOrders.filter(order => {
        if (customer.mobile && order.customerMobile === customer.mobile) return true;
        if (customer.name && order.customerName === customer.name) return true;
        return false;
      });
      // Sort by date descending
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Compute purchase summary
    const totalOrders = orders.length;
    const totalSpent = round2(orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0));
    const totalPaid = round2(orders.reduce((sum, o) => sum + Number(o.amountPaid || 0), 0));

    res.json({
      ...customer,
      purchaseHistory: orders,
      purchaseSummary: {
        totalOrders,
        totalSpent,
        totalPaid,
        outstandingBalance: round2(customer.pendingCredit || 0)
      }
    });
  } catch (err) {
    console.error('Fetch customer details error:', err);
    res.status(500).json({ message: 'Error retrieving customer details', error: err.message });
  }
});

// 5. Get customer's payment ledger
router.get('/:id/ledger', authenticate, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const ledger = customer.ledger || [];

    // Sort ledger by date descending
    const sortedLedger = [...ledger].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      customerId: customer._id,
      customerName: customer.name,
      pendingCredit: round2(customer.pendingCredit || 0),
      ledger: sortedLedger
    });
  } catch (err) {
    console.error('Fetch customer ledger error:', err);
    res.status(500).json({ message: 'Error retrieving customer ledger', error: err.message });
  }
});

// 6. Record a payment against outstanding balance
router.post('/:id/payment', authenticate, async (req, res) => {
  try {
    const { amount, paymentMethod = 'Cash', note } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ message: 'A valid positive payment amount is required.' });
    }

    const currentPending = Number(customer.pendingCredit || 0);
    if (currentPending <= 0) {
      return res.status(400).json({ message: 'This customer has no outstanding balance.' });
    }

    const newPending = round2(Math.max(0, currentPending - payAmount));

    const ledgerEntry = {
      type: 'payment',
      amount: payAmount,
      description: note || `Payment received via ${paymentMethod}`,
      date: new Date().toISOString(),
      paymentMethod
    };

    const updatedLedger = [...(customer.ledger || []), ledgerEntry];

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        pendingCredit: newPending,
        ledger: updatedLedger
      },
      { new: true }
    );

    res.json({
      message: 'Payment recorded successfully',
      previousBalance: round2(currentPending),
      amountPaid: payAmount,
      newBalance: newPending,
      customer: updated
    });
  } catch (err) {
    console.error('Record customer payment error:', err);
    res.status(500).json({ message: 'Error recording payment', error: err.message });
  }
});

export default router;
