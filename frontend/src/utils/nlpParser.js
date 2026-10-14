// Advanced Multilingual voice-command parser running on the client
// Supports offline mode parsing, mapping numbers, units, products, credit terms, cash payments,
// item removals, quantity modifications, and voice-triggered invoice actions.

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
  return unitMap[normalized] || normalized;
};

export const parseVoiceCommand = (text, products = [], customers = []) => {
  const queryText = text.toLowerCase().trim();

  // 1. Direct Voice Action Commands
  if (queryText.includes('clear') || queryText.includes('khali karo') || queryText.includes('sab hata do')) {
    return {
      intent: 'action',
      action: 'clear_cart',
      message: 'Cart cleared by voice'
    };
  }

  if (queryText.includes('print karo') || queryText.includes('invoice print')) {
    return {
      intent: 'action',
      action: 'print_bill',
      message: 'Print bill command triggered'
    };
  }

  if (queryText.includes('whatsapp') && (queryText.includes('bhejo') || queryText.includes('share') || queryText.includes('send'))) {
    return {
      intent: 'action',
      action: 'whatsapp_share',
      message: 'WhatsApp share command triggered'
    };
  }

  if (
    (queryText.includes('bill') || queryText.includes('order')) && 
    (queryText.includes('confirm') || queryText.includes('generate') || queryText.includes('banao') || queryText.includes('done'))
  ) {
    return {
      intent: 'action',
      action: 'confirm_bill',
      message: 'Confirm bill command triggered'
    };
  }

  // 2. Item Removal Commands: "chawal hata do", "remove biscuit", "maggi delete karo"
  if (queryText.includes('hata do') || queryText.includes('remove') || queryText.includes('delete karo') || queryText.includes('cancel karo')) {
    let target = queryText
      .replace(/hata do|remove|delete karo|cancel karo|se|ko|cart/g, '')
      .trim();

    // Match with products
    const matched = products.find(p => p.name.toLowerCase().includes(target) || target.includes(p.name.toLowerCase()));
    return {
      intent: 'remove_item',
      productName: matched ? matched.name : target,
      productId: matched ? matched._id : null,
      message: `Item removal triggered for: ${matched ? matched.name : target}`
    };
  }

  // 3. Quantity Update Commands: "chawal 3 kilo kar do", "maggi 5 packet kar do"
  const updateMatch = queryText.match(/([a-z\s]+?)\s+(\d+|ek|do|teen|chaar|paanch|chhe|saat|aath|nau|das|bees)\s*(kilo|kg|packet|piece|bottle|gram|litre)?\s*(?:kar do|karo|change)/);
  if (updateMatch && !queryText.includes('add') && !queryText.includes('dena')) {
    const rawProd = updateMatch[1].trim();
    const qty = parseNumber(updateMatch[2]);
    const unit = parseUnit(updateMatch[3]);
    const matched = products.find(p => p.name.toLowerCase().includes(rawProd) || rawProd.includes(p.name.toLowerCase()));

    if (matched) {
      return {
        intent: 'update_qty',
        productId: matched._id,
        productName: matched.name,
        quantity: qty,
        unit: unit || matched.unit,
        message: `Updated quantity for ${matched.name} to ${qty}`
      };
    }
  }

  // 4. Sales Assistant Queries
  if (
    queryText.includes('sale') || 
    queryText.includes('bik') || 
    queryText.includes('stock') || 
    queryText.includes('kam') || 
    queryText.includes('profit') || 
    queryText.includes('batao')
  ) {
    let salesIntent = 'general';
    if (queryText.includes('aaj') || queryText.includes('today')) salesIntent = 'today_sales';
    else if (queryText.includes('sabse zyada') || queryText.includes('most sold') || queryText.includes('highest')) salesIntent = 'top_products';
    else if (queryText.includes('kam') || queryText.includes('low') || queryText.includes('stock')) salesIntent = 'low_stock';
    else if (queryText.includes('kal') || queryText.includes('yesterday')) salesIntent = 'compare_sales';
    else if (queryText.includes('profit')) salesIntent = 'profit';

    return {
      intent: 'sales_query',
      query: text,
      salesIntent,
      message: 'Sales assistant query parsed'
    };
  }

  // 5. Payments & Cash Change Calculations
  const cashDiyaMatch = queryText.match(/(?:customer ne\s+)?(\d+|ek|do|teen|paanch|sau|hundred)\s*(?:rupaye|rs|rupya|rupees)?\s*(?:cash|diye|diya)/);
  if (cashDiyaMatch) {
    const cashReceived = parseNumber(cashDiyaMatch[1]);
    return {
      intent: 'payment',
      paymentMethod: 'Cash',
      cashReceived,
      message: `Extracted cash payment of ₹${cashReceived}`
    };
  }

  // 6. Credit/Udhaar Commands
  if (queryText.includes('udhaar') || queryText.includes('credit') || queryText.includes('khata')) {
    let customerName = null;
    let amount = null;

    for (const cust of customers) {
      if (queryText.includes(cust.name.toLowerCase()) || queryText.includes(cust.name.split(' ')[0].toLowerCase())) {
        customerName = cust.name;
        break;
      }
    }

    const amountMatch = queryText.match(/(\d+|ek|do|teen|paanch|sau|hundred)\s*(?:rupaye|rs|rupya|rupees)?/);
    if (amountMatch) {
      amount = parseNumber(amountMatch[1]);
    }

    if (amount) {
      return {
        intent: 'credit',
        customerName: customerName || 'Unknown Customer',
        amount,
        message: `Extracted credit details: ₹${amount} for ${customerName || 'customer'}`
      };
    }
  }

  // 7. Discounts
  const discountMatch = queryText.match(/(\d+|ek|do|teen|paanch|sau|hundred)\s*(?:rupaye|rs|rupya|rupees)?\s*(?:discount|off|kam)/);
  if (discountMatch) {
    const discount = parseNumber(discountMatch[1]);
    return {
      intent: 'discount',
      discount,
      message: `Discount of ₹${discount} parsed.`
    };
  }

  // 8. Add Product Voice Command
  if (queryText.includes('naya product') || queryText.includes('add product') || queryText.includes('new product')) {
    let productName = '';
    let price = 0;
    let stock = 0;
    let unit = 'packet';

    const nameMatch = text.match(/(?:product|karo|naam|name)\s+([^,]+)(?:,\s*|price|daam|$)/i);
    if (nameMatch) productName = nameMatch[1].trim();

    const priceMatch = queryText.match(/(?:price|daam|rupees|₹|rs)\s*(\d+)/);
    if (priceMatch) price = parseInt(priceMatch[1]);

    const stockMatch = queryText.match(/(?:stock|qty|quantity)\s*(\d+)\s*(packet|bottle|kg|piece|piece|pc|g)?/);
    if (stockMatch) {
      stock = parseInt(stockMatch[1]);
      if (stockMatch[2]) unit = parseUnit(stockMatch[2]);
    }

    if (productName) {
      return {
        intent: 'add_product',
        product: { name: productName, price, stock, unit },
        message: `New product parsed: ${productName}`
      };
    }
  }

  // 9. Add Customer Command
  if (queryText.includes('customer') && (queryText.includes('naya') || queryText.includes('new') || queryText.includes('add'))) {
    const nameMatch = text.match(/(?:naam|name|customer)\s+([A-Za-z]+)/i);
    const mobileMatch = queryText.match(/(?:phone|mobile|number)?\s*([6-9]\d{9})/);
    if (nameMatch) {
      return {
        intent: 'add_customer',
        customer: {
          name: nameMatch[1].trim(),
          mobile: mobileMatch ? mobileMatch[1] : ''
        },
        message: `Customer parsed: ${nameMatch[1]}`
      };
    }
  }

  // 10. Core Invoice Billing Parser (Extract products, quantities, units)
  const sentences = queryText.split(/(?:aur|and|,|dena|\+)/);
  const items = [];
  const clarifications = [];

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

    if (customerName && part.startsWith(customerName.toLowerCase())) {
      part = part.replace(customerName.toLowerCase(), '').trim();
    }
    if (part.startsWith('ko')) part = part.replace(/^ko\s+/, '').trim();
    if (part.includes('add karo') || part.includes('laga do')) {
      part = part.replace(/add karo|laga do/g, '').trim();
    }

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
      const simpleNumberMatch = part.match(/^(\d+)\s+([a-z0-9\s\-]+)/i);
      if (simpleNumberMatch) {
        qty = parseInt(simpleNumberMatch[1]);
        productSearchTerm = simpleNumberMatch[2].trim();
      }
    }

    if (!productSearchTerm || ['batao', 'dikhaye', 'add', 'karo', 'dena'].includes(productSearchTerm)) {
      continue;
    }

    const matches = products.filter(p => {
      const pName = p.name.toLowerCase();
      return pName.includes(productSearchTerm) || 
             productSearchTerm.includes(pName) ||
             (p.category && p.category.toLowerCase().includes(productSearchTerm));
    });

    if (matches.length === 0) {
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
      clarifications.push({
        searchTerm: productSearchTerm,
        quantity: qty,
        unit: unit || 'packet',
        notFound: true,
        options: []
      });
    }
  }

  return {
    intent: 'billing',
    customerName,
    items,
    clarifications,
    hasAmbiguity: clarifications.length > 0,
    message: `Parsed ${items.length} items with ${clarifications.length} clarifications.`
  };
};
