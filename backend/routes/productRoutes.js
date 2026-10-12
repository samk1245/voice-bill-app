import express from 'express';
import { Product } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all products for a store (authenticated)
router.get('/store/:storeId', authenticate, async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.params.storeId });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Error retrieving store products' });
  }
});

// 2. Create product
router.post('/add', authenticate, async (req, res) => {
  try {
    const { storeId, name, price, stock, unit, category, lowStockAlertLimit } = req.body;

    if (!storeId || !name || price === undefined) {
      return res.status(400).json({ message: 'Store ID, Product name and price are required' });
    }

    const newProduct = await Product.create({
      storeId,
      name,
      price: Number(price),
      stock: Number(stock !== undefined ? stock : 0),
      unit: unit || 'packet',
      category: category || 'General',
      lowStockAlertLimit: Number(lowStockAlertLimit || 10)
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// 3. Update product
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, price, stock, unit, category, lowStockAlertLimit } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name !== undefined ? name : product.name,
        price: price !== undefined ? Number(price) : product.price,
        stock: stock !== undefined ? Number(stock) : product.stock,
        unit: unit !== undefined ? unit : product.unit,
        category: category !== undefined ? category : product.category,
        lowStockAlertLimit: lowStockAlertLimit !== undefined ? Number(lowStockAlertLimit) : product.lowStockAlertLimit
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// 4. Delete product
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product successfully deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router;
