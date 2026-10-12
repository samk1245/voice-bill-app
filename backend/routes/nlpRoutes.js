import express from 'express';
import { Product, Customer } from '../models/index.js';

const router = express.Router();

// Helper to convert Hindi text numbers to integers
const numberMap = {
  'ek': 1, 'one': 1, '1': 1,
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
  if (numberMap[normalized] !== undefined) {
    return numberMap[normalized];
  }
  const parsed = parseInt(normalized);
  return isNaN(parsed) ? 1 : parsed;
};

// Parse Hindi/Hinglish units
const unitMap = {
  'kilo': 'kg', 'kg': 'kg', 'kilos': 'kg',
  'packet': 'packet', 'packets': 'packet', 'pkt': 'packet',
  'bottle': 'bottle', 'bottles': 'bottle',
  'piece': 'piece', 'pieces': 'piece', 'pc': 'piece', 'pcs': 'piece',
  'gram': 'g', 'grams': 'g', 'g': 'g',
  'strip': 'strip', 'strips': 'strip',
  'litre': 'litre', 'litres': 'litre', 'l': 'litre',
  'cheeni': 'kg', 'chawal': 'kg' // default guess
};

const parseUnit = (word) => {
  if (!word) return null;
  const normalized = word.toLowerCase().trim();
  return unitMap[normalized] || normalized;
};

// NLP Parser Endpoint
router.post('/parse', async (req, res) => {
  const { text, storeId } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'No speech text provided' });
  }

  const queryText = text.toLowerCase().trim();
  const products = await Product.find({ storeId });
  const customers = await Customer.find({ storeId });

  // 1. Identify Sales Assistant Queries
  if (
    queryText.includes('sale') || 
    queryText.includes('bik') || 
    queryText.includes('stock') || 
    queryText.includes('kam') || 
    queryText.includes('profit') || 
    queryText.includes('batao') ||
    queryText.includes('analyse')
  ) {
    let salesIntent = 'general';
    if (queryText.includes('aaj') || queryText.includes('today')) salesIntent = 'today_sales';
    else if (queryText.includes('sabse zyada') || queryText.includes('most sold') || queryText.includes('highest')) salesIntent = 'top_products';
    else if (queryText.includes('kam') || queryText.includes('low') || queryText.includes('stock')) salesIntent = 'low_stock';
    else if (queryText.includes('kal') || queryText.includes('yesterday')) salesIntent = 'compare_sales';
    else if (queryText.includes('profit')) salesIntent = 'profit';

    return res.json({
      intent: 'sales_query',
      query: text,
      salesIntent,
      message: 'Sales query detected'
    });
  }

  // 2. Identify Payments & Balance Calculations
  // E.g., "Customer ne 500 cash diya" or "500 cash diya"
  const cashDiyaMatch = queryText.match(/(?:customer ne\s+)?(\d+|ek|do|teen|paanch|sau|hundred)\s*(?:rupaye|rs|rupya|rupees)?\s*(?:cash|diye|diya)/);
  if (cashDiyaMatch) {
    const cashReceived = parseNumber(cashDiyaMatch[1]);
    return res.json({
      intent: 'payment',
      paymentMethod: 'Cash',
      cashReceived,
      message: `Extracted cash payment of ₹${cashReceived}`
    });
  }

  // 3. Identify Credit/Udhaar Commands
  // E.g., "Ramesh ne 1000 rupaye udhaar liye" or "Shyam ka udhaar add karo 500"
  if (queryText.includes('udhaar') || queryText.includes('credit') || queryText.includes('khata')) {
    let customerName = null;
    let amount = null;

    // Try finding customer name from the text
    for (const cust of customers) {
      if (queryText.includes(cust.name.toLowerCase()) || queryText.includes(cust.name.split(' ')[0].toLowerCase())) {
        customerName = cust.name;
        break;
      }
    }

    // Try extracting amount
    const amountMatch = queryText.match(/(\d+|ek|do|teen|paanch|sau|hundred)\s*(?:rupaye|rs|rupya|rupees)?/);
    if (amountMatch) {
      amount = parseNumber(amountMatch[1]);
    }

    if (amount) {
      return res.json({
        intent: 'credit',
        customerName: customerName || 'Unknown Customer',
        amount,
        message: `Extracted credit details: ₹${amount} for ${customerName || 'customer'}`
      });
    }
  }

  // 4. Identify Discounts
  // E.g., "10 rupaye discount laga do" or "discount 50 rupees"
  const discountMatch = queryText.match(/(\d+|ek|do|teen|paanch|sau|hundred)\s*(?:rupaye|rs|rupya|rupees)?\s*(?:discount|off|kam)/);
  if (discountMatch) {
    const discount = parseNumber(discountMatch[1]);
    return res.json({
      intent: 'discount',
      discount,
      message: `Discount of ₹${discount} parsed.`
    });
  }

  // 5. Add Product Voice Command
  // E.g., "Naya product add karo, Tata Salt, price 25 rupees, stock 50 packets"
  if (queryText.includes('naya product') || queryText.includes('add product') || queryText.includes('new product')) {
    // Try to extract product name, price, stock
    // A simple parsing scheme: split by comma or spaces
    let productName = '';
    let price = 0;
    let stock = 0;
    let unit = 'packet';

    // Parse product name (usually follows "add karo" or "product" or lies before price)
    const nameMatch = text.match(/(?:product|karo|naam|name)\s+([^,]+)(?:,\s*|price|daam|$)/i);
    if (nameMatch) productName = nameMatch[1].trim();

    // Parse price
    const priceMatch = queryText.match(/(?:price|daam|rupees|₹|rs)\s*(\d+)/);
    if (priceMatch) price = parseInt(priceMatch[1]);

    // Parse stock
    const stockMatch = queryText.match(/(?:stock|qty|quantity)\s*(\d+)\s*(packet|bottle|kg|piece|piece|pc|g)?/);
    if (stockMatch) {
      stock = parseInt(stockMatch[1]);
      if (stockMatch[2]) unit = parseUnit(stockMatch[2]);
    }

    if (productName) {
      return res.json({
        intent: 'add_product',
        product: { name: productName, price, stock, unit },
        message: `New product parsed: ${productName} (₹${price}, Stock: ${stock} ${unit})`
      });
    }
  }

  // 6. Add Customer Voice Command
  // E.g., "Naya customer add karo, naam Rahul" or "New customer Rahul phone 9876543210"
  if (queryText.includes('customer') && (queryText.includes('naya') || queryText.includes('new') || queryText.includes('add'))) {
    const nameMatch = text.match(/(?:naam|name|customer)\s+([A-Za-z]+)/i);
    const mobileMatch = queryText.match(/(?:phone|mobile|number)?\s*([6-9]\d{9})/);
    if (nameMatch) {
      return res.json({
        intent: 'add_customer',
        customer: {
          name: nameMatch[1].trim(),
          mobile: mobileMatch ? mobileMatch[1] : ''
        },
        message: `Customer profile parsed: ${nameMatch[1]}`
      });
    }
  }

  // 7. Core Invoice Billing Parser (Extract products, quantities, units)
  // Split query text by connectors: "aur", "and", "dena", ",", "plus", "do"
  const sentences = queryText.split(/(?:aur|and|,|dena|\+)/);
  const items = [];
  const clarifications = [];

  // Check if Customer Name is in the billing command
  // E.g. "Ramesh ko..." or "Rahul ko..."
  let customerName = null;
  const customerPrefixMatch = queryText.match(/^([a-z]+)\s+ko/i);
  if (customerPrefixMatch) {
    const nameCandidate = customerPrefixMatch[1];
    const match = customers.find(c => c.name.toLowerCase().startsWith(nameCandidate));
    if (match) customerName = match.name;
  }

  for (let part of sentences) {
    part = part.trim();
    if (!part) continue;

    // Ignore customer prefixes in parts
    if (customerName && part.startsWith(customerName.toLowerCase())) {
      part = part.replace(customerName.toLowerCase(), '').trim();
    }
    if (part.startsWith('ko')) part = part.replace(/^ko\s+/, '').trim();
    if (part.includes('add karo') || part.includes('laga do')) {
      part = part.replace(/add karo|laga do/g, '').trim();
    }

    // Match numbers and potential units
    // Regex looking for quantity (number word or digit), optional unit, and product name
    // E.g., "do kilo chawal" -> qty: do, unit: kilo, product: chawal
    // E.g., "ek packet maggi" -> qty: ek, unit: packet, product: maggi
    // E.g., "do coke" -> qty: do, unit: null, product: coke
    // E.g., "5 biscuit" -> qty: 5, unit: null, product: biscuit
    const regex = /(\d+|ek|do|teen|chaar|paanch|chhe|saat|aath|nau|das|sau|one|two|three|four|five|six|seven|eight|nine|ten|sau)\s*(kilo|kg|packet|piece|piece|pc|pcs|bottle|bottles|gram|grams|g|strip|strips|litre|litres|l)?\s+([a-z0-9\s\-]+)/i;
    const match = part.match(regex);

    let qty = 1;
    let unit = null;
    let productSearchTerm = part;

    if (match) {
      qty = parseNumber(match[1]);
      unit = parseUnit(match[2]);
      productSearchTerm = match[3].trim();
    } else {
      // Check if there is just a number and a product name without spaces or simple match
      const simpleNumberMatch = part.match(/^(\d+)\s+([a-z0-9\s\-]+)/i);
      if (simpleNumberMatch) {
        qty = parseInt(simpleNumberMatch[1]);
        productSearchTerm = simpleNumberMatch[2].trim();
      }
    }

    // Skip empty terms or action verbs
    if (!productSearchTerm || ['batao', 'dikhaye', 'add', 'karo', 'dena'].includes(productSearchTerm)) {
      continue;
    }

    // Match search term with inventory products
    // Find all matching products in the store
    const matches = products.filter(p => {
      const pName = p.name.toLowerCase();
      return pName.includes(productSearchTerm) || 
             productSearchTerm.includes(pName) ||
             (p.category && p.category.toLowerCase().includes(productSearchTerm));
    });

    if (matches.length === 0) {
      // Try phonetic or partial split
      const words = productSearchTerm.split(' ');
      const partialMatches = products.filter(p => {
        const pName = p.name.toLowerCase();
        return words.some(w => w.length > 2 && pName.includes(w));
      });
      if (partialMatches.length > 0) {
        matches.push(...partialMatches);
      }
    }

    if (matches.length === 1) {
      const matchProd = matches[0];
      items.push({
        productId: matchProd._id,
        name: matchProd.name,
        price: matchProd.price,
        quantity: qty,
        unit: unit || matchProd.unit || 'packet',
        total: matchProd.price * qty
      });
    } else if (matches.length > 1) {
      // AMBIGUITY! Multiple products match (e.g. Parle-G 50g and Parle-G 100g)
      clarifications.push({
        searchTerm: productSearchTerm,
        quantity: qty,
        unit: unit || 'packet',
        options: matches.map(m => ({
          productId: m._id,
          name: m.name,
          price: m.price,
          unit: m.unit
        }))
      });
    } else {
      // Product not found in stock. Do not invent a product price or quantity silently.
      // Ask user to add it or clarify
      clarifications.push({
        searchTerm: productSearchTerm,
        quantity: qty,
        unit: unit || 'packet',
        notFound: true,
        options: []
      });
    }
  }

  // Return parsed billing draft
  return res.json({
    intent: 'billing',
    customerName,
    items,
    clarifications,
    hasAmbiguity: clarifications.length > 0,
    message: `Parsed ${items.length} items with ${clarifications.length} clarifications required.`
  });
});

export default router;
