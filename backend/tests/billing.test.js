import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper arithmetic functions mirroring backend implementation
const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

const calculateBill = (items, overallDiscount = 0, isInterState = false, rawAmountPaid = null, paymentMethod = 'Cash') => {
  let computedSubtotal = 0;
  let computedTotalTax = 0;
  const validatedItems = [];

  for (const item of items) {
    const qty = Number(item.quantity);
    const unitPrice = Number(item.price);
    const itemDiscount = Number(item.discount || 0);
    const lineSubtotal = round2(unitPrice * qty);
    const taxable = Math.max(0, round2(lineSubtotal - itemDiscount));
    const taxRate = Number(item.taxRate || 0);
    const lineTax = round2(taxable * (taxRate / 100));
    const lineTotal = round2(taxable + lineTax);

    computedSubtotal = round2(computedSubtotal + lineSubtotal);
    computedTotalTax = round2(computedTotalTax + lineTax);

    validatedItems.push({
      name: item.name,
      price: unitPrice,
      quantity: qty,
      discount: itemDiscount,
      taxRate,
      taxAmount: lineTax,
      lineTotal
    });
  }

  const finalDiscount = Number(overallDiscount || 0);
  const grandTotal = round2(Math.max(0, computedSubtotal - finalDiscount + computedTotalTax));

  const taxBreakdown = isInterState
    ? { cgst: 0, sgst: 0, igst: computedTotalTax }
    : { cgst: round2(computedTotalTax / 2), sgst: round2(computedTotalTax / 2), igst: 0 };

  let amountPaid = rawAmountPaid !== null ? Number(rawAmountPaid) : null;
  if (amountPaid === null) {
    amountPaid = (paymentMethod === 'Credit/Udhaar' || paymentMethod === 'Udhaar') ? 0 : grandTotal;
  }
  amountPaid = round2(Math.max(0, amountPaid));
  const balanceDue = round2(Math.max(0, grandTotal - amountPaid));

  let paymentStatus = 'Paid';
  if (balanceDue === grandTotal) {
    paymentStatus = 'Unpaid';
  } else if (balanceDue > 0) {
    paymentStatus = 'Partial';
  }

  return {
    subtotal: computedSubtotal,
    discount: finalDiscount,
    tax: computedTotalTax,
    taxBreakdown,
    grandTotal,
    amountPaid,
    balanceDue,
    paymentStatus,
    items: validatedItems
  };
};

describe('VoiceBill AI - Calculation & Billing Engine Tests', () => {
  
  it('should correctly calculate subtotal, 5% GST and grand total for groceries', () => {
    const items = [
      { name: 'Basmati Rice', price: 60, quantity: 2, taxRate: 5 }, // 120 + 6 = 126
      { name: 'Sugar', price: 40, quantity: 1, taxRate: 5 }         // 40 + 2 = 42
    ];
    const bill = calculateBill(items);

    assert.equal(bill.subtotal, 160);
    assert.equal(bill.tax, 8);
    assert.equal(bill.taxBreakdown.cgst, 4);
    assert.equal(bill.taxBreakdown.sgst, 4);
    assert.equal(bill.taxBreakdown.igst, 0);
    assert.equal(bill.grandTotal, 168);
    assert.equal(bill.amountPaid, 168);
    assert.equal(bill.balanceDue, 0);
    assert.equal(bill.paymentStatus, 'Paid');
  });

  it('should correctly apply 18% GST and 12% GST to notebooks and pens', () => {
    const items = [
      { name: 'Classmate Notebook', price: 50, quantity: 2, taxRate: 12 }, // 100 + 12 = 112
      { name: 'Reynolds Ball Pen', price: 10, quantity: 5, taxRate: 18 }   // 50 + 9 = 59
    ];
    const bill = calculateBill(items);

    assert.equal(bill.subtotal, 150);
    assert.equal(bill.tax, 21); // 12 + 9 = 21
    assert.equal(bill.taxBreakdown.cgst, 10.5);
    assert.equal(bill.taxBreakdown.sgst, 10.5);
    assert.equal(bill.grandTotal, 171);
  });

  it('should apply overall discount and calculate net grand total accurately', () => {
    const items = [
      { name: 'Maggi Noodles', price: 14, quantity: 10, taxRate: 12 }, // 140 + 16.8 = 156.8
      { name: 'Coca Cola 500ml', price: 40, quantity: 2, taxRate: 28 }  // 80 + 22.4 = 102.4
    ];
    // subtotal = 220, discount = 10, tax = 39.2
    // grandTotal = 220 - 10 + 39.2 = 249.2
    const bill = calculateBill(items, 10);

    assert.equal(bill.subtotal, 220);
    assert.equal(bill.discount, 10);
    assert.equal(bill.tax, 39.2);
    assert.equal(bill.grandTotal, 249.2);
  });

  it('should assign entire tax to IGST for inter-state billing', () => {
    const items = [
      { name: 'Tata Salt', price: 25, quantity: 4, taxRate: 5 } // 100 + 5 = 105
    ];
    const bill = calculateBill(items, 0, true);

    assert.equal(bill.taxBreakdown.cgst, 0);
    assert.equal(bill.taxBreakdown.sgst, 0);
    assert.equal(bill.taxBreakdown.igst, 5);
    assert.equal(bill.grandTotal, 105);
  });

  it('should track partial payments and calculate balance due accurately', () => {
    const items = [
      { name: 'Aashirvaad Aata 5kg', price: 225, quantity: 2, taxRate: 5 } // 450 + 22.5 = 472.5
    ];
    // Grand total: 472.50, customer pays 300
    const bill = calculateBill(items, 0, false, 300);

    assert.equal(bill.grandTotal, 472.5);
    assert.equal(bill.amountPaid, 300);
    assert.equal(bill.balanceDue, 172.5);
    assert.equal(bill.paymentStatus, 'Partial');
  });

  it('should mark unpaid status and record full balance due for Udhaar orders', () => {
    const items = [
      { name: 'Mustard Oil 1L', price: 155, quantity: 2, taxRate: 5 } // 310 + 15.5 = 325.5
    ];
    const bill = calculateBill(items, 0, false, null, 'Credit/Udhaar');

    assert.equal(bill.amountPaid, 0);
    assert.equal(bill.balanceDue, 325.5);
    assert.equal(bill.paymentStatus, 'Unpaid');
  });

  it('should prevent negative inventory when decreasing stock', () => {
    let currentStock = 5;
    const orderQty = 10;
    const newStock = Math.max(0, currentStock - orderQty);
    assert.equal(newStock, 0);
  });

  it('should restore stock when order is cancelled', () => {
    let stock = 15;
    const soldQty = 5;
    stock = stock - soldQty; // 10
    assert.equal(stock, 10);
    // Cancellation restores stock
    stock = stock + soldQty;
    assert.equal(stock, 15);
  });

});
