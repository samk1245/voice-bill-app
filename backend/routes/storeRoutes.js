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

export default router;
