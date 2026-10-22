import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nlpPath = path.resolve(__dirname, '../routes/nlpRoutes.js');

let c = fs.readFileSync(nlpPath, 'utf8');

if (!c.includes('/billmate')) {
  const billmateLogic = `
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
        answer: \`Today you have generated ₹\${totalToday.toLocaleString('en-IN')} across \${todayOrders.length} bills (\${paidToday} fully paid).\`,
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
      const listText = topList.map((p, idx) => \`\${idx + 1}. \${p.name}: ₹\${p.revenue.toLocaleString('en-IN')} (\${p.quantity} units)\`).join('\\n');
      return res.json({
        type: 'ranking',
        title: 'Top Revenue Generating Products',
        answer: topList.length > 0 ? \`Here are your top-selling products by revenue:\\n\\n\${listText}\` : 'No product sales recorded yet.',
        items: topList
      });
    }

    // 3. "Show customers with outstanding payments" / "Pending udhaar"
    if (query.includes('outstanding') || query.includes('pending') || query.includes('udhaar') || query.includes('credit balance')) {
      const debtors = customers.filter(c => Number(c.pendingCredit || 0) > 0);
      const totalPending = debtors.reduce((sum, c) => sum + Number(c.pendingCredit || 0), 0);
      const debtorList = debtors.map(c => \`• \${c.name} (\${c.mobile || 'No Phone'}): ₹\${Number(c.pendingCredit).toLocaleString('en-IN')}\`).join('\\n');
      return res.json({
        type: 'debtors',
        title: 'Outstanding Customer Balances',
        answer: debtors.length > 0
          ? \`You have \${debtors.length} customer(s) with a total outstanding balance of ₹\${totalPending.toLocaleString('en-IN')}:\\n\\n\${debtorList}\`
          : 'Great news! There are currently no pending customer credit balances.',
        totalPending,
        debtors
      });
    }

    // 4. "Low stock" / "Out of stock"
    if (query.includes('low stock') || query.includes('out of stock') || query.includes('khatam') || query.includes('inventory alert')) {
      const lowStock = products.filter(p => !p.isService && Number(p.stock || 0) <= Number(p.lowStockAlertLimit || 10));
      const list = lowStock.map(p => \`• \${p.name}: \${p.stock} \${p.unit || 'pcs'} left (alert limit: \${p.lowStockAlertLimit})\`).join('\\n');
      return res.json({
        type: 'inventory_alert',
        title: 'Low Stock Alerts',
        answer: lowStock.length > 0
          ? \`\${lowStock.length} product(s) are running low on inventory:\\n\\n\${list}\`
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
        answer: \`This Month: ₹\${thisMonthSales.toLocaleString('en-IN')}\\nLast Month: ₹\${lastMonthSales.toLocaleString('en-IN')}\\nGrowth: \${growthPct > 0 ? '+' : ''}\${growthPct}%\`,
        thisMonthSales,
        lastMonthSales,
        growthPct
      });
    }

    // 6. Natural Language Expense Log: "Log expense 500 for electricity"
    const expenseMatch = query.match(/(?:log|add|record|kharcha)?\\s*(?:expense|kharcha)?\\s*(?:of|rs|rupees)?\\s*(\\d+)\\s*(?:for|on|ka)?\\s*(.+)/i);
    if (query.includes('expense') || query.includes('kharcha')) {
      const amountMatch = query.match(/(\\d+)/);
      if (amountMatch) {
        const amt = parseInt(amountMatch[1], 10);
        let desc = query.replace(/(?:log|add|record|expense|kharcha|of|rs|rupees|\\d+)/gi, '').trim();
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
          answer: \`Successfully logged expense of ₹\${amt} under '\${category}' (\${desc}).\`,
          expense: newExp
        });
      }
    }

    // Fallback General Assistant Answer
    return res.json({
      type: 'general',
      title: 'BillMate AI Assistant',
      answer: \`I'm BillMate AI, your billing & analytics copilot. You can ask me:\\n• "How much did I sell today?"\\n• "Which products generated the most revenue?"\\n• "Show customers with outstanding payments"\\n• "Check low stock alerts"\\n• "Compare this month with last month"\\n• "Log expense of 500 for packing materials"\`
    });
  } catch (err) {
    console.error('BillMate AI error:', err);
    res.status(500).json({ message: 'BillMate AI encountered an error', error: err.message });
  }
});
`;

  c = c.replace('export default router;', billmateLogic + '\nexport default router;');
  fs.writeFileSync(nlpPath, c);
  console.log('BillMate AI route added to nlpRoutes.js!');
}
