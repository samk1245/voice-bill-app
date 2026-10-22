import express from 'express';
import { Product, Customer } from '../models/index.js';

const router = express.Router();

const numberMap = {
  'ek': 1, 'one': 1, '1': 1, 'a': 1, 'an': 1,
  'do': 2, 'two': 2, '2': 2,
  'teen': 3, 'three': 3, '3': 3,
  'chaar': 4, 'four': 4, '4': 4,
  'paanch': 5, 'five': 5, '5': 5,
  'chhe': 6, 'six': 6, '6': 6,
  'saat': 7, 'seven': 7, '7': 7,
  'aath': 8, 'eight': 8, '8': 8,
  'nau': 9, 'nine': 9, '9': 9,
  'das': 10, 'ten': 10, '10': 10,
  'pandrah': 15, 'fifteen': 15, '15': 15,
  'bees': 20, 'twenty': 20, '20': 20,
  'pachaas': 50, 'fifty': 50, '50': 50,
  'sau': 100, 'hundred': 100, '100': 100
};

const parseNumber = (word) => {
  if (!word) return 1;
  const normalized = word.toLowerCase().trim();
  if (numberMap[normalized] !== undefined) return numberMap[normalized];
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 1 : parsed;
};

const unitMap = {
  'kilo': 'kg', 'kg': 'kg', 'kilos': 'kg',
  'packet': 'packet', 'packets': 'packet', 'pkt': 'packet',
  'bottle': 'bottle', 'bottles': 'bottle',
  'piece': 'piece', 'pieces': 'piece', 'pc': 'piece', 'pcs': 'piece',
  'gram': 'g', 'grams': 'g', 'g': 'g',
  'strip': 'strip', 'strips': 'strip',
  'litre': 'litre', 'litres': 'litre', 'l': 'litre'
};

const parseUnit = (word) => {
  if (!word) return null;
  const normalized = word.toLowerCase().trim();
  return unitMap[normalized] || null;
};

router.post('/parse', async (req, res) => {
  try {
    const { text, storeId } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'No speech text provided' });
    }

    const queryText = text.toLowerCase().trim();
    const products = await Product.find({ storeId });
    const customers = await Customer.find({ storeId });

    // 1. Direct Action Commands
    if (queryText.includes('clear') || queryText.includes('khali karo') || queryText.includes('sab hata do')) {
      return res.json({ intent: 'action', action: 'clear_cart', message: 'Cart cleared by voice command.' });
    }

    if (queryText.includes('print receipt') || queryText.includes('print karo') || queryText.includes('invoice print')) {
      return res.json({ intent: 'action', action: 'print_bill', message: 'Print bill command triggered.' });
    }

    if (queryText.includes('whatsapp') && (queryText.includes('bhejo') || queryText.includes('share'))) {
      return res.json({ intent: 'action', action: 'whatsapp_share', message: 'WhatsApp share command triggered.' });
    }

    if ((queryText.includes('bill') || queryText.includes('order')) && (queryText.includes('confirm') || queryText.includes('save') || queryText.includes('finalize'))) {
      return res.json({ intent: 'action', action: 'confirm_bill', message: 'Save bill command triggered.' });
    }

    if (queryText.includes('show me the total') || queryText.includes('total batao') || queryText.includes('total amount')) {
      return res.json({ intent: 'action', action: 'show_total', message: 'Total calculation requested.' });
    }

    // 2. Tax / GST Commands
    if (queryText.includes('gst') || queryText.includes('tax')) {
      const taxMatch = queryText.match(/(\d+)\s*(?:percent|%)?\s*(?:gst|tax)/);
      if (taxMatch) {
        return res.json({
          intent: 'set_tax',
          taxRate: parseInt(taxMatch[1], 10),
          message: `Set tax rate to ${taxMatch[1]}% GST.`
        });
      }
    }

    // 3. Discount Commands
    if (queryText.includes('discount') || queryText.includes('chhoot')) {
      const percentMatch = queryText.match(/(\d+)\s*(?:percent|%)\s*(?:discount|chhoot)/);
      if (percentMatch) {
        return res.json({
          intent: 'apply_discount',
          discountType: 'percentage',
          value: parseInt(percentMatch[1], 10),
          message: `Applied ${percentMatch[1]}% discount.`
        });
      }
      const flatMatch = queryText.match(/(\d+)\s*(?:rupees|rupaye|rs)?\s*(?:ka\s*)?(?:discount|chhoot)/);
      if (flatMatch) {
        return res.json({
          intent: 'apply_discount',
          discountType: 'fixed',
          value: parseInt(flatMatch[1], 10),
          message: `Applied ₹${flatMatch[1]} discount.`
        });
      }
    }

    // 4. Multi-item parsing
    const segments = queryText.split(/\s+aur\s+|\s+and\s+|\s+plus\s+|,\s*/).map(s => s.trim()).filter(Boolean);
    const detectedItems = [];
    const detectedClarifications = [];
    let detectedCustomer = null;

    customers.forEach(c => {
      if (queryText.includes(c.name.toLowerCase())) {
        detectedCustomer = { name: c.name, mobile: c.mobile, _id: c._id };
      }
    });

    segments.forEach(segment => {
      let seg = segment.replace(/^(add|dena|de do|karo|please|daal do)\s+/i, '').trim();

      let explicitPrice = null;
      const priceMatch = seg.match(/(?:at|price|rate)?\s*(\d+)\s*(?:rupees|rupaye|rs|each)?/i);
      if (seg.includes('at ') || seg.includes('each') || seg.includes('price')) {
        if (priceMatch) {
          explicitPrice = parseInt(priceMatch[1], 10);
          seg = seg.replace(priceMatch[0], '').trim();
        }
      }

      const words = seg.split(/\s+/);
      let qty = 1;
      let unit = null;
      let remainingWords = [];

      for (let i = 0; i < words.length; i++) {
        const w = words[i].toLowerCase();
        if (i === 0 && (numberMap[w] !== undefined || !isNaN(parseInt(w, 10)))) {
          qty = parseNumber(w);
        } else if (i === 1 && parseUnit(w)) {
          unit = parseUnit(w);
        } else {
          remainingWords.push(words[i]);
        }
      }

      const searchTarget = remainingWords.join(' ').toLowerCase().trim();
      if (!searchTarget) return;

      const exactMatch = products.find(p => p.name.toLowerCase() === searchTarget);
      const partialMatches = products.filter(p => {
        const pName = p.name.toLowerCase();
        return pName.includes(searchTarget) || searchTarget.includes(pName);
      });

      if (exactMatch) {
        detectedItems.push({
          productId: exactMatch._id,
          sku: exactMatch.sku || 'SKU-GEN',
          name: exactMatch.name,
          price: explicitPrice !== null ? explicitPrice : exactMatch.price,
          quantity: qty,
          unit: unit || exactMatch.unit || 'pcs',
          taxRate: exactMatch.taxRate || 5,
          stock: exactMatch.stock || 0
        });
      } else if (partialMatches.length === 1) {
        detectedItems.push({
          productId: partialMatches[0]._id,
          sku: partialMatches[0].sku || 'SKU-GEN',
          name: partialMatches[0].name,
          price: explicitPrice !== null ? explicitPrice : partialMatches[0].price,
          quantity: qty,
          unit: unit || partialMatches[0].unit || 'pcs',
          taxRate: partialMatches[0].taxRate || 5,
          stock: partialMatches[0].stock || 0
        });
      } else if (partialMatches.length > 1) {
        detectedClarifications.push({
          term: searchTarget,
          quantity: qty,
          unit: unit || 'pcs',
          options: partialMatches
        });
      } else {
        detectedClarifications.push({
          term: searchTarget,
          quantity: qty,
          unit: unit || 'pcs',
          unrecognized: true,
          suggestedPrice: explicitPrice || 0
        });
      }
    });

    res.json({
      intent: detectedItems.length > 0 || detectedClarifications.length > 0 ? 'billing_items' : 'unknown',
      customer: detectedCustomer,
      items: detectedItems,
      clarifications: detectedClarifications,
      message: `Parsed ${detectedItems.length} items.`
    });
  } catch (err) {
    console.error('NLP route error:', err);
    res.status(500).json({ message: 'Error parsing natural language speech' });
  }
});


// 5. BillMate AI Assistant - Natural Language Business Queries & Insights
router.post('/billmate', async (req, res) => {
  try {
    const { prompt, storeId } = req.body;
    if (!prompt || !storeId) {
      return res.status(400).json({ message: 'Prompt and Store ID are required.' });
    }

    const { Order, Product, Customer, Expense } = await import('../models/index.js');
    const query = prompt.toLowerCase().trim();

    // Fetch store records
    const orders = await Order.find({ storeId });
    const products = await Product.find({ storeId });
    const customers = await Customer.find({ storeId });
    const expenses = await Expense.find({ storeId });

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // 1. "How much did I sell today?" / "Today's sales"
    if (query.includes('today') && (query.includes('sell') || query.includes('sales') || query.includes('revenue') || query.includes('kamai'))) {
      const todayOrders = orders.filter(o => o.status !== 'Cancelled' && (o.createdAt || '').slice(0, 10) === todayStr);
      const totalToday = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const paidToday = todayOrders.filter(o => o.paymentStatus === 'Paid').length;
      return res.json({
        type: 'insight',
        title: "Today's Sales Summary",
        answer: `Today you have generated ₹${totalToday.toLocaleString('en-IN')} across ${todayOrders.length} bills (${paidToday} fully paid).`,
        metrics: { totalToday, billsCount: todayOrders.length, paidCount: paidToday }
      });
    }

    // 2. "Which products generated the most revenue?" / "Top selling products"
    if (query.includes('top product') || query.includes('most revenue') || query.includes('best selling') || query.includes('sabse zyada')) {
      const productMap = {};
      orders.forEach(o => {
        if (o.status === 'Cancelled') return;
        (o.items || []).forEach(item => {
          const key = item.name;
          if (!productMap[key]) productMap[key] = { name: key, revenue: 0, quantity: 0 };
          productMap[key].revenue += Number(item.lineTotal || (item.price * item.quantity) || 0);
          productMap[key].quantity += Number(item.quantity || 1);
        });
      });
      const topList = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      const listText = topList.map((p, idx) => `${idx + 1}. ${p.name}: ₹${p.revenue.toLocaleString('en-IN')} (${p.quantity} units)`).join('\n');
      return res.json({
        type: 'ranking',
        title: 'Top Revenue Generating Products',
        answer: topList.length > 0 ? `Here are your top-selling products by revenue:\n\n${listText}` : 'No product sales recorded yet.',
        items: topList
      });
    }

    // 3. "Show customers with outstanding payments" / "Pending udhaar"
    if (query.includes('outstanding') || query.includes('pending') || query.includes('udhaar') || query.includes('credit balance')) {
      const debtors = customers.filter(c => Number(c.pendingCredit || 0) > 0);
      const totalPending = debtors.reduce((sum, c) => sum + Number(c.pendingCredit || 0), 0);
      const debtorList = debtors.map(c => `• ${c.name} (${c.mobile || 'No Phone'}): ₹${Number(c.pendingCredit).toLocaleString('en-IN')}`).join('\n');
      return res.json({
        type: 'debtors',
        title: 'Outstanding Customer Balances',
        answer: debtors.length > 0
          ? `You have ${debtors.length} customer(s) with a total outstanding balance of ₹${totalPending.toLocaleString('en-IN')}:\n\n${debtorList}`
          : 'Great news! There are currently no pending customer credit balances.',
        totalPending,
        debtors
      });
    }

    // 4. "Low stock" / "Out of stock"
    if (query.includes('low stock') || query.includes('out of stock') || query.includes('khatam') || query.includes('inventory alert')) {
      const lowStock = products.filter(p => !p.isService && Number(p.stock || 0) <= Number(p.lowStockAlertLimit || 10));
      const list = lowStock.map(p => `• ${p.name}: ${p.stock} ${p.unit || 'pcs'} left (alert limit: ${p.lowStockAlertLimit})`).join('\n');
      return res.json({
        type: 'inventory_alert',
        title: 'Low Stock Alerts',
        answer: lowStock.length > 0
          ? `${lowStock.length} product(s) are running low on inventory:\n\n${list}`
          : 'All inventory levels are healthy! No products currently below alert limit.',
        lowStock
      });
    }

    // 5. "Compare this month with last month" / "Monthly comparison"
    if (query.includes('compare') || query.includes('last month') || query.includes('month comparison')) {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let thisMonthSales = 0;
      let lastMonthSales = 0;

      orders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.createdAt);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          thisMonthSales += Number(o.totalAmount || 0);
        } else if ((d.getFullYear() === currentYear && d.getMonth() === currentMonth - 1) || (currentMonth === 0 && d.getFullYear() === currentYear - 1 && d.getMonth() === 11)) {
          lastMonthSales += Number(o.totalAmount || 0);
        }
      });

      const growthPct = lastMonthSales > 0 ? (((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1) : 100;
      return res.json({
        type: 'comparison',
        title: 'Monthly Performance Comparison',
        answer: `This Month: ₹${thisMonthSales.toLocaleString('en-IN')}\nLast Month: ₹${lastMonthSales.toLocaleString('en-IN')}\nGrowth: ${growthPct > 0 ? '+' : ''}${growthPct}%`,
        thisMonthSales,
        lastMonthSales,
        growthPct
      });
    }

    // 6. Natural Language Expense Log: "Log expense 500 for electricity"
    const expenseMatch = query.match(/(?:log|add|record|kharcha)?\s*(?:expense|kharcha)?\s*(?:of|rs|rupees)?\s*(\d+)\s*(?:for|on|ka)?\s*(.+)/i);
    if (query.includes('expense') || query.includes('kharcha')) {
      const amountMatch = query.match(/(\d+)/);
      if (amountMatch) {
        const amt = parseInt(amountMatch[1], 10);
        let desc = query.replace(/(?:log|add|record|expense|kharcha|of|rs|rupees|\d+)/gi, '').trim();
        if (!desc) desc = 'Miscellaneous expense';
        
        let category = 'Miscellaneous';
        if (desc.includes('rent')) category = 'Rent';
        else if (desc.includes('electric') || desc.includes('bill') || desc.includes('water') || desc.includes('wifi')) category = 'Utilities';
        else if (desc.includes('salary') || desc.includes('staff')) category = 'Salaries';
        else if (desc.includes('transport') || desc.includes('petrol') || desc.includes('diesel')) category = 'Transport';

        const newExp = await Expense.create({
          storeId,
          category,
          amount: amt,
          description: desc.charAt(0).toUpperCase() + desc.slice(1),
          paymentMethod: 'Cash',
          date: new Date().toISOString()
        });

        return res.json({
          type: 'action_success',
          title: 'Expense Recorded by BillMate AI',
          answer: `Successfully logged expense of ₹${amt} under '${category}' (${desc}).`,
          expense: newExp
        });
      }
    }

    // Fallback General Assistant Answer
    return res.json({
      type: 'general',
      title: 'BillMate AI Assistant',
      answer: `I'm BillMate AI, your billing & analytics copilot. You can ask me:\n• "How much did I sell today?"\n• "Which products generated the most revenue?"\n• "Show customers with outstanding payments"\n• "Check low stock alerts"\n• "Compare this month with last month"\n• "Log expense of 500 for packing materials"`
    });
  } catch (err) {
    console.error('BillMate AI error:', err);
    res.status(500).json({ message: 'BillMate AI encountered an error', error: err.message });
  }
});

export default router;
