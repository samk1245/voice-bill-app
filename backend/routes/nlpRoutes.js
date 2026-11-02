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
  'kilo': 'kg', 'kg': 'kg', 'kilos': 'kg', 'kilogram': 'kg',
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

    if (queryText.includes('generate the pdf') || queryText.includes('generate pdf') || queryText.includes('download pdf')) {
      return res.json({ intent: 'action', action: 'generate_pdf', message: 'Download PDF command triggered.' });
    }

    if (queryText.includes('whatsapp') && (queryText.includes('bhejo') || queryText.includes('share') || queryText.includes('send'))) {
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
      const taxMatch = queryText.match(/(\d+)\s*(?:percent|%|pratishat)?\s*(?:gst|tax)/) ||
                       queryText.match(/(?:gst|tax)\s*(?:of|at)?\s*(\d+)/);
      if (taxMatch) {
        const rate = parseInt(taxMatch[1], 10);
        return res.json({
          intent: 'set_tax',
          taxRate: rate,
          message: `Set tax rate to ${rate}% GST.`
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

      const flatMatch = queryText.match(/(?:discount|chhoot)\s*(?:of|amount)?\s*(\d+)/);
      if (flatMatch) {
        return res.json({
          intent: 'apply_discount',
          discountType: 'fixed',
          value: parseInt(flatMatch[1], 10),
          message: `Applied ₹${flatMatch[1]} flat discount.`
        });
      }
    }

    // 4. Multi-item Extraction
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
      const priceMatch = seg.match(/(?:at|price|ke bhaav|rate)?\s*(\d+)\s*(?:rupees|rupaye|rs|each|prati)?/i);
      if (seg.includes('at ') || seg.includes('each') || seg.includes('rate') || seg.includes('price')) {
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
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

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

    // 2. "How much did I earn this month?" / "Monthly earnings & net profit"
    if ((query.includes('earn') || query.includes('profit') || query.includes('revenue') || query.includes('sales')) && (query.includes('this month') || query.includes('month'))) {
      let thisMonthSales = 0;
      let thisMonthExpenses = 0;
      let billsCount = 0;

      orders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.createdAt);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          thisMonthSales += Number(o.totalAmount || 0);
          billsCount++;
        }
      });

      expenses.forEach(e => {
        const d = new Date(e.date || e.createdAt);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          thisMonthExpenses += Number(e.amount || 0);
        }
      });

      const netProfit = thisMonthSales - thisMonthExpenses;
      return res.json({
        type: 'earnings',
        title: 'Monthly Revenue & Net Profit',
        answer: `This month, your total revenue is ₹${thisMonthSales.toLocaleString('en-IN')} from ${billsCount} bills.\nRecorded expenses: ₹${thisMonthExpenses.toLocaleString('en-IN')}.\nEstimated Net Earnings: ₹${netProfit.toLocaleString('en-IN')}.`,
        metrics: { thisMonthSales, thisMonthExpenses, netProfit, billsCount }
      });
    }

    // 3. "Which products generated the most revenue?" / "Top selling products"
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

    // 4. "Show my top 5 customers" / "Best customers"
    if (query.includes('top customer') || query.includes('best customer') || query.includes('loyal customer') || query.includes('top 5 customer')) {
      const customerMap = {};
      orders.forEach(o => {
        if (o.status === 'Cancelled' || !o.customerName) return;
        const key = o.customerPhone ? `${o.customerName} (${o.customerPhone})` : o.customerName;
        if (!customerMap[key]) customerMap[key] = { name: o.customerName, phone: o.customerPhone || 'N/A', totalSpent: 0, ordersCount: 0 };
        customerMap[key].totalSpent += Number(o.totalAmount || 0);
        customerMap[key].ordersCount++;
      });
      const topCustomers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
      const listText = topCustomers.map((c, idx) => `${idx + 1}. ${c.name} (${c.phone}): ₹${c.totalSpent.toLocaleString('en-IN')} (${c.ordersCount} bills)`).join('\n');
      return res.json({
        type: 'top_customers',
        title: 'Top 5 Customers by Lifetime Value',
        answer: topCustomers.length > 0
          ? `Here are your top 5 most valuable customers:\n\n${listText}`
          : 'No customer order history recorded yet.',
        topCustomers
      });
    }

    // 5. "Who has not paid me?" / "What is my outstanding amount?" / "Pending udhaar"
    if (query.includes('who has not paid') || query.includes('not paid') || query.includes('outstanding') || query.includes('pending') || query.includes('udhaar') || query.includes('credit balance')) {
      const debtors = customers.filter(c => Number(c.pendingCredit || 0) > 0);
      const unpaidOrders = orders.filter(o => o.status !== 'Cancelled' && (o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Partially Paid'));
      const totalPending = debtors.reduce((sum, c) => sum + Number(c.pendingCredit || 0), 0);
      const debtorList = debtors.map(c => `• ${c.name} (${c.mobile || 'No Phone'}): ₹${Number(c.pendingCredit).toLocaleString('en-IN')}`).join('\n');
      return res.json({
        type: 'debtors',
        title: 'Outstanding Customer Balances & Unpaid Invoices',
        answer: debtors.length > 0 || unpaidOrders.length > 0
          ? `You have ${debtors.length} customer(s) with an outstanding ledger balance totaling ₹${totalPending.toLocaleString('en-IN')}, and ${unpaidOrders.length} unpaid/partial invoice(s).\n\nCustomer Ledgers:\n${debtorList || 'None in ledger'}`
          : 'Great news! There are currently no pending customer credit balances or overdue invoices.',
        totalPending,
        debtors,
        unpaidOrdersCount: unpaidOrders.length
      });
    }

    // 6. "Predict next month's revenue" / "Revenue forecast"
    if (query.includes('predict') || query.includes('forecast') || query.includes('future revenue') || query.includes('next month revenue')) {
      const dayCount = now.getDate();
      let mtdSales = 0;
      orders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.createdAt);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
          mtdSales += Number(o.totalAmount || 0);
        }
      });

      const avgDaily = dayCount > 0 ? mtdSales / dayCount : 0;
      const predictedNextMonth = Math.round(avgDaily * 30);
      const lowerBound = Math.round(predictedNextMonth * 0.9);
      const upperBound = Math.round(predictedNextMonth * 1.15);

      return res.json({
        type: 'prediction',
        title: "AI Predictive Revenue Forecast",
        answer: `Based on your current month-to-date run rate (₹${Math.round(avgDaily).toLocaleString('en-IN')}/day across ${dayCount} days), your estimated revenue for next month is:\n\n🎯 Expected: ₹${predictedNextMonth.toLocaleString('en-IN')}\n📈 Confidence Range: ₹${lowerBound.toLocaleString('en-IN')} - ₹${upperBound.toLocaleString('en-IN')}\n\nTip: You can boost this by sending WhatsApp payment reminders to overdue customers.`,
        predictedNextMonth,
        avgDaily,
        lowerBound,
        upperBound
      });
    }

    // 7. "Detect unusual billing patterns" / "Anomalies"
    if (query.includes('unusual') || query.includes('pattern') || query.includes('anomaly') || query.includes('fraud') || query.includes('risk')) {
      const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
      const cancellationRatio = orders.length > 0 ? Math.round((cancelledCount / orders.length) * 100) : 0;
      const overdueDebtors = customers.filter(c => Number(c.pendingCredit || 0) > 5000);
      
      let findings = [];
      if (cancellationRatio > 10) {
        findings.push(`⚠️ Cancellation rate is elevated at ${cancellationRatio}% (${cancelledCount} cancelled bills).`);
      }
      if (overdueDebtors.length > 0) {
        findings.push(`⚠️ ${overdueDebtors.length} customer(s) carry high individual credit over ₹5,000.`);
      }
      if (findings.length === 0) {
        findings.push('✅ No abnormal billing spikes or unusual fraud patterns detected.');
        findings.push(`✅ Cancellation rate is low and healthy (${cancellationRatio}%).`);
      }

      return res.json({
        type: 'pattern_detection',
        title: 'Billing Health & Pattern Analysis',
        answer: findings.join('\n\n'),
        cancellationRatio,
        overdueHighDebtors: overdueDebtors.length
      });
    }

    // 8. "Recommend payment follow-ups" / "Follow up suggestions"
    if (query.includes('follow up') || query.includes('recommend') || query.includes('who should i call') || query.includes('remind')) {
      const debtors = customers
        .filter(c => Number(c.pendingCredit || 0) > 0)
        .sort((a, b) => Number(b.pendingCredit) - Number(a.pendingCredit))
        .slice(0, 5);

      if (debtors.length === 0) {
        return res.json({
          type: 'recommendations',
          title: 'Payment Follow-up Recommendations',
          answer: 'All customer accounts are settled! No urgent payment follow-ups required.'
        });
      }

      const suggestions = debtors.map((c, i) => {
        return `${i + 1}. ${c.name} — Pending: ₹${Number(c.pendingCredit).toLocaleString('en-IN')} (Phone: ${c.mobile || 'N/A'})\n   Action: Send WhatsApp reminder with UPI payment link.`;
      }).join('\n\n');

      return res.json({
        type: 'recommendations',
        title: 'Recommended Customer Payment Follow-ups',
        answer: `Here are the top ${debtors.length} priority follow-ups to recover outstanding dues:\n\n${suggestions}`,
        debtors
      });
    }

    // 9. "Low stock" / "Out of stock"
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

    // 10. "Compare this month with last month" / "Monthly comparison"
    if (query.includes('compare') || query.includes('last month') || query.includes('month comparison')) {
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

    // 11. Natural Language Expense Log: "Log expense 500 for electricity"
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
      answer: `I'm BillMate AI, your billing & analytics copilot. You can ask me:\n• "How much did I earn this month?"\n• "Who has not paid me?"\n• "Which products generated the most revenue?"\n• "Show my top 5 customers"\n• "What is my outstanding amount?"\n• "Predict next month's revenue"\n• "Detect unusual billing patterns"\n• "Recommend payment follow-ups"\n• "Log expense 500 for packing"`
    });
  } catch (err) {
    console.error('BillMate AI error:', err);
    res.status(500).json({ message: 'BillMate AI encountered an error', error: err.message });
  }
});

export default router;
