import express from 'express';
import { Product } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: 2-decimal rounding
const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

// 1. Get all products for a store (authenticated) with search, category filter, and sorting
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { search, category, status, sortBy, sortOrder } = req.query;

    let products = await Product.find({ storeId });

    // Search by name, SKU, or barcode
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }

    // Filter by status ('Active' | 'Inactive')
    if (status && status !== 'All') {
      products = products.filter(p => (p.status || 'Active') === status);
    }

    // Sort
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Error retrieving store products', error: err.message });
  }
});

// 2. Create single product
router.post('/add', authenticate, async (req, res) => {
  try {
    const {
      storeId,
      name,
      sku,
      barcode,
      category,
      unit,
      price,
      costPrice,
      taxRate,
      stock,
      lowStockAlertLimit,
      status,
      image,
      isService,
      batchNumber,
      expiryDate,
      variants
    } = req.body;

    if (!storeId || !name || price === undefined) {
      return res.status(400).json({ message: 'Store ID, Product name, and Price are required.' });
    }

    // Generate automatic SKU if not provided
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
    const generatedSku = sku && sku.trim() ? sku.trim() : `${cleanName}-${Math.floor(100 + Math.random() * 900)}`;

    const initialStock = Number(stock !== undefined ? stock : 0);

    const newProduct = await Product.create({
      storeId,
      name: name.trim(),
      sku: generatedSku,
      barcode: barcode ? barcode.trim() : '',
      category: category ? category.trim() : 'General',
      unit: unit ? unit.trim() : 'piece',
      price: round2(price),
      costPrice: costPrice !== undefined ? round2(costPrice) : round2(Number(price) * 0.8),
      taxRate: taxRate !== undefined ? Number(taxRate) : 5,
      stock: initialStock,
      lowStockAlertLimit: Number(lowStockAlertLimit || 10),
      status: status || 'Active',
      image: image || '',
      isService: Boolean(isService),
      batchNumber: batchNumber || '',
      expiryDate: expiryDate || '',
      variants: Array.isArray(variants) ? variants : [],
      stockHistory: [
        {
          date: new Date().toISOString(),
          type: 'initial',
          quantity: initialStock,
          resultingStock: initialStock,
          reference: 'Initial Inventory Setup'
        }
      ]
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
});

// 3. Update product
router.put('/:id', authenticate, async (req, res) => {
  try {
    const {
      name,
      sku,
      barcode,
      category,
      unit,
      price,
      costPrice,
      taxRate,
      stock,
      lowStockAlertLimit,
      status,
      image,
      isService,
      batchNumber,
      expiryDate,
      variants
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name !== undefined ? name.trim() : product.name,
        sku: sku !== undefined ? sku.trim() : product.sku,
        barcode: barcode !== undefined ? barcode.trim() : product.barcode,
        category: category !== undefined ? category.trim() : product.category,
        unit: unit !== undefined ? unit.trim() : product.unit,
        price: price !== undefined ? round2(price) : product.price,
        costPrice: costPrice !== undefined ? round2(costPrice) : product.costPrice,
        taxRate: taxRate !== undefined ? Number(taxRate) : product.taxRate,
        stock: stock !== undefined ? Number(stock) : product.stock,
        lowStockAlertLimit: lowStockAlertLimit !== undefined ? Number(lowStockAlertLimit) : product.lowStockAlertLimit,
        status: status !== undefined ? status : (product.status || 'Active'),
        image: image !== undefined ? image : product.image,
        isService: isService !== undefined ? Boolean(isService) : Boolean(product.isService),
        batchNumber: batchNumber !== undefined ? batchNumber : (product.batchNumber || ''),
        expiryDate: expiryDate !== undefined ? expiryDate : (product.expiryDate || ''),
        variants: variants !== undefined ? variants : (product.variants || [])
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
});

// 4. Adjust Stock with Audit History
router.post('/adjust-stock', authenticate, async (req, res) => {
  try {
    const { productId, changeQuantity, reason = 'Manual Adjustment' } = req.body;
    if (!productId || changeQuantity === undefined) {
      return res.status(400).json({ message: 'Product ID and change quantity are required.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const delta = Number(changeQuantity);
    const newStock = Math.max(0, Number(product.stock || 0) + delta);

    const historyEntry = {
      date: new Date().toISOString(),
      type: delta >= 0 ? 'restock' : 'adjustment',
      quantity: delta,
      resultingStock: newStock,
      reference: reason
    };

    const updatedHistory = Array.isArray(product.stockHistory)
      ? [...product.stockHistory, historyEntry]
      : [historyEntry];

    const updated = await Product.findByIdAndUpdate(
      productId,
      { stock: newStock, stockHistory: updatedHistory },
      { new: true }
    );

    res.json({ message: 'Stock adjusted successfully', product: updated });
  } catch (err) {
    console.error('Stock adjustment error:', err);
    res.status(500).json({ message: 'Error adjusting stock', error: err.message });
  }
});

// 5. Bulk CSV / JSON Import
router.post('/bulk-import', authenticate, async (req, res) => {
  try {
    const { storeId, products = [] } = req.body;
    if (!storeId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Store ID and a non-empty products list are required.' });
    }

    const imported = [];
    for (const item of products) {
      if (!item.name || item.price === undefined) continue;

      const cleanName = item.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
      const generatedSku = item.sku || `${cleanName}-${Math.floor(100 + Math.random() * 900)}`;
      const initialStock = Number(item.stock || 0);

      const created = await Product.create({
        storeId,
        name: item.name.trim(),
        sku: generatedSku,
        barcode: item.barcode || '',
        category: item.category || 'General',
        unit: item.unit || 'piece',
        price: round2(item.price),
        costPrice: item.costPrice !== undefined ? round2(item.costPrice) : round2(Number(item.price) * 0.8),
        taxRate: item.taxRate !== undefined ? Number(item.taxRate) : 5,
        stock: initialStock,
        lowStockAlertLimit: Number(item.lowStockAlertLimit || 10),
        status: item.status || 'Active',
        stockHistory: [
          {
            date: new Date().toISOString(),
            type: 'bulk_import',
            quantity: initialStock,
            resultingStock: initialStock,
            reference: 'CSV Bulk Import'
          }
        ]
      });
      imported.push(created);
    }

    res.status(201).json({
      message: `Successfully imported ${imported.length} products.`,
      count: imported.length,
      imported
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ message: 'Error during bulk import', error: err.message });
  }
});

// 6. Export Products to CSV
router.get('/export-csv/:storeId', authenticate, async (req, res) => {
  try {
    const { storeId } = req.params;
    const products = await Product.find({ storeId });

    let csvContent = 'Product Name,SKU,Barcode,Category,Unit,Selling Price (INR),Cost Price (INR),Tax Rate (%),Stock,Low Stock Threshold,Status\n';

    products.forEach(p => {
      const row = [
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.sku || ''}"`,
        `"${p.barcode || ''}"`,
        `"${p.category || 'General'}"`,
        `"${p.unit || 'pcs'}"`,
        p.price || 0,
        p.costPrice || 0,
        p.taxRate || 0,
        p.stock || 0,
        p.lowStockAlertLimit || 10,
        p.status || 'Active'
      ].join(',');
      csvContent += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="VoiceBill_Products_${storeId}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Product CSV export error:', err);
    res.status(500).json({ message: 'Error exporting products CSV' });
  }
});

// 7. Delete product
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product successfully deleted.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

export default router;
