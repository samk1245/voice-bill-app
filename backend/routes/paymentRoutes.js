import express from 'express';
import Stripe from 'stripe';
import { Order, Product, Store } from '../models/index.js';

const router = express.Router();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// Create Checkout Session (or simulate checkout session)
router.post('/checkout', async (req, res) => {
  try {
    const { storeId, items, shippingAddress, customerName, customerEmail, customerId } = req.body;

    if (!storeId || !items || items.length === 0 || !shippingAddress || !customerName || !customerEmail) {
      return res.status(400).json({ message: 'Missing required checkout information' });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Calculate totals and verify stocks
    let totalAmount = 0;
    const checkoutItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      
      // Calculate unit price based on variant if selected
      let itemPrice = product.price;
      if (item.variantName) {
        const variant = product.variants.find(v => v.name === item.variantName);
        if (variant && variant.price) {
          itemPrice = variant.price;
        }
      }

      totalAmount += itemPrice * item.quantity;
      checkoutItems.push({
        productId: product._id.toString(),
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        variantName: item.variantName || ''
      });
    }

    const sessionId = `sess_${Math.random().toString(36).substr(2, 12)}`;

    // Create Order with status 'Pending'
    const newOrder = await Order.create({
      storeId,
      customerId,
      customerName,
      customerEmail,
      items: checkoutItems,
      totalAmount,
      paymentStatus: 'Pending',
      shippingAddress,
      stripeSessionId: sessionId,
      orderStatus: 'Processing'
    });

    if (stripe) {
      // Real Stripe Checkout Session
      const lineItems = checkoutItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} ${item.variantName ? `(${item.variantName})` : ''}`,
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/store/${store.slug}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/store/${store.slug}/cart`,
        metadata: {
          orderId: newOrder._id.toString(),
          storeId: storeId
        }
      });

      // Update order with the real Stripe Session ID
      await Order.findByIdAndUpdate(newOrder._id.toString(), {
        stripeSessionId: session.id
      });

      return res.json({ id: session.id, url: session.url });
    } else {
      // Fallback/Sandbox checkout url (directs to local success page)
      const simulatedUrl = `/store/${store.slug}/checkout-success?session_id=${sessionId}`;
      return res.json({ id: sessionId, url: simulatedUrl, isMock: true });
    }
  } catch (err) {
    console.error('Checkout creation error:', err);
    res.status(500).json({ message: 'Error initiating checkout session' });
  }
});

// Confirm Payment (updates order and decrements inventory)
router.post('/confirm', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return res.status(404).json({ message: 'Order for session not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.json({ message: 'Order has already been processed', order });
    }

    // Verify session state if Stripe is active
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: 'Stripe payment has not been completed' });
      }
    }

    // Update order status to paid
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id.toString(),
      { paymentStatus: 'Paid' },
      { new: true }
    );

    // Deduct stock inventory for products and variants
    for (const item of order.items) {
      const product = await Product.findById(item.productId.toString());
      if (product) {
        // Decrement general inventory
        const newTotalStock = Math.max(0, product.inventoryCount - item.quantity);
        
        // Decrement variant stock if applicable
        let updatedVariants = product.variants;
        if (item.variantName && product.variants) {
          updatedVariants = product.variants.map(v => {
            if (v.name === item.variantName) {
              return { ...v, stock: Math.max(0, v.stock - item.quantity) };
            }
            return v;
          });
        }

        await Product.findByIdAndUpdate(product._id.toString(), {
          inventoryCount: newTotalStock,
          variants: updatedVariants
        });
      }
    }

    res.json({ message: 'Payment confirmed successfully', order: updatedOrder });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

export default router;
