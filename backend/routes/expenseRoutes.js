import express from 'express';
import { Expense } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: 2-decimal rounding
const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

// Valid expense categories
const VALID_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Inventory Purchase',
  'Transport',
  'Marketing',
  'Maintenance',
  'Miscellaneous'
];

// 1. List expenses for a store (with date range, category filter)
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate, category, search } = req.query;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    let expenses = await Expense.find({ storeId });

    // Filter by category
    if (category && category !== 'All') {
      expenses = expenses.filter(e => e.category === category);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime();
      expenses = expenses.filter(e => new Date(e.date || e.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      expenses = expenses.filter(e => new Date(e.date || e.createdAt).getTime() <= end.getTime());
    }

    // Search by description or reference
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      expenses = expenses.filter(e => {
        const desc = (e.description || '').toLowerCase();
        const ref = (e.reference || '').toLowerCase();
        const cat = (e.category || '').toLowerCase();
        return desc.includes(q) || ref.includes(q) || cat.includes(q);
      });
    }

    // Sort by date descending
    expenses.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    res.json(expenses);
  } catch (err) {
    console.error('Fetch expenses error:', err);
    res.status(500).json({ message: 'Error retrieving expenses', error: err.message });
  }
});

// 2. Create a new expense
router.post('/create', authenticate, async (req, res) => {
  try {
    const { storeId, category, amount, description, date, paymentMethod, reference } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Valid expense category is required. Allowed: ${VALID_CATEGORIES.join(', ')}`,
        validCategories: VALID_CATEGORIES
      });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid positive amount is required.' });
    }

    const newExpense = await Expense.create({
      storeId,
      category,
      amount: round2(Number(amount)),
      description: description ? description.trim() : '',
      date: date || new Date().toISOString(),
      paymentMethod: paymentMethod || 'Cash',
      reference: reference ? reference.trim() : '',
      finalized: false
    });

    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ message: 'Error creating expense', error: err.message });
  }
});

// 3. Update an expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    // Do not update finalized expenses
    if (expense.finalized) {
      return res.status(400).json({ message: 'Cannot modify a finalized expense record.' });
    }

    const { category, amount, description, date, paymentMethod, reference } = req.body;

    // Validate category if provided
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Invalid expense category. Allowed: ${VALID_CATEGORIES.join(', ')}`,
        validCategories: VALID_CATEGORIES
      });
    }

    // Validate amount if provided
    if (amount !== undefined && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      return res.status(400).json({ message: 'Amount must be a valid positive number.' });
    }

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        category: category !== undefined ? category : expense.category,
        amount: amount !== undefined ? round2(Number(amount)) : expense.amount,
        description: description !== undefined ? description.trim() : expense.description,
        date: date !== undefined ? date : expense.date,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : expense.paymentMethod,
        reference: reference !== undefined ? reference.trim() : expense.reference
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: 'Error updating expense', error: err.message });
  }
});

// 4. Delete an expense (only non-finalized)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    if (expense.finalized) {
      return res.status(400).json({ message: 'Cannot delete a finalized expense record.' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense successfully deleted.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
});

// 5. Expense summary by category and date range
router.get('/summary/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate } = req.query;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    let expenses = await Expense.find({ storeId });

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime();
      expenses = expenses.filter(e => new Date(e.date || e.createdAt).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      expenses = expenses.filter(e => new Date(e.date || e.createdAt).getTime() <= end.getTime());
    }

    // Group by category
    const categoryBreakdown = {};
    let totalExpenses = 0;

    for (const cat of VALID_CATEGORIES) {
      categoryBreakdown[cat] = { category: cat, total: 0, count: 0 };
    }

    expenses.forEach(exp => {
      const cat = exp.category || 'Miscellaneous';
      const amt = Number(exp.amount || 0);
      totalExpenses = round2(totalExpenses + amt);

      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { category: cat, total: 0, count: 0 };
      }
      categoryBreakdown[cat].total = round2(categoryBreakdown[cat].total + amt);
      categoryBreakdown[cat].count += 1;
    });

    // Filter out zero-total categories for cleaner output
    const breakdown = Object.values(categoryBreakdown).filter(c => c.count > 0);

    // Monthly trend: group by month
    const monthlyMap = {};
    expenses.forEach(exp => {
      const d = new Date(exp.date || exp.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, total: 0, count: 0 };
      }
      monthlyMap[monthKey].total = round2(monthlyMap[monthKey].total + Number(exp.amount || 0));
      monthlyMap[monthKey].count += 1;
    });

    const monthlyTrend = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalExpenses: round2(totalExpenses),
      totalRecords: expenses.length,
      categoryBreakdown: breakdown,
      monthlyTrend,
      validCategories: VALID_CATEGORIES
    });
  } catch (err) {
    console.error('Expense summary error:', err);
    res.status(500).json({ message: 'Error generating expense summary', error: err.message });
  }
});

export default router;
