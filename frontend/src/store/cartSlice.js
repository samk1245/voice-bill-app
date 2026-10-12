import { createSlice } from '@reduxjs/toolkit';

// Load all carts from localStorage
const loadCarts = () => {
  const carts = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('cart_')) {
      const slug = key.replace('cart_', '');
      try {
        carts[slug] = JSON.parse(localStorage.getItem(key));
      } catch (err) {
        carts[slug] = [];
      }
    }
  }
  return carts;
};

const initialState = {
  carts: loadCarts() // Map of storeSlug -> array of items
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { storeSlug, product, variantName, quantity } = action.payload;
      if (!state.carts[storeSlug]) {
        state.carts[storeSlug] = [];
      }

      const existingItemIndex = state.carts[storeSlug].findIndex(
        item => item.productId === product._id && item.variantName === (variantName || '')
      );

      if (existingItemIndex > -1) {
        state.carts[storeSlug][existingItemIndex].quantity += quantity;
      } else {
        state.carts[storeSlug].push({
          productId: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          variantName: variantName || '',
          quantity
        });
      }

      localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(state.carts[storeSlug]));
    },
    removeFromCart: (state, action) => {
      const { storeSlug, productId, variantName } = action.payload;
      if (state.carts[storeSlug]) {
        state.carts[storeSlug] = state.carts[storeSlug].filter(
          item => !(item.productId === productId && item.variantName === (variantName || ''))
        );
        localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(state.carts[storeSlug]));
      }
    },
    updateQuantity: (state, action) => {
      const { storeSlug, productId, variantName, quantity } = action.payload;
      if (state.carts[storeSlug]) {
        const item = state.carts[storeSlug].find(
          item => item.productId === productId && item.variantName === (variantName || '')
        );
        if (item) {
          item.quantity = Math.max(1, quantity);
          localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(state.carts[storeSlug]));
        }
      }
    },
    clearCart: (state, action) => {
      const { storeSlug } = action.payload;
      state.carts[storeSlug] = [];
      localStorage.removeItem(`cart_${storeSlug}`);
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
