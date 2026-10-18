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

export default router;
