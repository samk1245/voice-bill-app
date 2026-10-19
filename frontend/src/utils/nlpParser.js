// Multilingual AI Voice Command & Billing Parser for VoiceBill AI
// Supports Hindi, English, Hinglish, offline processing, multi-item extraction,
// grocery aliases (cheeni, chawal, atta, namak, tel, doodh, etc.),
// price/quantity parsing, discounts, GST instructions, quantity edits, and invoice commands.

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
  'gyaarah': 11, 'eleven': 11, '11': 11,
  'baarah': 12, 'twelve': 12, '12': 12,
  'terah': 13, 'thirteen': 13, '13': 13,
  'chaudah': 14, 'fourteen': 14, '14': 14,
  'pandrah': 15, 'fifteen': 15, '15': 15,
  'solah': 16, 'sixteen': 16, '16': 16,
  'satrah': 17, 'seventeen': 17, '17': 17,
  'athaarah': 18, 'eighteen': 18, '18': 18,
  'unnees': 19, 'nineteen': 19, '19': 19,
  'bees': 20, 'twenty': 20, '20': 20,
  'pachees': 25, 'twenty five': 25, '25': 25,
  'tees': 30, 'thirty': 30, '30': 30,
  'chaalees': 40, 'forty': 40, '40': 40,
  'pachaas': 50, 'fifty': 50, '50': 50,
  'saath': 60, 'sixty': 60, '60': 60,
  'sattar': 70, 'seventy': 70, '70': 70,
  'assi': 80, 'eighty': 80, '80': 80,
  'nabbe': 90, 'ninety': 90, '90': 90,
  'sau': 100, 'hundred': 100, '100': 100
};

const parseNumber = (word) => {
  if (!word) return 1;
  const normalized = word.toLowerCase().trim();
  if (numberMap[normalized] !== undefined) {
    return numberMap[normalized];
  }
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 1 : parsed;
};

const unitMap = {
  'kilo': 'kg', 'kg': 'kg', 'kilos': 'kg', 'kilogram': 'kg',
  'packet': 'packet', 'packets': 'packet', 'pkt': 'packet', 'pkts': 'packet',
  'bottle': 'bottle', 'bottles': 'bottle', 'bot': 'bottle',
  'piece': 'piece', 'pieces': 'piece', 'pc': 'piece', 'pcs': 'piece',
  'gram': 'g', 'grams': 'g', 'g': 'g', 'gm': 'g', 'gms': 'g',
  'strip': 'strip', 'strips': 'strip',
  'litre': 'litre', 'litres': 'litre', 'l': 'litre', 'liter': 'litre', 'liters': 'litre',
  'tin': 'tin', 'tins': 'tin', 'jar': 'jar', 'jars': 'jar'
};

const parseUnit = (word) => {
  if (!word) return null;
  const normalized = word.toLowerCase().trim();
  return unitMap[normalized] || null;
};

// Common Indian Kirana & Grocery Synonyms Map
const groceryAliases = {
  'chawal': 'rice',
  'rice': 'rice',
  'cheeni': 'sugar',
  'shakkar': 'sugar',
  'sugar': 'sugar',
  'atta': 'atta',
  'aata': 'atta',
  'namak': 'salt',
  'salt': 'salt',
  'toor dal': 'toor dal',
  'arhar': 'toor dal',
  'arhar dal': 'toor dal',
  'moong': 'moong dal',
  'moong dal': 'moong dal',
  'tel': 'oil',
  'sarson tel': 'mustard oil',
  'sunflower oil': 'sunflower oil',
  'refined oil': 'sunflower oil',
  'ghee': 'ghee',
  'makhan': 'butter',
  'butter': 'butter',
  'doodh': 'milk',
  'milk': 'milk',
  'paneer': 'paneer',
  'maggi': 'maggi',
  'noodles': 'maggi',
  'biscuit': 'biscuit',
  'biscuits': 'biscuit',
  'good day': 'good day',
  'oreo': 'oreo',
  'chips': 'lays',
  'lays': 'lays',
  'kurkure': 'kurkure',
  'bhujia': 'bhujia',
  'sev': 'bhujia',
  'chai': 'tea',
  'chai patti': 'tea',
  'tea': 'tea',
  'coffee': 'nescafe',
  'coke': 'coke',
  'frooti': 'frooti',
  'sabun': 'dettol',
  'soap': 'dettol',
  'surf': 'surf excel',
  'detergent': 'surf excel',
  'vim': 'vim',
  'bartan bar': 'vim',
  'colgate': 'colgate',
  'paste': 'colgate',
  'notebook': 'notebook',
  'copy': 'notebook',
  'pen': 'pen',
  'mirch': 'mirch',
  'haldi': 'haldi'
};

export const parseVoiceCommand = (rawText, products = [], customers = []) => {
  if (!rawText || typeof rawText !== 'string') {
    return { intent: 'unknown', message: 'Empty voice command received.' };
  }

  const queryText = rawText.toLowerCase().trim();

  // 1. DIRECT ACTION COMMANDS

  // 1a. Clear Cart
  if (
    queryText.includes('clear') ||
    queryText.includes('khali karo') ||
    queryText.includes('sab hata do') ||
    queryText.includes('reset cart')
  ) {
    return {
      intent: 'action',
      action: 'clear_cart',
      message: 'Cart cleared by voice command.'
    };
  }

  // 1b. Print Bill / Receipt
  if (
    queryText.includes('print receipt') ||
    queryText.includes('print karo') ||
    queryText.includes('invoice print') ||
    queryText.includes('print bill')
  ) {
    return {
      intent: 'action',
      action: 'print_bill',
      message: 'Print receipt command triggered.'
    };
  }

  // 1c. WhatsApp Share
  if (
    queryText.includes('whatsapp') &&
    (queryText.includes('bhejo') || queryText.includes('share') || queryText.includes('send'))
  ) {
    return {
      intent: 'action',
      action: 'whatsapp_share',
      message: 'WhatsApp invoice share command triggered.'
    };
  }

  // 1d. Save & Confirm / Finalize Bill
  if (
    (queryText.includes('save') && queryText.includes('bill')) ||
    (queryText.includes('confirm') && (queryText.includes('bill') || queryText.includes('order'))) ||
    queryText.includes('bill confirm') ||
    queryText.includes('bill banao') ||
    queryText.includes('finalize bill')
  ) {
    return {
      intent: 'action',
      action: 'confirm_bill',
      message: 'Save and finalize bill command triggered.'
    };
  }

  // 1e. Show Total
  if (
    queryText.includes('show me the total') ||
    queryText.includes('total batao') ||
    queryText.includes('what is the total') ||
    queryText.includes('kitna hua') ||
    queryText.includes('total amount')
  ) {
    return {
      intent: 'action',
      action: 'show_total',
      message: 'Total calculation requested.'
    };
  }

  // 2. TAX / GST COMMANDS
  if (queryText.includes('gst') || queryText.includes('tax')) {
    const taxMatch = queryText.match(/(\d+)\s*(?:percent|%|pratishat)?\s*(?:gst|tax)/) ||
                     queryText.match(/(?:gst|tax)\s*(?:of|at)?\s*(\d+)/);
    if (taxMatch) {
      const rate = parseInt(taxMatch[1], 10);
      return {
        intent: 'set_tax',
        taxRate: rate,
        message: `Set tax rate to ${rate}% GST.`
      };
    }
  }

  // 3. DISCOUNT COMMANDS
  if (queryText.includes('discount') || queryText.includes('chhoot')) {
    const percentMatch = queryText.match(/(\d+)\s*(?:percent|%)\s*(?:discount|chhoot)/);
    if (percentMatch) {
      return {
        intent: 'apply_discount',
        discountType: 'percentage',
        value: parseInt(percentMatch[1], 10),
        message: `Applied ${percentMatch[1]}% discount.`
      };
    }

    const flatMatch = queryText.match(/(?:discount|chhoot)\s*(?:of|amount)?\s*(\d+)/) ||
                      queryText.match(/(\d+)\s*(?:rupees|rupaye|rs|inr)?\s*(?:ka\s*)?(?:discount|chhoot)/);
    if (flatMatch) {
      return {
        intent: 'apply_discount',
        discountType: 'fixed',
        value: parseInt(flatMatch[1], 10),
        message: `Applied ₹${flatMatch[1]} discount.`
      };
    }
  }

  // 4. ITEM REMOVAL COMMANDS
  if (
    queryText.includes('remove') ||
    queryText.includes('hata do') ||
    queryText.includes('delete') ||
    queryText.includes('cancel')
  ) {
    let target = queryText
      .replace(/remove|hata do|delete|cancel|the|item|product|se|ko|cart/g, '')
      .trim();

    const matched = products.find(p =>
      p.name.toLowerCase().includes(target) || target.includes(p.name.toLowerCase())
    );

    return {
      intent: 'remove_item',
      productName: matched ? matched.name : target,
      productId: matched ? matched._id : null,
      message: `Remove item: ${matched ? matched.name : target}`
    };
  }

  // 5. QUANTITY EDIT COMMANDS
  if (
    queryText.includes('change the quantity') ||
    queryText.includes('change quantity') ||
    queryText.includes('kar do') ||
    queryText.includes('badal do')
  ) {
    const qtyMatch = queryText.match(/(?:to|kar do)\s*(\d+|ek|do|teen|chaar|paanch|chhe|saat|aath|nau|das|twenty|ten|fifteen)/);
    if (qtyMatch) {
      const newQty = parseNumber(qtyMatch[1]);
      let itemTarget = queryText
        .replace(/change the quantity of|change quantity of|change|to|kar do|badal do|quantity|ko|\d+/g, '')
        .trim();

      const matched = products.find(p =>
        p.name.toLowerCase().includes(itemTarget) || itemTarget.includes(p.name.toLowerCase())
      );

      return {
        intent: 'update_quantity',
        productName: matched ? matched.name : itemTarget,
        productId: matched ? matched._id : null,
        newQuantity: newQty,
        message: `Updated quantity of ${matched ? matched.name : itemTarget} to ${newQty}.`
      };
    }
  }

  // 6. UDHAAR / LEDGER COMMANDS
  if (queryText.includes('udhaar') || queryText.includes('credit')) {
    const amountMatch = queryText.match(/(\d+)\s*(?:rupees|rupaye|rs)?/);
    const amount = amountMatch ? parseInt(amountMatch[1], 10) : 0;

    let custName = null;
    customers.forEach(c => {
      if (queryText.includes(c.name.toLowerCase())) {
        custName = c.name;
      }
    });

    if (custName && amount > 0) {
      return {
        intent: 'udhaar_record',
        customerName: custName,
        amount,
        message: `Recorded ₹${amount} credit for ${custName}.`
      };
    }
  }

  // 7. MULTI-ITEM BILLING PARSER
  const segments = queryText
    .split(/\s+aur\s+|\s+and\s+|\s+plus\s+|,\s*/)
    .map(s => s.trim())
    .filter(Boolean);

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

    let searchTarget = remainingWords.join(' ').toLowerCase().trim();
    if (!searchTarget) return;

    // Check grocery alias
    if (groceryAliases[searchTarget]) {
      searchTarget = groceryAliases[searchTarget];
    }

    // Search against products
    const exactMatch = products.find(p => p.name.toLowerCase() === searchTarget);
    const partialMatches = products.filter(p => {
      const pName = p.name.toLowerCase();
      return pName.includes(searchTarget) || searchTarget.includes(pName);
    });

    if (exactMatch) {
      detectedItems.push({
        productId: exactMatch._id,
        sku: exactMatch.sku || 'SKU-000',
        name: exactMatch.name,
        price: explicitPrice !== null ? explicitPrice : exactMatch.price,
        quantity: qty,
        unit: unit || exactMatch.unit || 'pcs',
        taxRate: exactMatch.taxRate || 5,
        stock: exactMatch.stock || 0,
        image: exactMatch.image || ''
      });
    } else if (partialMatches.length === 1) {
      detectedItems.push({
        productId: partialMatches[0]._id,
        sku: partialMatches[0].sku || 'SKU-000',
        name: partialMatches[0].name,
        price: explicitPrice !== null ? explicitPrice : partialMatches[0].price,
        quantity: qty,
        unit: unit || partialMatches[0].unit || 'pcs',
        taxRate: partialMatches[0].taxRate || 5,
        stock: partialMatches[0].stock || 0,
        image: partialMatches[0].image || ''
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

  if (detectedItems.length > 0 || detectedClarifications.length > 0) {
    return {
      intent: 'billing_items',
      customer: detectedCustomer,
      items: detectedItems,
      clarifications: detectedClarifications,
      message: `Detected ${detectedItems.length} item(s) for billing.`
    };
  }

  return {
    intent: 'unknown',
    queryText,
    message: 'Could not understand the command. You can speak products with quantity, e.g. "2 kilo chawal aur ek packet maggi".'
  };
};
