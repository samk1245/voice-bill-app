import express from 'express';
import { Store } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all stores owned by the current user (Multi-shop support)
router.get('/my-stores', authenticate, async (req, res) => {
  try {
    const stores = await Store.find({ ownerId: req.user.id });
    res.json(stores);
  } catch (err) {
    console.error('Fetch my stores error:', err);
    res.status(500).json({ message: 'Error retrieving your stores' });
  }
});

// 2. Get store details by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (err) {
    console.error('Fetch store error:', err);
    res.status(500).json({ message: 'Error retrieving store details' });
  }
});

// 3. Create a new store
router.post('/add', authenticate, async (req, res) => {
  try {
    const { name, category, address, gstNumber, preferredLanguage, upiId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Store name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const newStore = await Store.create({
      name,
      slug,
      ownerId: req.user.id,
      category: category || 'Kirana/Grocery',
      address: address || '',
      gstNumber: gstNumber || '',
      preferredLanguage: preferredLanguage || 'English',
      upiId: upiId || ''
    });

    res.status(201).json(newStore);
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ message: 'Error creating store' });
  }
});

// 4. Update store configurations
router.put('/:id', authenticate, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Owner validation
    if (store.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this store' });
    }

    const { name, category, address, gstNumber, preferredLanguage, upiId } = req.body;

    const updated = await Store.findByIdAndUpdate(
      req.params.id,
      {
        name: name || store.name,
        category: category || store.category,
        address: address !== undefined ? address : store.address,
        gstNumber: gstNumber !== undefined ? gstNumber : store.gstNumber,
        preferredLanguage: preferredLanguage || store.preferredLanguage,
        upiId: upiId !== undefined ? upiId : store.upiId
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update store error:', err);
    res.status(500).json({ message: 'Error updating store configurations' });
  }
});


// 5. Industry Templates Configuration & Catalog Seeds
const INDUSTRY_TEMPLATES = {
  'Kirana & Grocery': {
    category: 'Kirana & Grocery',
    currency: '₹',
    defaultUnits: ['kg', 'g', 'packet', 'litre', 'piece'],
    taxRates: [0, 5, 12, 18],
    terms: 'Goods once sold will not be exchanged or refunded without bill.',
    seedProducts: [
      { name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'STP-ATT-001', price: 245, costPrice: 215, stock: 45, unit: 'packet', category: 'Staples', taxRate: 5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
      { name: 'Fortune Sunlite Sunflower Oil 1L', sku: 'OIL-SUN-003', price: 145, costPrice: 125, stock: 35, unit: 'packet', category: 'Edible Oils & Ghee', taxRate: 5, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
      { name: 'Amul Butter 100g', sku: 'DAI-BUT-012', price: 56, costPrice: 48, stock: 40, unit: 'packet', category: 'Dairy & Cold Storage', taxRate: 12, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tata Tea Premium 500g', sku: 'BEV-TEA-022', price: 280, costPrice: 245, stock: 30, unit: 'packet', category: 'Beverages', taxRate: 5, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Clothing & Fashion': {
    category: 'Clothing & Fashion',
    currency: '₹',
    defaultUnits: ['piece', 'pair', 'set'],
    taxRates: [5, 12],
    terms: 'Exchange allowed within 7 days with tag and bill. No cash refunds.',
    seedProducts: [
      { name: 'Cotton Slim-Fit Casual Shirt (L)', sku: 'CLO-SHT-001', price: 899, costPrice: 520, stock: 25, unit: 'piece', category: "Men's Wear", taxRate: 5, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80' },
      { name: "Men's Stretch Denim Jeans (32)", sku: 'CLO-JNS-002', price: 1499, costPrice: 850, stock: 18, unit: 'piece', category: "Men's Wear", taxRate: 12, image: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=300&q=80' },
      { name: 'Embroidered Anarkali Kurti (M)', sku: 'CLO-KRT-003', price: 1199, costPrice: 650, stock: 20, unit: 'piece', category: "Women's Ethnic", taxRate: 5, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Leather Formal Belt', sku: 'ACC-BLT-004', price: 499, costPrice: 220, stock: 30, unit: 'piece', category: 'Accessories', taxRate: 12, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Electronics & Mobile': {
    category: 'Electronics & Mobile',
    currency: '₹',
    defaultUnits: ['piece', 'set'],
    taxRates: [18, 28],
    terms: '1 Year Manufacturer Brand Warranty. For service, visit authorized service centers.',
    seedProducts: [
      { name: 'Redmi 13C 5G (4GB/128GB)', sku: 'MOB-RED-001', price: 10499, costPrice: 9200, stock: 12, unit: 'piece', category: 'Smartphones', taxRate: 18, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80' },
      { name: 'boAt Airdopes 141 TWS Earbuds', sku: 'AUD-BOT-002', price: 1299, costPrice: 850, stock: 35, unit: 'piece', category: 'Audio & Wearables', taxRate: 18, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80' },
      { name: 'Fast Charging USB-C Braided Cable 1.5m', sku: 'ACC-CAB-003', price: 299, costPrice: 95, stock: 80, unit: 'piece', category: 'Accessories', taxRate: 18, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=300&q=80' },
      { name: '20000mAh Power Bank 22.5W Fast Charge', sku: 'ACC-PWR-004', price: 1699, costPrice: 1150, stock: 15, unit: 'piece', category: 'Power', taxRate: 18, image: 'https://images.unsplash.com/photo-1609592424364-5853f66c9ff9?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Medical & Pharmacy': {
    category: 'Medical & Pharmacy',
    currency: '₹',
    defaultUnits: ['strip', 'tablet', 'bottle', 'box'],
    taxRates: [5, 12, 18],
    terms: 'Schedule H medicines sold against valid doctor prescription only. Store below 25°C.',
    seedProducts: [
      { name: 'Dolo 650mg Paracetamol Tablets', sku: 'MED-DOL-001', price: 32, costPrice: 22, stock: 120, unit: 'strip', category: 'Analgesics / Fever', taxRate: 12, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80', batchNumber: 'B-7821', expiryDate: '2028-06-30' },
      { name: 'Augmentin 625 Duo Tablets (10s)', sku: 'MED-AUG-002', price: 204, costPrice: 168, stock: 45, unit: 'strip', category: 'Antibiotics', taxRate: 12, image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=300&q=80', batchNumber: 'AUG-491', expiryDate: '2027-11-30' },
      { name: 'Benadryl Cough Syrup 100ml', sku: 'MED-BEN-003', price: 135, costPrice: 108, stock: 35, unit: 'bottle', category: 'Cough & Cold', taxRate: 12, image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=300&q=80', batchNumber: 'BN-102', expiryDate: '2027-08-31' },
      { name: 'Dettol Antiseptic Liquid 250ml', sku: 'MED-DET-004', price: 145, costPrice: 120, stock: 50, unit: 'bottle', category: 'First Aid', taxRate: 18, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=300&q=80', batchNumber: 'DT-890', expiryDate: '2028-12-31' }
    ]
  },
  'Restaurant & Cafe': {
    category: 'Restaurant & Cafe',
    currency: '₹',
    defaultUnits: ['portion', 'plate', 'cup', 'glass'],
    taxRates: [5],
    terms: 'Thank you for dining with us! Service charge is voluntary. GST @ 5% applicable.',
    seedProducts: [
      { name: 'Special Paneer Butter Masala', sku: 'RES-PAN-001', price: 260, costPrice: 110, stock: 999, unit: 'plate', category: 'Main Course', taxRate: 5, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: 'Butter Tandoori Naan', sku: 'RES-NAN-002', price: 45, costPrice: 14, stock: 999, unit: 'piece', category: 'Breads', taxRate: 5, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: 'Hyderabadi Dum Biryani (Chicken)', sku: 'RES-BIR-003', price: 320, costPrice: 140, stock: 999, unit: 'plate', category: 'Biryani & Rice', taxRate: 5, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: 'Kulhad Masala Chai (Special)', sku: 'RES-CHA-004', price: 35, costPrice: 10, stock: 999, unit: 'cup', category: 'Beverages', taxRate: 5, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80', isService: true }
    ]
  },
  'Hardware & Electrical': {
    category: 'Hardware & Electrical',
    currency: '₹',
    defaultUnits: ['piece', 'meter', 'kg', 'box'],
    taxRates: [18, 28],
    terms: 'Inspect all goods upon delivery. Electrical items warranty by manufacturer.',
    seedProducts: [
      { name: 'Havells 9W LED Bulb Cool Day Light', sku: 'ELE-HAV-001', price: 95, costPrice: 65, stock: 60, unit: 'piece', category: 'Lighting', taxRate: 18, image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?auto=format&fit=crop&w=300&q=80' },
      { name: 'Anchor Roma 6A 1-Way Switch (White)', sku: 'ELE-ANC-002', price: 38, costPrice: 22, stock: 150, unit: 'piece', category: 'Switches & Sockets', taxRate: 18, image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80' },
      { name: 'Finolex 1.5 sq mm FR PVC Insulated Wire (90m)', sku: 'ELE-FIN-003', price: 1850, costPrice: 1520, stock: 18, unit: 'box', category: 'Wires & Cables', taxRate: 18, image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=300&q=80' },
      { name: 'Bosch Impact Drill Machine 550W (GSB 550)', sku: 'HAR-BOS-004', price: 2699, costPrice: 2150, stock: 8, unit: 'piece', category: 'Power Tools', taxRate: 18, image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Beauty Salon & Spa': {
    category: 'Beauty Salon & Spa',
    currency: '₹',
    defaultUnits: ['session', 'service', 'hour'],
    taxRates: [18],
    terms: 'Appointments cancelled less than 2 hours prior may incur 20% booking charge.',
    seedProducts: [
      { name: 'Classic Haircut & Styling + Beard Trim', sku: 'SAL-CUT-001', price: 350, costPrice: 50, stock: 999, unit: 'session', category: 'Hair Services', taxRate: 18, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: 'O3+ Brightening Bridal Facial Treatment', sku: 'SAL-FAC-002', price: 1800, costPrice: 420, stock: 999, unit: 'session', category: 'Skin Care', taxRate: 18, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: "L'Oreal Keratin Hair Spa & Mask", sku: 'SAL-SPA-003', price: 1200, costPrice: 310, stock: 999, unit: 'session', category: 'Hair Treatments', taxRate: 18, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: 'Moroccanoil Hair Treatment Oil 100ml', sku: 'SAL-PRD-004', price: 3150, costPrice: 2400, stock: 12, unit: 'piece', category: 'Retail Products', taxRate: 18, image: 'https://images.unsplash.com/photo-1608248597359-561353f86e8a?auto=format&fit=crop&w=300&q=80', isService: false }
    ]
  },
  'Automobile & Repair': {
    category: 'Automobile & Repair',
    currency: '₹',
    defaultUnits: ['piece', 'job', 'litre', 'set'],
    taxRates: [18, 28],
    terms: 'Warranty on genuine spares 6 months. Labor guaranteed for 30 days from invoice date.',
    seedProducts: [
      { name: 'Complete 2-Wheeler General Service & Wash', sku: 'AUT-SER-001', price: 650, costPrice: 120, stock: 999, unit: 'job', category: 'Labor & Services', taxRate: 18, image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&q=80', isService: true },
      { name: 'Castrol Activ 4T 20W-40 Engine Oil 1L', sku: 'AUT-OIL-002', price: 380, costPrice: 295, stock: 35, unit: 'litre', category: 'Lubricants', taxRate: 18, image: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=300&q=80' },
      { name: 'Bosch Disc Brake Pad Set (Front)', sku: 'AUT-BRK-003', price: 540, costPrice: 380, stock: 20, unit: 'set', category: 'Spare Parts', taxRate: 28, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=300&q=80' },
      { name: 'Exide Xpress 35Ah Car Battery (Exchange)', sku: 'AUT-BAT-004', price: 4200, costPrice: 3450, stock: 6, unit: 'piece', category: 'Batteries', taxRate: 28, image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Bookstores & Stationery': {
    category: 'Bookstores & Stationery',
    currency: '₹',
    defaultUnits: ['piece', 'set', 'packet'],
    taxRates: [0, 12, 18],
    terms: 'No exchange or return on opened stationery and revision textbooks.',
    seedProducts: [
      { name: 'Classmate Pulse A4 Spiral Notebook 300p', sku: 'STA-NOT-001', price: 180, costPrice: 130, stock: 50, unit: 'piece', category: 'Notebooks', taxRate: 12, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Uniball Eye Roller Pen 0.5mm (Blue)', sku: 'STA-PEN-002', price: 75, costPrice: 52, stock: 90, unit: 'piece', category: 'Pens & Writing', taxRate: 18, image: 'https://images.unsplash.com/photo-1585336261026-7f53995818d6?auto=format&fit=crop&w=300&q=80' },
      { name: 'Atomic Habits by James Clear (Paperback)', sku: 'BOK-SLF-003', price: 499, costPrice: 340, stock: 15, unit: 'piece', category: 'Books', taxRate: 0, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80' },
      { name: 'Camlin Exam Board & Geometry Box Combo', sku: 'STA-GEO-004', price: 140, costPrice: 95, stock: 40, unit: 'set', category: 'School Supplies', taxRate: 12, image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Wholesale & Distribution': {
    category: 'Wholesale & Distribution',
    currency: '₹',
    defaultUnits: ['carton', 'bag', 'box', 'piece'],
    taxRates: [5, 12, 18],
    terms: 'Payment due strictly within 15 days of invoice date. 1.5% monthly interest on overdue balance.',
    seedProducts: [
      { name: 'Basmati Rice 25kg Master Bag (Carton of 4)', sku: 'WHO-RIC-001', price: 3400, costPrice: 2950, stock: 25, unit: 'bag', category: 'Grains & Pulses', taxRate: 5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Refined Sugar 50kg Jute Sack (A-Grade)', sku: 'WHO-SUG-002', price: 2100, costPrice: 1890, stock: 40, unit: 'bag', category: 'Sweeteners', taxRate: 5, image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=300&q=80' },
      { name: 'Maggi Noodles 70g Master Carton (96 Packs)', sku: 'WHO-MAG-003', price: 1152, costPrice: 980, stock: 30, unit: 'carton', category: 'FMCG Packaged Foods', taxRate: 12, image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&q=80' },
      { name: 'Surf Excel Detergent 1kg Carton (24 Packs)', sku: 'WHO-DET-004', price: 3120, costPrice: 2700, stock: 20, unit: 'carton', category: 'Home Care', taxRate: 18, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'General Retail': {
    category: 'General Retail',
    currency: '₹',
    defaultUnits: ['piece', 'set', 'pack'],
    taxRates: [5, 12, 18],
    terms: 'Thank you for shopping with us! Please preserve bill for warranty & exchanges.',
    seedProducts: [
      { name: 'Stainless Steel Insulated Water Bottle 750ml', sku: 'GEN-BOT-001', price: 449, costPrice: 240, stock: 35, unit: 'piece', category: 'Household', taxRate: 18, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=300&q=80' },
      { name: 'Handcrafted Scented Soy Candle (Lavender)', sku: 'GEN-CND-002', price: 299, costPrice: 120, stock: 40, unit: 'piece', category: 'Home Decor', taxRate: 12, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=80' },
      { name: 'Canvas Travel Backpack (Water Resistant)', sku: 'GEN-BAG-003', price: 899, costPrice: 480, stock: 15, unit: 'piece', category: 'Luggage & Bags', taxRate: 18, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80' },
      { name: 'Ceramic Coffee Mug (Artisanal Matte Black)', sku: 'GEN-MUG-004', price: 199, costPrice: 75, stock: 50, unit: 'piece', category: 'Kitchenware', taxRate: 12, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  'Custom Business': {
    category: 'Custom Business',
    currency: '₹',
    defaultUnits: ['piece', 'service', 'hour', 'kg'],
    taxRates: [0, 5, 12, 18, 28],
    terms: 'Payment terms: Due upon receipt. All disputes subject to local jurisdiction.',
    seedProducts: [
      { name: 'Custom Standard Product Item', sku: 'CUS-PRD-001', price: 500, costPrice: 300, stock: 100, unit: 'piece', category: 'General Goods', taxRate: 18, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' },
      { name: 'Professional Consultation Service', sku: 'CUS-SER-002', price: 1500, costPrice: 0, stock: 999, unit: 'hour', category: 'Services', taxRate: 18, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&q=80', isService: true }
    ]
  }
};

// Apply Industry Template & Optional Catalog Seed
router.post('/:id/apply-template', authenticate, async (req, res) => {
  try {
    const { category, seedCatalog = false } = req.body;
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const template = INDUSTRY_TEMPLATES[category] || INDUSTRY_TEMPLATES['General Retail'];
    
    // Update store profile with template defaults
    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      {
        category: template.category,
        currency: template.currency || '₹',
        defaultUnits: template.defaultUnits,
        taxRates: template.taxRates,
        termsAndConditions: template.terms,
        updatedAt: new Date().toISOString()
      },
      { new: true }
    );

    // Optionally seed industry sample products if requested
    let addedCount = 0;
    if (seedCatalog && template.seedProducts && template.seedProducts.length > 0) {
      const { Product } = await import('../models/index.js');
      for (const sp of template.seedProducts) {
        const existing = await Product.findOne({ storeId: req.params.id, name: sp.name });
        if (!existing) {
          await Product.create({
            storeId: req.params.id,
            status: 'Active',
            lowStockAlertLimit: 10,
            ...sp
          });
          addedCount++;
        }
      }
    }

    res.json({
      message: `Successfully applied ${category} profile!`,
      store: updatedStore,
      template,
      productsSeeded: addedCount
    });
  } catch (err) {
    console.error('Apply template error:', err);
    res.status(500).json({ message: 'Error applying business template', error: err.message });
  }
});

// Get all 12 available industry template definitions
router.get('/meta/templates', (req, res) => {
  const meta = Object.keys(INDUSTRY_TEMPLATES).map(key => ({
    name: key,
    category: INDUSTRY_TEMPLATES[key].category,
    defaultUnits: INDUSTRY_TEMPLATES[key].defaultUnits,
    taxRates: INDUSTRY_TEMPLATES[key].taxRates,
    terms: INDUSTRY_TEMPLATES[key].terms,
    sampleCount: (INDUSTRY_TEMPLATES[key].seedProducts || []).length
  }));
  res.json(meta);
});


// 4b. Full Store Database Backup Export
router.get('/:id/backup', authenticate, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    const { Product, Order, Customer, Expense } = await import('../models/index.js');
    const [products, orders, customers, expenses] = await Promise.all([
      Product.find({ storeId: req.params.id }),
      Order.find({ storeId: req.params.id }),
      Customer.find({ storeId: req.params.id }),
      Expense.find({ storeId: req.params.id })
    ]);

    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      store,
      products,
      orders,
      customers,
      expenses
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="voicebill_backup_${store.slug || 'store'}_${new Date().toISOString().slice(0, 10)}.json"`);
    res.json(backupData);
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ message: 'Error creating database backup', error: err.message });
  }
});

// 4c. Restore Store Database from Backup JSON
router.post('/:id/restore', authenticate, async (req, res) => {
  try {
    const { backup } = req.body;
    if (!backup || !backup.products || !backup.store) {
      return res.status(400).json({ message: 'Invalid backup file structure' });
    }

    const { Product, Customer } = await import('../models/index.js');
    let restoredProducts = 0;
    let restoredCustomers = 0;

    // Restore products
    for (const p of backup.products || []) {
      const existing = await Product.findOne({ storeId: req.params.id, name: p.name });
      if (!existing) {
        await Product.create({ ...p, storeId: req.params.id });
        restoredProducts++;
      }
    }

    // Restore customers
    for (const c of backup.customers || []) {
      const existing = await Customer.findOne({ storeId: req.params.id, name: c.name });
      if (!existing) {
        await Customer.create({ ...c, storeId: req.params.id });
        restoredCustomers++;
      }
    }

    res.json({
      message: 'Restore completed successfully',
      restoredProducts,
      restoredCustomers
    });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ message: 'Error restoring backup data', error: err.message });
  }
});

export default router;
